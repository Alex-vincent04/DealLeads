// Firebase configuration for DealLeads Portal
// Using Firebase Compat SDK (v10.8.0)

const firebaseConfig = {
    apiKey: "AIzaSyDqgdGBBqvAy6qXgAmFc9bQ4gDs-vcbySM",
    authDomain: "deal-leads.firebaseapp.com",
    projectId: "deal-leads",
    storageBucket: "deal-leads.firebasestorage.app",
    messagingSenderId: "904780198964",
    appId: "1:904780198964:web:9a4195e4a616873424c661"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
    console.log('📦 Project ID:', firebaseConfig.projectId);
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Optional: Use Firebase emulators for local development
// Uncomment these lines when running with 'firebase emulators:start'
// auth.useEmulator('http://localhost:9099');
// db.useEmulator('localhost', 8080);

console.log('🔥 Firebase services initialized');
console.log('   - Authentication: Ready');
console.log('   - Firestore: Ready');

