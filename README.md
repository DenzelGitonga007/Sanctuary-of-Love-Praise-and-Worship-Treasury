# 🎵 Sanctuary of Love Worship Center – Praise & Worship Treasury

A modern, production-ready, mobile-first financial transparency and contribution management platform for the Praise & Worship Team at **Sanctuary of Love Worship Center – Dandora, Nairobi, Kenya**.

---

## 🌟 Key Features

### 1. 👁️ Public Financial Transparency (No Login Required)
- **Verified Live Treasury Balance**: Calculated dynamically using double-entry ledger principles (`Opening Balance + Total Inflows - Total Disbursements`).
- **Interactive Monthly Timeline**: Month-by-month financial progression from **April 2026 to September 2026+**.
- **Members Contribution Directory**: Searchable team member roster with personal giving history, participation percentage, and individual statement ledger.
- **Expenditures & Disbursements**: Categorized records of overnight tea supplies, gifts, instruments, sound accessories, and carrier fees.
- **WhatsApp Summary Generator**: One-click formatted report generator ready to post in the Praise & Worship WhatsApp group.
- **Church Noticeboard QR Code**: High-resolution printable QR flyer to display on church noticeboards.

### 2. ⚡ Intelligent ChatGPT & WhatsApp Importer (`/admin/import`)
- Paste any ChatGPT or WhatsApp formatted contribution text (e.g. `1. Min Enos Masasi - 100`, `2. Min Ann Musyoka - `).
- Automatically handles markdown bold asterisks (`*`), bullets, numbered lists, currency symbols (`KES`, `/=`), and blank entries.
- Fuzzy matches raw names against registered church members with alias recognition.
- Real-time pre-import review table with editable amount fields and duplicate protection (Overwrite, Skip, or Add).

### 3. 🛡️ Treasurer Administrative Suite (`/admin`)
- **Member Roster Management**: Add new team members, edit names, toggle active status.
- **Manual Entry & Quick Edits**: Add single contributions or record expenses on the go.
- **Audit Log**: Complete chronological audit trail of all treasurer actions.
- **Dynamic Settings**: Configure expected monthly contribution (default KES 100), expected tea contribution (default KES 100), and church details.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with church palette (Sky Blue, Pure White, Luminous Gold, Rose accents)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Visuals**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti), [QRCode.react](https://www.npmjs.com/package/qrcode.react)
- **Database**: [Supabase PostgreSQL](https://supabase.com/) with offline-first localStorage fallback.

---

## 🚀 Getting Started

### 1. Run Locally

```bash
# Clone or navigate into the repository
cd praise_and_worship

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Treasurer Login

- Navigate to `/login`
- Default Passcode: `treasurer2026` (or click "One-Click Demo Login")

---

## 🚢 Deploying to Vercel

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial release of SOL Praise & Worship Treasury"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your repository and click **Deploy**.

---

## 🗄️ Optional: Connecting Supabase Database

1. Create a free project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in Supabase and run the script in [`supabase/schema.sql`](supabase/schema.sql).
3. Copy your project credentials into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Redeploy to Vercel and add the environment variables in your Vercel Project Settings.

---

## 📖 Scripture Dedication

> *“For we are taking pains to do what is right, not only in the eyes of the Lord but also in the eyes of man.”*  
> **— 2 Corinthians 8:21**

