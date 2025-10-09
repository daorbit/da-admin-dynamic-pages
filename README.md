# DA Admin Dynamic Pages - Frontend

This is the frontend application for DA Dynamic Pages, built with **Vite + React.js**.

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📜 Available Scripts

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build locally
- **`npm run lint`** - Run ESLint for code quality

## 🏗️ Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── services/      # API service functions
├── utils/         # Utility functions
├── styles/        # Global styles
├── App.jsx        # Main App component
└── main.jsx       # Application entry point
```

## 🔧 Configuration

- **Vite Config**: `vite.config.ts`
- **Backend URL**: API requests are sent to `https://da-pages-be.vercel.app/api`
- **Port**: Development server runs on port `3000`

## 🔐 Authentication

The admin panel includes basic authentication with hardcoded credentials:
- **Username**: `admin`
- **Password**: `admin123`

Authentication state is persisted in localStorage.

## 🌐 Backend Integration

The frontend is configured to work with the Express backend deployed on Vercel at `https://da-pages-be.vercel.app/api`.