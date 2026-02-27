<div align="center">
  <h1>🚨 Fleek Reporter</h1>
  <p>
    <strong>A modern community incident reporting platform that empowers users to report local issues and stay informed.</strong>
  </p>

  <div>
    <img src="https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  </div>
</div>

<br />

## 📖 Overview

**Fleek Reporter** is a real-time, geolocation-based incident tracking application. It is designed to help communities monitor and resolve local issues seamlessly, ranging from power outages to health emergencies and road issues. With interactive map visualizations, integrated chat features, and role-based categorization, keeping your neighborhood safe and informed has never been easier.

<br />

## ✨ Features

- **📍 Geolocation Awareness** – Pinpoint incidents with high precision using the browser's native geolocation API.
- **🗺️ Interactive Map View** – View all reported incidents vividly on an interactive map layer powered by Leaflet.
- **💬 Real-Time Conversations** – Engage in direct messaging with report authors or other community members regarding ongoing issues.
- **🔐 Secure Authentication** – Robust user identity verification handled via NextAuth.js connected with Supabase.
- **📚 Categorized Reports** – Keep data organized by tagging emergencies under predefined groups: Security, Road, Power, Health.
- **🎨 Sleek Modern UI** – A fully responsive, accessible, and fast design interface composed with Tailwind CSS v4 and Framer Motion.
- **🔍 Advanced Search & Filters** – Find exact cases efficiently via powerful keyword and category filters.

<br />

## 🛠️ Tech Stack

**Frontend Architecture**:
- [Next.js (App Router)](https://nextjs.org/) for optimized React development.
- [React 19](https://react.dev/) for robust UI logic and reactive state management.
- [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) for fluid and modern styling.
- [React Leaflet](https://react-leaflet.js.org/) for highly interactive visualizations.

**Backend & Data Layer**:
- [Supabase](https://supabase.com/) as the scalable backend-as-a-service leveraging PostgreSQL.
- [Prisma ORM](https://www.prisma.io/) to securely define and interact with the database schema.
- [NextAuth.js](https://next-auth.js.org/) for seamless and protected user authentication logic.

<br />

## 🚀 Quickstart

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/fleek-reporter.git
   cd fleek-reporter
   ```

2. **Install Dependencies**
   Make sure you have Node installed, then run:
   ```bash
   npm install
   ```

3. **Set Up the Environment Variables**
   Create a `.env.local` file at the root folder to supply your environment variables:
   ```env
   # Database & Supabase Keys
   DATABASE_URL="postgres://..."
   DIRECT_URL="postgres://..."
   NEXT_PUBLIC_SUPABASE_URL="https://..."
   NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
   SUPABASE_JWT_SECRET="..."

   # Optional Auth Config (If using NextAuth.js)
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="..."
   ```

4. **Initialize Prisma & Database Script**
   Run the Prisma generate script to build the client:
   ```bash
   npx prisma generate
   ```
   *(Ensure you run the queries inside `database-setup.sql` in your Supabase SQL Editor if you are doing a fresh start)*.

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

<br />

## 📁 Repository Structure

```tree
fleek-reporter/
├── app/                  # Next.js App Router (Layouts, Pages, Components)
├── prisma/               # Database Schema structure and auto-generated clients
├── public/               # Static assets & icons
├── scripts/              # Useful maintenance and deployment scripts
├── database-setup.sql    # Base database queries to set up Supabase
└── README.md             # This documentation
```

<br />

## 🤝 Contribution

Contributions makes the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<br />

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

<br />

<div align="center">
  <b>Built with ❤️ for safer, more connected communities</b>
</div>
