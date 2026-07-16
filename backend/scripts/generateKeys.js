const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const keysDir = path.join(__dirname, '../.keys');

// Create .keys directory if it doesn't exist
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

// Generate RS256 key pair (2048-bit RSA)
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Write to files
fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);
fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);

console.log('✓ RSA key pair generated');
console.log(`  Private key: ${keysDir}/private.pem`);
console.log(`  Public key:  ${keysDir}/public.pem`);
console.log('\n⚠️  Add .keys/ to .gitignore to prevent key leakage in version control');