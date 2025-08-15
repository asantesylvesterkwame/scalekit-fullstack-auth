const scalekit = require("../lib/scalekit");
const { decrypt, encrypt } = require("../utils/encryption");
const { addLog } = require("../utils/logger");

// In-memory refresh token store (replace with Redis/DB in prod)
const refreshTokenStore = new Map();

const verifyToken = async (req, res, next) => {
  try {
    const encryptedAccessToken = req.cookies.accessToken;
    if (!encryptedAccessToken) {
      addLog({
        level: "warn",
        message: "No access token provided",
        ip: req.ip,
      });
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
      addLog({
        level: "error",
        message: "Token decryption failed",
        error: decryptError.message,
        ip: req.ip,
      });
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
      addLog({
        level: "error",
        message: "Token validation failed",
        error: validationError.message,
        ip: req.ip,
      });
      isValid = false;
    }

    if (!isValid) {
      // Try refresh
      const userId = req.session.userId || req.cookies.userId;
      const storedRefreshToken = userId ? refreshTokenStore.get(userId) : null;

      if (storedRefreshToken) {
        try {
          addLog({
            level: "info",
            message: "Attempting to refresh token",
            userId,
            ip: req.ip,
          });
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

          addLog({
            level: "info",
            message: "Token refreshed successfully",
            userId,
            email: refreshedUser?.email,
            ip: req.ip,
          });
        } catch (refreshError) {
          addLog({
            level: "error",
            message: "Token refresh failed",
            error: refreshError.message,
            userId: req.session.userId,
            ip: req.ip,
          });
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
        addLog({
          level: "warn",
          message: "No refresh token available",
          userId: req.session.userId || req.cookies.userId,
          ip: req.ip,
        });
        return res.status(401).json({
          authenticated: false,
          message: "Session expired. Please login again.",
        });
      }
    } else {
      // Valid token path
      req.user = user || req.session.user;
      addLog({
        level: "info",
        message: "Token validated successfully",
        userId: user.id,
        email: user.email,
        ip: req.ip,
      });
    }

    next();
  } catch (error) {
    addLog({
      level: "error",
      message: "Auth middleware error",
      error: error.message,
      ip: req.ip,
    });
    res.status(500).json({
      authenticated: false,
      message: "Authentication verification failed",
    });
  }
};

module.exports = { verifyToken, refreshTokenStore };
