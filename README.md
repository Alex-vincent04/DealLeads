# DealLeads Portal

Management portal for investment opportunities.

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Hosting Notes (Render + MongoDB Atlas)

This project is configured for **Production-Ready** hosting on Render's Free Tier using MongoDB Atlas for persistent storage.

### Environment Variables Required:
In your Render dashboard (Environment tab), set the following:

- `ADMIN_KEY`: Your secret key for admin access (e.g., `dealLeads2026`)
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `RESEND_API_KEY`: Your Resend API key (e.g., `re_abc123...`)

### Deployment Steps:
1. Push this code to a GitHub repository.
2. Connect the repository to **Render** (Web Service).
3. Add the environment variables above.
4. Render will automatically install dependencies and start the server.

