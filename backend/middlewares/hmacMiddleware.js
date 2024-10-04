const crypto = require('crypto');

// Secret key (must be the same as the client application)
const SECRET_KEY = "F1$calApp2024!"; 
// Function to calculate HMAC SHA256
function calculateHMAC(message, key) {
  return crypto.createHmac('sha256', key).update(message).digest('base64');
}

// Middleware to verify HMAC signature
function verifyHMAC(req, res, next) {
  const token = req.headers['authorization'];

  console.log(token)
  
  if (!token) {
    return res.status(401).send('Unauthorized: No HMAC signature provided');
  }

  // Extract the actual token (assuming format: "Bearer <token>")
  const actualToken = token.split(' ')[1];

  // Fixed message 
  const message = "!4202ppTokenAlac$1F"; 

  // Calculate the HMAC using the secret key and compare with the token
  const calculatedSignature = calculateHMAC(message, SECRET_KEY);

  console.log("actualToken", actualToken)
  console.log("calculatedSignature", calculatedSignature)

  if (actualToken === calculatedSignature) {
    next(); 
  } else {
    res.status(401).send('Unauthorized: Invalid HMAC signature');
  }
}

module.exports = { verifyHMAC };
