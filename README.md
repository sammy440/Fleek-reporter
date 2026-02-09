# 🚨 Fleek Reporter

**Fleek Reporter** is a modern community incident reporting platform that enables users to report and track local issues such as power outages, road problems, security concerns, and health emergencies. Built with Next.js and powered by real-time geolocation features, Fleek Reporter helps communities stay informed and connected.

![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Enabled-3ECF8E?logo=supabase)

---

## ✨ Features

- **📍 Geolocation-Based Reporting** - Report incidents with precise location data using browser geolocation
- **🗺️ Interactive Map View** - Visualize all reports on an interactive map powered by Leaflet
- **💬 Real-time Messaging** - Chat with other users about reports and incidents
- **🔐 Secure Authentication** - User authentication powered by NextAuth.js and Supabase
- **📊 Category-Based Reports** - Organize reports by categories: Security, Road, Power, and Health
- **🎨 Modern UI/UX** - Beautiful, responsive design with smooth animations using Framer Motion
- **📱 Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- **🔍 Search & Filter** - Easily find and filter reports by category, location, or keywords
- **📈 Statistics Dashboard** - View community statistics and trending issues

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15.4.6](https://nextjs.org/)** - React framework with App Router
- **[React 19.1.0](https://react.dev/)** - UI library
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[React Leaflet](https://react-leaflet.js.org/)** - Interactive maps

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend as a Service (BaaS)
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication for Next.js
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database (via Supabase)

### Additional Tools
- **[SWR](https://swr.vercel.app/)** - React Hooks for data fetching
- **[Dexie](https://dexie.org/)** - IndexedDB wrapper for offline support
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Password hashing


### Creating a Report

1. **Sign up or log in** to your account
2. Navigate to the **Reports** section
3. Click **"Create Report"**
4. Fill in the report details:
   - Title
   - Category (Security, Road, Power, Health)
   - Description
   - Location (use "Use my location" for automatic geolocation)
5. Click **"Submit Report"**

### Viewing Reports

- **Map View**: See all reports on an interactive map
- **Feed View**: Browse reports in a list format
- **Filter**: Use the search bar and category filters to find specific reports

### Messaging

- Click on any report to view details
- Start a conversation with the report creator or other users
- Real-time messaging keeps you updated

---

## 📁 Project Structure

```
fleek-reporter/
├── app/
│   ├── _components/       # Reusable React components
│   ├── _lib/             # Utility functions and helpers
│   ├── _styles/          # Global styles
│   ├── account/          # User account pages
│   ├── api/              # API routes
│   ├── faq/              # FAQ page
│   ├── works/            # How it works page
│   ├── layout.js         # Root layout
│   ├── page.js           # Home page
│   └── provider.js       # Context providers
├── prisma/               # Prisma schema and migrations
├── public/               # Static assets
├── scripts/              # Utility scripts
├── database-setup.sql    # Database initialization script
├── middleware.js         # Next.js middleware
└── package.json          # Dependencies and scripts
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vercel](https://vercel.com/) for hosting and deployment
- [Leaflet](https://leafletjs.com/) for the mapping library
- All contributors and community members

---

## 📧 Contact

For questions, suggestions, or support, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ for safer, more connected communities**
