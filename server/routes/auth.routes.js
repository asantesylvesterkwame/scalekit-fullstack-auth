const { verifyToken } = require("../middleware/auth.middleware");
const scalekit = require("../lib/scalekit");
const { refreshTokenStore } = require("../middleware/auth.middleware");
const { encrypt } = require("../utils/encryption");
const authRoute = require("express").Router();

const redirectUri = "http://localhost:3000/callback";
const frontendUrl = "http://localhost:3000";

authRoute.get("/", async (req, res) => {
  try {
    const options = {
      scopes: ["openid", "profile", "email", "offline_access"],
    };

    const authorizationUrl = scalekit.getAuthorizationUrl(redirectUri, options);
    res.redirect(authorizationUrl);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
      message: "An error occurred authenticating user",
    });
  }
});

authRoute.post("/callback", async (req, res) => {
  const { code, error, error_description } = req.body;

  if (error) {
    return res.redirect(
      `${frontendUrl}?error=${encodeURIComponent(
        error
      )}&error_description=${encodeURIComponent(error_description || "")}`
    );
  }

  try {
    const authResult = await scalekit.authenticateWithCode(code, redirectUri);
    const { user, idToken, accessToken, refreshToken, expiresIn } = authResult;

    if (!user || !accessToken) {
      throw new Error("Authentication response missing required fields");
    }

    // Derive a stable userId
    const userId = user.id || user.email || `user_${Date.now()}`;

    // Persist session
    req.session.user = user;
    req.session.idToken = idToken;
    req.session.userId = userId;
    req.user = user;

    // Store refresh token securely
    if (refreshToken) {
      refreshTokenStore.set(userId, refreshToken);
    }

    // Encrypt access token
    const encryptedAccessToken = encrypt(accessToken);
    if (!encryptedAccessToken) {
      throw new Error("Failed to encrypt access token");
    }

    // Set access token cookie
    res.cookie("accessToken", encryptedAccessToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });

    // Also set userId cookie to help the middleware if session is missing
    res.cookie("userId", userId, {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });

    console.log("User authenticated successfully:", {
      id: user.id,
      email: user.email,
      name: user.name,
    });

    res.redirect(`${frontendUrl}/dashboard`);
  } catch (err) {
    console.error("Error exchanging code:", err);
    res.redirect(`${frontendUrl}?error=authentication_failed`);
  }
});

// Check authentication status - now with token verification

authRoute.get("/me", verifyToken, (req, res) => {
  res.status(200).json({
    authenticated: true,
    user: req.user,
  });
});

authRoute.get("/logout", async (req, res) => {
  try {
    const idToken = req.session.idToken;
    const userId = req.session.userId;
    const postLogoutRedirectUri = frontendUrl;

    // Clear refresh token from store
    if (userId) {
      refreshTokenStore.delete(userId);
    }

    // Clear session
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
      }
    });

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("userId");
    res.clearCookie("connect.sid");
    
    const logoutUrl = await scalekit.getLogoutUrl(
      idToken,
      postLogoutRedirectUri
    );
    res.redirect(logoutUrl);
  } catch (error) {
    console.error("Logout URL generation failed:", error);
  }
});

module.exports = authRoute;
