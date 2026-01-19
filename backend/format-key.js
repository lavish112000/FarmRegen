// Run this script to format your Google private key for Render
// Usage: node format-key.js

const fs = require('fs');
const path = require('path');

// Read the service account file
const serviceAccount = require('./service-account.json');

// Get the private key
const privateKey = serviceAccount.private_key;

// Format for Render (replace actual newlines with \\n)
const formattedKey = privateKey.replace(/\n/g, '\\n');

console.log('\n=== COPY THIS VALUE FOR RENDER ===\n');
console.log(formattedKey);
console.log('\n=== END ===\n');

// Also save to a file for easy copying
fs.writeFileSync('formatted-key.txt', formattedKey);
console.log('✅ Also saved to: formatted-key.txt');
console.log('\nNow:');
console.log('1. Copy the value above (or from formatted-key.txt)');
console.log('2. Go to Render → Environment tab');
console.log('3. Edit GOOGLE_PRIVATE_KEY variable');
console.log('4. Paste this value');
console.log('5. Save (Render will auto-redeploy)');
