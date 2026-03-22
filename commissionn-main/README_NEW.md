# Deriv Commission Dashboard

A professional, production-ready React dashboard for tracking Deriv commission data with real-time analytics, OAuth authentication, and Appwrite backend integration.

![Dashboard Preview](https://img.shields.io/badge/React-18.x-blue) ![Appwrite](https://img.shields.io/badge/Appwrite-Integrated-orange) ![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Features

### Authentication
- ✅ **Manual API Token Login** - Direct token input
- ✅ **Deriv OAuth Integration** - Secure OAuth 2.0 flow
- ✅ **Auto-login** - Persistent sessions with localStorage
- ✅ **Appwrite Backend** - Token and app data storage
- ✅ **Multi-account Support** - Manage multiple Deriv accounts

### Dashboard Overview
- ✅ **Commission Cards** - Today, This Month, Last Month, Custom Range
- ✅ **Transaction Counts** - Track number of transactions
- ✅ **Formatted Numbers** - Comma-separated USD & KES values
- ✅ **Trend Indicators** - Visual performance indicators

### Analytics & Charts
- ✅ **Bar Charts** - Monthly, Daily, Hourly breakdowns
- ✅ **Loading States** - Professional loading indicators
- ✅ **Tab Switching** - Easy navigation between chart types
- ✅ **App Filtering** - Filter data by specific app ID

### Date Range Selection
- ✅ **Calendar Picker** - Visual date range selection
- ✅ **Horizontal Layout** - 2-month view
- ✅ **Default Range** - Last 7 days
- ✅ **Custom Ranges** - Flexible date selection

### App Management
- ✅ **All APP_IDs Page** - Comprehensive app portfolio view
- ✅ **Portfolio Overview** - Total apps, active apps, revenue, top performer
- ✅ **Individual App Cards** - Detailed breakdown per app
- ✅ **Commission Tracking** - This month & last month per app
- ✅ **Active Status** - Based on current month commission
- ✅ **Clickable Domains** - Direct links to app domains
- ✅ **Search & Filter** - Find apps by ID, domain, or URL
- ✅ **Sorting Options** - Sort by commission, date, or ID

### Theme Support
- ✅ **Light Mode** - Clean, bright interface
- ✅ **Dark Mode** - Easy on the eyes
- ✅ **System Mode** - Follows OS preference
- ✅ **Instant Switching** - No page reload needed

### Professional UI/UX
- ✅ **Modern Design** - Card-based layout
- ✅ **Responsive** - Works on all screen sizes
- ✅ **Hover Effects** - Interactive elements
- ✅ **Loading Indicators** - Clear feedback
- ✅ **Error Handling** - User-friendly error messages

## 📦 Installation

### Prerequisites
- Node.js 14+ and npm
- Deriv API account
- Appwrite account (optional, for backend features)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd deriv-commission-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   REACT_APP_APPWRITE_PROJECT_ID=your_project_id_here
   REACT_APP_APPWRITE_DATABASE_ID=deriv_commission_db
   REACT_APP_APPWRITE_USERS_COLLECTION_ID=users
   REACT_APP_APPWRITE_TOKENS_COLLECTION_ID=tokens
   REACT_APP_APPWRITE_APPS_COLLECTION_ID=apps
   REACT_APP_DERIV_APP_ID=105603
   ```

4. **Set up Appwrite** (Optional)
   
   Follow the detailed guide in [`APPWRITE_SETUP.md`](APPWRITE_SETUP.md)

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Deriv API Setup

1. Get your API token from [Deriv API Console](https://app.deriv.com/account/api-token)
2. For OAuth, register your app at [Deriv App Registration](https://api.deriv.com/app-registration)
3. Add redirect URL: `http://localhost:3000/oauth/callback` (development)

### Appwrite Setup

See [`APPWRITE_SETUP.md`](APPWRITE_SETUP.md) for detailed instructions on:
- Creating database and collections
- Setting up permissions
- Configuring OAuth
- Security best practices

## 📁 Project Structure

```
deriv-commission-dashboard/
├── public/
├── src/
│   ├── components/
│   │   ├── AppCard.js           # Individual app display card
│   │   ├── CommissionCard.js    # Commission display card
│   │   ├── CommissionChart.js   # Bar chart component
│   │   ├── Header.js            # Dashboard header with filters
│   │   ├── LoginModal.js        # Authentication modal
│   │   └── Sidebar.js           # Date range sidebar
│   ├── pages/
│   │   ├── AllApps.js           # All apps portfolio page
│   │   ├── Dashboard.js         # Main dashboard page
│   │   └── OAuthCallback.js     # OAuth callback handler
│   ├── services/
│   │   ├── appwrite.js          # Appwrite service
│   │   └── deriv.js             # Deriv API service
│   ├── App.js                   # Main app component
│   ├── index.js                 # Entry point
│   ├── index.css                # Global styles
│   └── calendar-styles.css      # Calendar-specific styles
├── .env                         # Environment variables
├── .gitignore
├── package.json
├── APPWRITE_SETUP.md           # Appwrite setup guide
└── README.md
```

## 🎯 Usage

### Login

**Option 1: API Token**
1. Get your API token from Deriv
2. Enter it in the login modal
3. Click "Sign In with Token"

**Option 2: OAuth**
1. Click "Sign In with Deriv OAuth"
2. Authorize the app on Deriv
3. Automatically redirected back

### Dashboard

- **View Commission Cards** - See today, this month, last month stats
- **Select Date Range** - Use calendar picker for custom ranges
- **Switch Charts** - Toggle between Monthly, Daily, Hourly views
- **Filter by App** - Click Filters button to select specific app
- **Change Theme** - Click theme icon to switch Light/Dark/System

### All APP_IDs Page

- **View Portfolio** - See total apps, active apps, revenue
- **Search Apps** - Find apps by ID, domain, or URL
- **Sort Apps** - Sort by commission, date, or ID
- **Click Domains** - Open app domains in new tab
- **Check Status** - See which apps are active (have commission this month)

## 🛠️ Technologies

- **React 18** - UI framework
- **Appwrite** - Backend as a Service
- **Deriv API** - Commission data source
- **Recharts** - Chart visualization
- **Day.js** - Date manipulation
- **React DatePicker** - Date range selection
- **React Router** - Routing

## 📊 API Integration

### Deriv API

- **WebSocket Connection** - Real-time data
- **Authorization** - Token-based auth
- **Commission Statistics** - `app_markup_statistics` endpoint
- **App List** - `app_list` endpoint
- **Breakdown Data** - Per-app commission details

### Appwrite

- **Anonymous Sessions** - Guest access
- **Database** - Token and app storage
- **Collections** - Users, Tokens, Apps
- **Queries** - Filter by loginId
- **CRUD Operations** - Create, Read, Update, Delete

## 🔒 Security

- ✅ Environment variables for sensitive data
- ✅ Token encryption in Appwrite
- ✅ HTTPS in production
- ✅ Rate limiting
- ✅ Input validation
- ✅ Error handling
- ✅ Secure OAuth flow

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
vercel --prod
```

### Deploy to Netlify

```bash
netlify deploy --prod
```

### Environment Variables

Remember to set all environment variables in your hosting platform:
- `REACT_APP_APPWRITE_ENDPOINT`
- `REACT_APP_APPWRITE_PROJECT_ID`
- `REACT_APP_APPWRITE_DATABASE_ID`
- `REACT_APP_APPWRITE_USERS_COLLECTION_ID`
- `REACT_APP_APPWRITE_TOKENS_COLLECTION_ID`
- `REACT_APP_APPWRITE_APPS_COLLECTION_ID`
- `REACT_APP_DERIV_APP_ID`

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Developer

Developed by **D-APOLLO** for TRADERSHUB.SITE

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📞 Support

For support:
- **Deriv API**: [Deriv Documentation](https://api.deriv.com/docs)
- **Appwrite**: [Appwrite Documentation](https://appwrite.io/docs)
- **React**: [React Documentation](https://react.dev)

## 🎉 Acknowledgments

- Deriv for the commission API
- Appwrite for the backend infrastructure
- React community for amazing tools and libraries
