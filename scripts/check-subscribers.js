const mongoose = require('mongoose');
require('dotenv').config();

async function checkSubs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const subscribers = await mongoose.connection.db.collection('subscribers').find().limit(5).toArray();
        console.log('Last 5 subscribers:');
        console.log(JSON.stringify(subscribers, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkSubs();
