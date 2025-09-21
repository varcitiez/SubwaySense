# SubwaySense MTA App

A comprehensive NYC Subway safety and real-time information app built with React Native and Expo. SubwaySense provides users with safety scores, live train arrivals, AI-powered safety alerts, and ML traffic predictions to help navigate the NYC subway system safely and efficiently.

## 🚇 Features

### 🗺️ Interactive Subway Map
- **Zoomable NYC Subway Map** with full pan and zoom controls
- **Location-based closest station finder** using GPS coordinates
- **Real-time station data** from Transiter API
- **Comprehensive station coverage** across all NYC subway lines

### 🛡️ Safety Intelligence
- **AI-Powered Safety Alerts** via Flask backend with 24-hour incident history
- **ML Traffic Predictions** showing station busyness levels
- **Safety Scoring System** with detailed metrics for each station
- **Real-time incident monitoring** using web scraping and AI analysis

### 📍 Live Transit Information
- **Real-time Train Arrivals** from Transiter API
- **Live Station Status** with crowding and facility information
- **Service Alerts** for delays and disruptions
- **Comprehensive Route Information** for all subway lines

### 🎯 User Experience
- **Dark Theme UI** optimized for subway use
- **Intuitive Navigation** between map, lines, and station details
- **Search Functionality** to quickly find stations
- **Offline Support** with cached data fallbacks

## 🏗️ Architecture

### Frontend (React Native + Expo)
- **React Native** with TypeScript for type safety
- **Expo Router** for navigation
- **Context API** for global state management
- **React Query** for data fetching and caching

### Backend Services
- **Transiter API** for real-time transit data
- **Flask Server** for AI-powered safety analysis
- **ML Traffic Service** for busyness predictions

### Data Sources
- **Transiter Demo API** (`demo.transiter.dev`) for live transit data
- **ML Predictions** from pre-calculated JSON data
- **AI Research Agent** for safety incident analysis

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rork-saferoute-mta-app-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   ```bash
   # iOS
   npx expo start --ios
   
   # Android
   npx expo start --android
   ```

### Flask Backend Setup (Optional)

The app integrates with a Flask backend for AI-powered safety alerts:

1. **Navigate to Flask directory**
   ```bash
   cd subway_sense
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start Flask server**
   ```bash
   python app.py
   ```

The Flask server runs on `http://localhost:4500` and provides safety incident analysis.

## 📱 App Structure

```
├── app/                          # Expo Router pages
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Home screen with subway map
│   ├── lines.tsx                # Subway lines list
│   ├── stations.tsx             # Station list for a line
│   └── station-detail.tsx       # Individual station details
├── components/                   # Reusable UI components
│   ├── LiveStationStatus.tsx    # Live station information
│   ├── SafetyAlerts.tsx         # AI-powered safety alerts
│   ├── TrainArrivals.tsx        # Real-time train arrivals
│   └── ServiceAlerts.tsx        # MTA service alerts
├── contexts/                     # React Context providers
│   ├── RealTimeContext.tsx      # Real-time data management
│   └── LocationContext.tsx      # Location services
├── services/                     # API and data services
│   ├── transiterRouteService.ts  # Transiter routes API
│   ├── transiterStationService.ts # Transiter stations API
│   ├── flaskSafetyService.ts    # Flask safety alerts API
│   ├── mlTrafficService.ts      # ML traffic predictions
│   └── mtaRealTimeService.ts    # MTA real-time data
├── types/                        # TypeScript type definitions
│   └── mta.ts                   # MTA data types
├── utils/                        # Utility functions
│   └── stationUtils.ts          # Station utilities
└── subway_sense/                 # Flask backend
    ├── app.py                   # Flask application
    ├── agent.py                 # AI research agent
    └── requirements.txt         # Python dependencies
```

## 🔧 Configuration

### Location Permissions
The app requires location permissions for the closest station feature:

**iOS** (`ios/SafeRouteMTAAppClone/Info.plist`):
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs access to location to show your position on the subway map.</string>
```

**Android** (handled by Expo):
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "This app needs access to location to show your position on the subway map."
        }
      ]
    ]
  }
}
```

### API Endpoints

- **Transiter API**: `https://demo.transiter.dev/systems/us-ny-subway`
- **Flask Safety API**: `http://localhost:4500/research`
- **ML Predictions**: Local JSON file (`assets/ml_traffic_predictions.json`)

## 📊 Data Flow

### Real-time Data Pipeline
1. **Transiter API** provides live train arrivals and station data
2. **ML Service** processes traffic predictions from JSON data
3. **Flask Backend** analyzes safety incidents using AI agents
4. **React Query** manages caching and data synchronization
5. **Context Providers** distribute data to components

### Safety Alert System
1. **Station Name** sent to Flask backend
2. **AI Research Agent** searches for recent incidents
3. **Analysis** categorizes incidents by severity
4. **Real-time Updates** displayed in Safety Alerts component

## 🎨 UI/UX Features

### Design System
- **Dark Theme** optimized for subway environments
- **Color-coded Lines** matching official MTA colors
- **Accessibility** support with proper contrast ratios
- **Responsive Design** for various screen sizes

### Navigation
- **Tab-based Navigation** between main sections
- **Deep Linking** support for station details
- **Gesture Support** for map interactions
- **Search Functionality** with real-time filtering

## 🧪 Testing

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npx eslint .
```

### Manual Testing
- Test location permissions on device
- Verify Transiter API connectivity
- Test Flask backend integration
- Validate ML predictions display

## 🚀 Deployment

### iOS App Store
1. Build production bundle: `npx expo build:ios`
2. Submit via App Store Connect

### Google Play Store
1. Build production bundle: `npx expo build:android`
2. Submit via Google Play Console

### Web Deployment
```bash
npx expo export:web
# Deploy dist/ folder to your hosting service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Transiter** for providing comprehensive transit data APIs
- **MTA** for official subway system information
- **Expo** for the excellent React Native development platform
- **OpenAI** for AI capabilities in the safety analysis system

## 📞 Support

For support or questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the component examples in `/components`

---

**SubwaySense MTA App** - Making NYC subway navigation safer and smarter! 🚇✨