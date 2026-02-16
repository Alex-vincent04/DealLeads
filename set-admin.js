// Admin Setup Script
// This script sets admin custom claims for a user

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim(email) {
    try {
        // Get user by email
        const user = await admin.auth().getUserByEmail(email);

        // Set custom claim
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });

        console.log('✅ Success! Admin privileges granted to:', email);
        console.log('User UID:', user.uid);
        console.log('\nThe user needs to sign out and sign in again for changes to take effect.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: node set-admin.js <email>');
    console.log('Example: node set-admin.js kuriakosepalex93@gmail.com');
    process.exit(1);
}

console.log('Setting admin privileges for:', email);
setAdminClaim(email);
