# DealLeads | Premium Fintech Investment Portal

DealLeads is a high-performance, responsive investment portal designed to bridge the gap between capital and credible investment opportunities. It features a curated list of strategic, distressed, and growth-focused deals across diverse industries.

## 🚀 Live Demo
*(Add your GitHub Pages or Firebase Hosting link here)*

---

## ✨ Key Features

### 🏢 Investor Portal
- **Premium UI/UX:** Built with a modern "glassmorphism" aesthetic and optimized typography (Outfit) for a premium feel.
- **Advanced Filtering:** Real-time search and filter system for finding opportunities by sector, location, and deal type.
- **Lead Engagement:** Seamless "Express Interest" system for investors to connect with deal owners directly.
- **Responsive Design:** Optimized for cross-device compatibility from mobile to desktop.

### � Secure Admin CMS
- **CRUD Operations:** Full management of investment deals (Create, Read, Update, Delete) via a dedicated dashboard.
- **Lead Tracking:** Centralized view of all investor inquiries and interest submissions.
- **Subscriber Management:** Integrated newsletter subscription tracking and member management.
- **Payment Verification:** Automated/Manual workflow for verifying service plan payments and transaction IDs.

### ⚙️ Backend & Automation
- **Real-time Sync:** Powered by Firebase Firestore for instantaneous data updates.
- **Secure Auth:** Multi-factor admin authentication via Firebase Auth and Firestore Security Rules.
- **Automated Workflows:** Transaction tracking and lead notification systems.

---

## �️ Tech Stack

- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Backend-as-a-Service:** Firebase (Authentication, Firestore, Hosting)
- **Deployment:** Firebase CLI / GitHub Pages
- **Design Inspiration:** Figma-based modular architecture

---

## � Project Structure

```text
├── public/
│   ├── index.html        # Main investor portal
│   ├── admin.html        # Secure admin dashboard
│   ├── services.html     # Service plan overview
│   ├── payments.html     # Payment verification page
│   ├── script.js         # Core application logic
│   ├── styles.css        # Premium design system
│   └── firebase-config.js# Firebase SDK integration
├── firestore.rules       # Server-side security logic
├── firebase.json         # Deployment configuration
└── README.md             # Project documentation
```

---

## � Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Alex-vincent04/DealLeads.git
   ```

2. **Firebase Setup:**
   - Create a project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Email/Password) and **Firestore Database**.
   - Update `public/firebase-config.js` with your project credentials.

3. **Deploy:**
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Initialize: `firebase init`
   - Deploy: `firebase deploy`

---

## 🤝 Contact

**Alex Vincent**  
LinkedIn: [Your LinkedIn Profile]  
GitHub: [@Alex-vincent04](https://github.com/Alex-vincent04)

---
*Note: This project was developed following clean UI/UX principles and modular coding practices to ensure scalability and maintainability.*
