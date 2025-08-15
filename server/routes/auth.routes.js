const { verifyToken } = require("../middleware/auth.middleware");
const scalekit = require("../lib/scalekit");
const { refreshTokenStore } = require("../middleware/auth.middleware");
const { encrypt } = require("../utils/encryption");
const { addLog, getLogs } = require("../utils/logger");
const authRoute = require("express").Router();

const redirectUri = "http://localhost:3000/callback";
const frontendUrl = "http://localhost:3000";

authRoute.get("/", async (req, res) => {
  try {
    const options = {
      scopes: ["openid", "profile", "email", "offline_access"],
    };

    addLog({ level: "info", message: "Initiating authorization" });
    const authorizationUrl = scalekit.getAuthorizationUrl(redirectUri, options);
    res.redirect(authorizationUrl);
  } catch (error) {
    addLog({
      level: "error",
      message: "Authorization failed",
      error: error.message,
    });
    res.status(500).json({
      error: error.message,
      message: "An error occurred authenticating user",
    });
  }
});

authRoute.post("/callback", async (req, res) => {
  const { code, error, error_description } = req.body;

  if (error) {
    addLog({
      level: "error",
      message: "Callback error",
      error,
      error_description,
    });
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

    addLog({
      level: "info",
      message: "User authenticated successfully",
      userId: user.id,
      email: user.email,
    });

    res.redirect(`${frontendUrl}/dashboard`);
  } catch (err) {
    addLog({
      level: "error",
      message: "Error exchanging code",
      error: err.message,
    });
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

    addLog({ level: "info", message: "User logout", userId });

    // Clear refresh token from store
    if (userId) {
      refreshTokenStore.delete(userId);
    }

    // Clear session
    req.session.destroy((err) => {
      if (err) {
        addLog({
          level: "error",
          message: "Session destruction error",
          error: err.message,
        });
      }
    });

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("userId");
    res.clearCookie("connect.sid");

    const logoutUrl = await scalekit.getLogoutUrl({
      idTokenHint: idToken,
      postLogoutRedirectUri: postLogoutRedirectUri,
    });
    res.status(200).json(logoutUrl);
  } catch (error) {
    addLog({
      level: "error",
      message: "Logout URL generation failed",
      error: error.message,
    });
  }
});

authRoute.get("/logs", verifyToken, (req, res) => {
  const logs = getLogs();
  res.status(200).json(logs);
});

module.exports = authRoute;
