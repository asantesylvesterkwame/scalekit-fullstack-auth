const scalekit = require("../lib/scalekit");
const { decrypt, encrypt } = require("../utils/encryption");

// In-memory refresh token store (replace with Redis/DB in prod)
const refreshTokenStore = new Map();

const verifyToken = async (req, res, next) => {
  try {
    const encryptedAccessToken = req.cookies.accessToken;
    if (!encryptedAccessToken) {
      return res.status(401).json({
        authenticated: false,
        message: "No access token provided",
      });
    }

    // Decrypt access token
    let accessToken;
    try {
      accessToken = decrypt(encryptedAccessToken);
      if (!accessToken) throw new Error("Decryption returned null");
    } catch (decryptError) {
      console.error("Token decryption failed:", decryptError);
      res.clearCookie("accessToken");
      return res.status(401).json({
        authenticated: false,
        message: "Invalid access token format",
      });
    }

    // Attempt validation
    let isValid = false;
    let user = null;
    try {
      const tokenValidation = await scalekit.validateAccessToken(accessToken);
      isValid = tokenValidation?.valid === true;
      user = tokenValidation?.user ?? null;
    } catch (validationError) {
      console.error("Token validation failed:", validationError);
      isValid = false;
    }

    if (!isValid) {
      // Try refresh
      const userId = req.session.userId || req.cookies.userId;
      const storedRefreshToken = userId ? refreshTokenStore.get(userId) : null;

      if (storedRefreshToken) {
        try {
          console.log("Attempting to refresh token for user:", userId);
          const refreshResult = await scalekit.refreshAccessToken(
            storedRefreshToken
          );

          // Destructure with defaults to avoid undefined crashes
          const {
            user: refreshedUser = req.session.user || null,
            idToken = null,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn = null,
          } = refreshResult || {};

          if (!newAccessToken) {
            throw new Error(
              "Refresh response did not include new access token"
            );
          }

          // Update stored refresh token if present
          if (newRefreshToken) {
            refreshTokenStore.set(userId, newRefreshToken);
          }

          // Encrypt and set new access token cookie
          const encryptedNewAccessToken = encrypt(newAccessToken);
          if (!encryptedNewAccessToken) {
            throw new Error("Failed to encrypt new access token");
          }

          res.cookie("accessToken", encryptedNewAccessToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // milliseconds
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "strict",
          });

          // Update session state
          if (refreshedUser) req.session.user = refreshedUser;
          if (idToken) req.session.idToken = idToken;
          if (userId) req.session.userId = userId;

          req.user = refreshedUser || req.session.user;

          console.log(
            "Token refreshed successfully for user:",
            (refreshedUser && refreshedUser.email) || "unknown"
          );
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          // Cleanup stale auth state
          res.clearCookie("accessToken");
          res.clearCookie("userId");
          if (req.session.userId) {
            refreshTokenStore.delete(req.session.userId);
          }
          return res.status(401).json({
            authenticated: false,
            message: "Session expired. Please login again.",
          });
        }
      } else {
        console.log(
          "No refresh token available for user:",
          req.session.userId || req.cookies.userId
        );
        return res.status(401).json({
          authenticated: false,
          message: "Session expired. Please login again.",
        });
      }
    } else {
      // Valid token path
      req.user = user || req.session.user;
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      authenticated: false,
      message: "Authentication verification failed",
    });
  }
};

module.exports = { verifyToken, refreshTokenStore };
