require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('<db_password>')) {
    console.error('Error: Please set a valid MONGODB_URI in your .env file (replace <db_password> with your real password).');
    process.exit(1);
}

// Define Schemas (must match server.js)
const subscriberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    occupation: String,
    email: { type: String, required: true, unique: true },
    industry: String,
    preferences: String,
    date: { type: Date, default: Date.now }
});

const dealSchema = new mongoose.Schema({
    title: { type: String, required: true },
    sector: { type: String, required: true },
    location: String,
    type: String,
    status: String,
    dateAdded: { type: Date, default: Date.now }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);
const Deal = mongoose.model('Deal', dealSchema);

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB Atlas...');

        // Migrate Subscribers
        const subscribersFile = path.join(__dirname, 'subscribers.json');
        if (fs.existsSync(subscribersFile)) {
            const subscribers = JSON.parse(fs.readFileSync(subscribersFile));
            console.log(`Found ${subscribers.length} subscribers in JSON.`);

            for (const sub of subscribers) {
                try {
                    await Subscriber.findOneAndUpdate(
                        { email: sub.email },
                        sub,
                        { upsert: true, new: true }
                    );
                } catch (e) {
                    console.error(`Failed to migrate subscriber ${sub.email}:`, e.message);
                }
            }
            console.log('Subscribers migration complete.');
        }

        // Migrate Deals
        const dealsFile = path.join(__dirname, 'deals.json');
        if (fs.existsSync(dealsFile)) {
            const deals = JSON.parse(fs.readFileSync(dealsFile));
            console.log(`Found ${deals.length} deals in JSON.`);

            for (const deal of deals) {
                try {
                    // Using title and sector as a unique-ish key for migration purposes
                    await Deal.findOneAndUpdate(
                        { title: deal.title, sector: deal.sector },
                        {
                            title: deal.title,
                            sector: deal.sector,
                            location: deal.location,
                            type: deal.type,
                            status: deal.status,
                            dateAdded: deal.dateAdded || new Date()
                        },
                        { upsert: true, new: true }
                    );
                } catch (e) {
                    console.error(`Failed to migrate deal ${deal.title}:`, e.message);
                }
            }
            console.log('Deals migration complete.');
        }

        console.log('Migration finished successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    }
}

migrate();
