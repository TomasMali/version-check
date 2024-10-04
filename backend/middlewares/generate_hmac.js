const crypto = require('crypto');

const SECRET_KEY = 'tomas'; // Same key as on the server
const message = 'some-message'; // Fixed message or any identifier

function generateHMAC(key, message) {
  return crypto.createHmac('sha256', key).update(message).digest('base64');
}

const hmacToken = generateHMAC(SECRET_KEY, message);
console.log('HMAC Token:', hmacToken);