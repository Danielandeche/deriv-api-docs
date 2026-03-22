# Deriv Commission Dashboard

A professional, production-ready React dashboard for tracking Deriv commission statistics with real-time data visualization.

## ✨ Features

- ✅ **Secure Login** - API token authentication with auto-reconnect on refresh
- ✅ **Commission Cards** - Today, This Month, Last Month, and Custom date ranges
- ✅ **Interactive Charts** - Monthly commission visualization with Recharts
- ✅ **Theme Switcher** - Light, Dark, and System themes
- ✅ **Custom Date Range** - Flexible date selection for custom analytics
- ✅ **Refresh-Safe** - Maintains login state across page refreshes
- ✅ **Clean Architecture** - Well-organized component structure

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Deriv API Token (get one from [Deriv API](https://app.deriv.com/account/api-token))

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd deriv-commission-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Getting Your Deriv API Token

1. Go to [Deriv API Token Management](https://app.deriv.com/account/api-token)
2. Create a new token with the following scopes:
   - Read
   - Admin
3. Copy the token and use it to login to the dashboard

## 📁 Project Structure

```
deriv-commission-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── CommissionCard.js      # Commission display cards
│   │   ├── CommissionChart.js     # Bar chart visualization
│   │   ├── Header.js              # Top navigation bar
│   │   ├── LoginModal.js          # Login interface
│   │   └── Sidebar.js             # Custom date range selector
│   ├── pages/
│   │   └── Dashboard.js           # Main dashboard logic
│   ├── services/
│   │   └── deriv.js               # Deriv API connection
│   ├── App.js                     # App entry point
│   ├── index.js                   # React DOM render
│   └── index.css                  # Global styles
├── package.json
└── README.md
```

## 🎯 Usage

### Login
1. Enter your Deriv API token in the login modal
2. Click "Login" to connect
3. Your token is securely stored in localStorage for auto-login

### View Commission Stats
- **Today**: Current day's commission
- **This Month**: Current month's total commission
- **Last Month**: Previous month's total commission
- **Custom**: Select custom date range in the sidebar

### Custom Date Range
1. Use the sidebar to select start and end dates
2. Click "Check Commission" to view custom period stats
3. The chart updates to show your custom range

### Theme Switching
- Select from **System**, **Light**, or **Dark** themes
- Theme preference is applied immediately

### Logout
- Click the "Logout" button in the header
- Your token will be removed and you'll return to the login screen

## 🛠️ Technologies Used

- **React 18** - UI framework
- **@deriv/deriv-api** - Official Deriv API SDK
- **Recharts** - Chart visualization library
- **Day.js** - Date manipulation library
- **CSS3** - Styling with theme support

## 📊 API Configuration

The dashboard uses Deriv's official API with app_id `105603`. To use your own app_id:

1. Open `src/services/deriv.js`
2. Replace the app_id in the `connectDeriv` function:
   ```javascript
   api = new DerivAPI({ app_id: YOUR_APP_ID });
   ```

## 🔒 Security Notes

- API tokens are stored in localStorage
- Never commit your API token to version control
- Consider implementing backend token management for production
- Use environment variables for sensitive configuration

## 🚀 Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## 📝 Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (one-way operation)

## 🎨 Customization

### Adding New Commission Cards
Edit `src/pages/Dashboard.js` and add new state and API calls.

### Modifying Chart Types
Edit `src/components/CommissionChart.js` to use different Recharts components (LineChart, AreaChart, etc.).

### Styling
Modify `src/index.css` to customize colors, spacing, and layout.

## 🐛 Troubleshooting

### Connection Issues
- Verify your API token is valid
- Check your internet connection
- Ensure the Deriv API is accessible

### Chart Not Displaying
- Check browser console for errors
- Verify commission data is being returned from API
- Ensure Recharts is properly installed

### Theme Not Applying
- Check browser console for errors
- Verify CSS classes are being applied to body element

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For support, please contact the Deriv API support team or open an issue in this repository.

---

**Built with ❤️ using React and Deriv API**
