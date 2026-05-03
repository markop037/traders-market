# Traders Market

## What is this project?

Traders Market is a website where people can buy and download ready-made trading strategies for MetaTrader 5 (MT5). MT5 is a popular trading platform used for forex and stock trading, and it supports automated trading through files called `.ex5` bots and indicators.

The problem this solves is simple: most traders either don't know how to code their own strategies or don't have time to do it. This website gives them working, tested strategies they can download and use straight away in MT5.

Here's how the website works from a user's point of view:

1. You land on the homepage and read about what's being offered.
2. You sign up for an account.
3. You go through checkout and pay once.
4. You get access to a dashboard where you can download indicators and trading bots.

There's also a blog section with articles about trading, a bot picker tool to help you find the right strategy for your style, and a PDF guide you can request by entering your email.

---

## Technologies used

### Next.js (Frontend + Backend)
Next.js is the main framework the whole app is built on. It handles everything — the pages users see, the routing, and the API routes that run on the server. The reason I used it is because it lets you build the frontend and backend in one project without needing a separate server. It also makes it easy to do server-side logic right next to the UI.

### React
React is what Next.js is built on top of. All the UI components — the navigation, the dashboard, the forms — are written as React components. It makes it easy to break the interface into small reusable pieces.

### TypeScript
TypeScript is just JavaScript but with types. It helps catch mistakes early while writing the code, like passing the wrong kind of value to a function. It made the project easier to work with as it grew bigger.

### Tailwind CSS
Tailwind is a CSS framework that lets you style things directly in your HTML/JSX using utility classes instead of writing separate CSS files. It's fast to use once you get used to it and keeps styles consistent across the whole site.

### Firebase (Auth + Firestore)
Firebase handles two things here: authentication and the database.

- **Firebase Auth** manages user accounts — signing up, logging in, Google login, password resets.
- **Firestore** is a NoSQL database where user data is stored (like whether a user has paid, their name, email consent, etc.).

I chose Firebase because it handles a lot of the hard auth stuff for you and the free tier is generous enough for a project like this.

### Firebase Cloud Functions
These are serverless functions that run on Google's servers, separate from the Next.js app. They're used mainly to sync user data with MailerLite (the email marketing tool) whenever a user is created, updated, or deleted in Firestore. They also handle some admin scripts like importing users and cleaning up old data.

### Cloudflare R2 (File Storage)
R2 is Cloudflare's object storage service (similar to Amazon S3). The `.ex5` bot and indicator files are stored here. When a logged-in subscriber requests a download, the server checks if they've paid and then streams the file from R2. I used R2 because it has no egress fees, which makes it cheaper than S3 for serving files.

### Resend (Email)
Resend is used to send emails from the app — specifically the PDF guide that gets sent to users who fill in the lead form. It has a simple API and works well with Next.js API routes.

### MailerLite (Email Marketing)
MailerLite is the email marketing platform. When users sign up or their payment status changes, that data gets synced to MailerLite automatically via Firebase Cloud Functions. This lets us send newsletters and follow-up emails to subscribers.

### PostHog (Analytics)
PostHog tracks user events on the site — things like which buttons were clicked, which pages were visited, and whether someone completed the checkout. It gives better insight into how users move through the site compared to something like Google Analytics. It's also self-hostable if needed.

### Vercel (Hosting)
The Next.js app is deployed on Vercel, which is made by the same team that built Next.js. Deploying is straightforward — you connect your GitHub repo and it builds and deploys automatically on every push.

---

## Running the project locally

1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/traders-market.git
   cd traders-market
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then open `.env.local` and fill in your actual values. See `.env.example` for descriptions of each variable.

4. Start the development server:
   ```bash
   npm run dev
   ```

   The app will be running at [http://localhost:3000](http://localhost:3000).

> **Note:** You need a Firebase project, a Cloudflare R2 bucket, a Resend account, and a PostHog project to get everything working. At minimum, the Firebase variables are required to run the app without errors.
