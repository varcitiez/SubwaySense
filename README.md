# SubwaySense 🚇

A comprehensive NYC Subway safety and navigation app built with React Native and Expo. SubwaySense provides real-time subway information, safety metrics, and location-based services to help commuters navigate the NYC subway system safely and efficiently.

## 🌟 Features

### 🗺️ Interactive Subway Map
- **High-resolution NYC Subway Map**: Zoomable and scrollable subway map
- **Zoom Controls**: Pinch-to-zoom and dedicated zoom buttons
- **Location Integration**: Find your closest subway station using GPS
- **Real-time Updates**: Live connection status and data freshness indicators

### 🚂 Real-time Train Information
- **Live Arrivals**: Real-time train arrival times and delays
- **Service Alerts**: Current service disruptions and delays
- **Line Information**: Detailed information for all NYC subway lines
- **Station Details**: Comprehensive station information and safety metrics

### 🛡️ Safety Features
- **Safety Scoring**: Overall safety scores for each station (1-10 scale)
- **Safety Metrics**: Detailed metrics including lighting, cameras, incidents, and traffic
- **Live Station Status**: Real-time crowding levels and equipment status
- **Safety Alerts**: Priority-based safety notifications and warnings

### 📍 Location Services
- **GPS Integration**: Automatic location detection
- **Closest Station Finder**: Haversine formula-based distance calculations
- **Station Coordinates**: Comprehensive database of NYC subway station locations
- **Permission Handling**: Graceful location permission management

## 🏗️ Architecture

### Tech Stack
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe JavaScript development
- **React Query**: Data fetching and caching
- **Expo Router**: File-based navigation
- **React Context**: State management
- **AsyncStorage**: Local data persistence

### Project Structure
```
├── app/                    # Expo Router pages
│   ├── index.tsx          # Home screen with subway map
│   ├── lines.tsx          # Subway lines overview
│   ├── stations.tsx       # Stations list
│   └── station-detail.tsx # Individual station details
├── components/            # Reusable UI components
│   ├── LiveStationStatus.tsx
│   ├── SafetyAlerts.tsx
│   ├── ServiceAlerts.tsx
│   ├── TrainArrivals.tsx
│   └── LocationMarker.tsx
├── contexts/              # React Context providers
│   ├── LocationContext.tsx
│   └── RealTimeContext.tsx
├── services/              # API and data services
│   └── mtaRealTimeService.ts
├── utils/                 # Utility functions
│   └── stationUtils.ts
├── types/                 # TypeScript type definitions
│   └── mta.ts
└── constants/             # Static data
    └── mtaData.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

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
   npm start
   # or
   yarn start
   ```

4. **Run on specific platforms**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run start-web
   ```

### Development Commands

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run start-web

# Lint code
npm run lint
```

## 📱 App Screens

### 🏠 Home Screen
- Interactive NYC Subway map
- Zoom controls and navigation
- Location button to find closest station
- Real-time connection status
- Closest station information

### 🚇 Lines Screen
- Overview of all NYC subway lines
- Color-coded line indicators
- Safety scores and metrics
- Navigation to individual lines

### 🚉 Stations Screen
- List of all subway stations
- Search and filter functionality
- Safety scores and ratings
- Quick access to station details

### 📊 Station Detail Screen
- Comprehensive station information
- Real-time train arrivals
- Live station status
- Safety alerts and notifications
- Detailed safety metrics

## 🔧 Configuration

### Location Permissions
The app requires location permissions to provide location-based services. Permissions are configured in:

- `app.json`: Expo configuration
- `ios/SafeRouteMTAAppClone/Info.plist`: iOS-specific permissions

### Environment Variables
No environment variables are required for basic functionality. The app uses mock data for demonstration purposes.

## 📊 Data Sources

### Mock Data
The app currently uses comprehensive mock data including:
- **Station Information**: Names, IDs, safety scores, and metrics
- **Train Arrivals**: Simulated arrival times and delays
- **Service Alerts**: Sample alerts with different severity levels
- **Station Status**: Mock crowding levels and equipment status

### Real-time Integration
The app is designed to integrate with:
- **MTA GTFS Realtime API**: For live train data
- **MTA Service Alerts API**: For current service disruptions
- **Location Services**: GPS-based station finding

## 🎨 Design System

### Color Palette
- **Primary**: Dark theme with `#1C1C1E` backgrounds
- **Secondary**: `#2C2C2E` for cards and components
- **Accent**: `#007AFF` for interactive elements
- **Success**: `#34C759` for positive states
- **Warning**: `#FF9500` for medium priority
- **Error**: `#FF3B30` for high priority alerts

### Typography
- **Headers**: 18-24px, bold weights
- **Body**: 14-16px, regular weights
- **Captions**: 12px, medium weights
- **System Font**: SF Pro (iOS) / Roboto (Android)

## 🧪 Testing

### Manual Testing
- Test on both iOS and Android devices
- Verify location permissions and GPS functionality
- Test offline functionality and data persistence
- Validate all navigation flows and user interactions

### Development Testing
```bash
# Run TypeScript type checking
npx tsc --noEmit

# Run ESLint
npm run lint
```

## 📦 Building for Production

### iOS
```bash
# Build for iOS
expo build:ios
```

### Android
```bash
# Build for Android
expo build:android
```

### Web
```bash
# Build for web
expo build:web
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for type safety
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling
- Add comprehensive comments for complex logic

## 🙏 Acknowledgments

- **MTA and NYCOpenData**: For providing the NYC Subway system and data
- **Expo**: For the excellent development platform
- **React Native Community**: For the robust ecosystem
- **NYC Subway Riders**: For inspiration and feedback
- **NYPD and New York Post**: For their timely updates.

## 📞 Support

For support, questions, or feature requests, please:
- Open an issue on GitHub
- Contact the development team
- Check the documentation for common solutions

## 🔮 Future Enhancements

- **Real-time Data Integration**: Connect to live MTA APIs
- **Offline Mode**: Enhanced offline functionality
- **Push Notifications**: Real-time alerts and updates
- **Accessibility**: Enhanced accessibility features
- **Multi-language Support**: Internationalization
- **Social Features**: Community reporting and feedback

---

**SubwaySense** - Making NYC Subway navigation safer and smarter! 🚇✨

