/**
 * Middleware to authenticate JWT tokens in incoming requests.
 * This middleware:
 * 1. Extracts the JWT token from the Authorization header
 * 2. Verifies the token using the JWT_SECRET
 * 3. Attaches the decoded user information to the request object
 * 4. Allows the request to proceed if authentication is successful
 */
const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  // Get the Authorization header from the request
  const authHeader = req.headers.authorization;

  if (authHeader) {
    // Extract the token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // Verify the token using the secret key
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        // Token is invalid or expired
        return res.sendStatus(403);
      }

      // Attach the decoded user info to the request
      req.user = user;
      next();
    });
  } else {
    // No Authorization header present
    res.sendStatus(401);
  }
};

module.exports = authenticateJWT;
