// Create or update admin user with password
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function setupAdmin(email, password) {
    try {
        let user;

        // Try to get existing user
        try {
            user = await admin.auth().getUserByEmail(email);
            console.log('✅ User found:', email);

            // Update password
            await admin.auth().updateUser(user.uid, {
                password: password
            });
            console.log('✅ Password updated');

        } catch (error) {
            // User doesn't exist, create new one
            console.log('Creating new user...');
            user = await admin.auth().createUser({
                email: email,
                password: password,
                emailVerified: true
            });
            console.log('✅ User created:', email);
        }

        // Set admin custom claim
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });
        console.log('✅ Admin privileges granted');

        console.log('\n📋 User Details:');
        console.log('   Email:', email);
        console.log('   UID:', user.uid);
        console.log('   Password:', password);
        console.log('   Admin:', true);

        console.log('\n🎉 Setup complete! You can now login with these credentials.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Get credentials from command line
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.error('❌ Please provide email and password');
    console.log('Usage: node create-admin.js <email> <password>');
    console.log('Example: node create-admin.js admin@example.com MySecurePass123');
    process.exit(1);
}

console.log('Setting up admin user...\n');
setupAdmin(email, password);
