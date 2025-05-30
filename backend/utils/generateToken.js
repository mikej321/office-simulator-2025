const jwt = require("jsonwebtoken");

/* generateToken takes userId as input. It creates
a signed token, encodes the user id in the token,
the process.env.JWT_SECRET portion uses the secret
key (which is stored in environment variables) to sign
the token, and expiresIn is the duration you want the
token to stay active. */

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

module.exports = generateToken;
