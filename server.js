require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'subscribers.json');
const DEALS_FILE = path.join(DATA_DIR, 'deals.json');
const ADMIN_KEY = process.env.ADMIN_KEY || 'dealLeads2026';

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

// Initialize files if they don't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}
if (!fs.existsSync(DEALS_FILE)) {
    fs.writeFileSync(DEALS_FILE, JSON.stringify([]));
}

// Endpoint to handle subscriptions
app.post('/api/subscribe', (req, res) => {
    try {
        const { name, occupation, email, industry, preferences } = req.body;

        if (!email || !name) {
            return res.status(400).json({ error: 'Name and Email are required' });
        }

        const subscribers = JSON.parse(fs.readFileSync(DATA_FILE));

        // Prevent duplicate emails
        if (subscribers.find(s => s.email === email)) {
            return res.status(400).json({ error: 'Email already subscribed' });
        }

        const newSubscriber = {
            name,
            occupation,
            email,
            industry,
            preferences,
            date: new Date().toISOString()
        };

        subscribers.push(newSubscriber);
        fs.writeFileSync(DATA_FILE, JSON.stringify(subscribers, null, 2));

        console.log(`New subscriber: ${email}`);
        res.status(200).json({ message: 'Subscribed successfully' });
    } catch (err) {
        console.error('Subscription error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET all subscribers
app.post('/api/subscribers', (req, res) => {
    try {
        const { auth } = req.body;
        if (auth !== ADMIN_KEY) return res.status(401).json({ error: 'Invalid security key' });

        const subscribers = JSON.parse(fs.readFileSync(DATA_FILE));
        res.status(200).json(subscribers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
});

// DELETE a subscriber
app.delete('/api/subscribers/:email', (req, res) => {
    try {
        const { auth } = req.body;
        if (auth !== ADMIN_KEY) return res.status(401).json({ error: 'Invalid security key' });

        const email = req.params.email;
        let subscribers = JSON.parse(fs.readFileSync(DATA_FILE));
        const initialLength = subscribers.length;
        subscribers = subscribers.filter(s => s.email !== email);

        if (subscribers.length === initialLength) {
            return res.status(404).json({ error: 'Subscriber not found' });
        }

        fs.writeFileSync(DATA_FILE, JSON.stringify(subscribers, null, 2));
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

        const subscribers = JSON.parse(fs.readFileSync(DATA_FILE));

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

// GET all deals
app.get('/api/deals', (req, res) => {
    try {
        const deals = JSON.parse(fs.readFileSync(DEALS_FILE));
        res.status(200).json(deals);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch deals' });
    }
});

// POST new deal
app.post('/api/deals', (req, res) => {
    try {
        const { deal, auth } = req.body;
        if (auth !== ADMIN_KEY) return res.status(401).json({ error: 'Invalid security key' });

        const deals = JSON.parse(fs.readFileSync(DEALS_FILE));
        const newDeal = {
            ...deal,
            id: Date.now().toString(),
            dateAdded: new Date().toISOString()
        };
        deals.push(newDeal);
        fs.writeFileSync(DEALS_FILE, JSON.stringify(deals, null, 2));
        res.status(201).json(newDeal);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add deal' });
    }
});

// DELETE a deal
app.delete('/api/deals/:id', (req, res) => {
    try {
        const { auth } = req.body; // In a real app, use headers
        if (auth !== ADMIN_KEY) return res.status(401).json({ error: 'Invalid security key' });

        const id = req.params.id;
        let deals = JSON.parse(fs.readFileSync(DEALS_FILE));
        deals = deals.filter(d => d.id !== id);
        fs.writeFileSync(DEALS_FILE, JSON.stringify(deals, null, 2));
        res.status(200).json({ message: 'Deal deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete deal' });
    }
});

app.listen(PORT, () => {
    console.log(`DealLeads server running at http://localhost:${PORT}`);
});
