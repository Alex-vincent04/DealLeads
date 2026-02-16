// List all users in Firebase Authentication
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function listUsers() {
    try {
        const listUsersResult = await admin.auth().listUsers();

        console.log('📋 Users in Firebase Authentication:\n');

        if (listUsersResult.users.length === 0) {
            console.log('No users found.');
        } else {
            listUsersResult.users.forEach((user, index) => {
                console.log(`${index + 1}. Email: ${user.email}`);
                console.log(`   UID: ${user.uid}`);
                console.log(`   Created: ${user.metadata.creationTime}`);
                console.log(`   Admin: ${user.customClaims?.admin || false}`);
                console.log('');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

listUsers();
