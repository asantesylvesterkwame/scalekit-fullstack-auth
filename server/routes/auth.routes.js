const authRoute = require("express").Router();

authRoute.get("/", () => {
  const redirectUri = "http://localhost:8080/api/v1/callback";
  const options = {
    scopes: ["openid", "profile", "email", "offline_access"],
  };

  const authorizationUrl = scalekit.getAuthorizationUrl(redirectUri, options);

  res.status(200).json(authorizationUrl);
});

module.exports = authRoute;
