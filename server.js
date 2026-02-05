require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'dealLeads2026';
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB Connection
if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('Connected to MongoDB Atlas'))
        .catch(err => console.error('MongoDB connection error:', err));
} else {
    console.warn('MONGODB_URI not provided. Server may not function correctly.');
}

// Define Schemas
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


// Email Transporter Configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));



app.post('/api/subscribe', async (req, res) => {
    try {
        const { name, occupation, email, industry, preferences } = req.body;

        if (!email || !name) {
            return res.status(400).json({ error: 'Name and Email are required' });
        }

        // Check for duplicate
        const existing = await Subscriber.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'Email already subscribed' });
        }

        const newSubscriber = new Subscriber({
            name,
            occupation,
            email,
            industry,
            preferences
        });

        await newSubscriber.save();

        console.log(`New subscriber: ${email}`);
        res.status(200).json({ message: 'Subscribed successfully' });
    } catch (err) {
        console.error('Subscription error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/subscribers', async (req, res) => {
    try {
        const { auth } = req.body;
        if (auth !== ADMIN_KEY) return res.status(401).json({ error: 'Invalid security key' });

        const subscribers = await Subscriber.find().sort({ date: -1 });
        res.status(200).json(subscribers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
});

app.delete('/api/subscribers/:email', async (req, res) => {
    try {
        const { auth } = req.body;
        if (auth !== ADMIN_KEY) return res.status(401).json({ error: 'Invalid security key' });

        const email = req.params.email;
        const result = await Subscriber.deleteOne({ email });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Subscriber not found' });
        }

        res.status(200).json({ message: 'Subscriber deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete subscriber' });
    }
});

// Endpoint to handle broadcasts
app.post('/api/broadcast', async (req, res) => {
    try {
        const { title, summary, auth } = req.body;

        if (auth !== ADMIN_KEY) {
            return res.status(401).json({ error: 'Invalid security key' });
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(500).json({ error: 'Email service not configured on server' });
        }

        const subscribers = await Subscriber.find();

        if (subscribers.length === 0) {
            return res.status(400).json({ error: 'No subscribers to broadcast to' });
        }

        console.log(`--- STARTING BROADCAST: ${title} ---`);

        // Send emails to all subscribers
        const emailPromises = subscribers.map(sub => {
            const mailOptions = {
                from: `"DealLeads Portal" <${process.env.EMAIL_USER}>`,
                to: sub.email,
                subject: `New Opportunity: ${title}`,
                text: summary,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">${title}</h2>
                        <p style="font-size: 16px; color: #34495e; line-height: 1.6;">${summary}</p>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #7f8c8d;">
                            <p>You are receiving this because you subscribed to DealLeads Portal.</p>
                            <p>© 2026 Exclusive Advisory Services</p>
                        </div>
                    </div>
                `
            };
            return transporter.sendMail(mailOptions);
        });

        const results = await Promise.allSettled(emailPromises);
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failCount = results.length - successCount;

        console.log(`Broadcast finished. Success: ${successCount}, Failed: ${failCount}`);

        res.status(200).json({
            message: `Broadcast complete. Sent ${successCount} emails.`,
            failed: failCount
        });
    } catch (err) {
        console.error('Broadcast error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/deals', async (req, res) => {
    try {
        const deals = await Deal.find().sort({ dateAdded: -1 });
        res.status(200).json(deals);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch deals' });
    }
});

app.post('/api/deals', async (req, res) => {
    try {
        const { deal, auth } = req.body;
        if (auth !== ADMIN_KEY) return res.status(401).json({ error: 'Invalid security key' });

        const newDeal = new Deal({
            title: deal.title,
            sector: deal.sector,
            location: deal.location,
            type: deal.type,
            status: deal.status
        });

        await newDeal.save();
        res.status(201).json(newDeal);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add deal' });
    }
});

app.delete('/api/deals/:id', async (req, res) => {
    try {
        const { auth } = req.body;
        if (auth !== ADMIN_KEY) return res.status(401).json({ error: 'Invalid security key' });

        const id = req.params.id;
        const result = await Deal.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ error: 'Deal not found' });
        }

        res.status(200).json({ message: 'Deal deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete deal' });
    }
});

app.listen(PORT, () => {
    console.log(`DealLeads server running at http://localhost:${PORT}`);
});
