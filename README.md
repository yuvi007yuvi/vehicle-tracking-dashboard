# Vehicle Tracking Dashboard

A full-stack web application for real-time vehicle monitoring and historical route playback.

## Features

1. **Live Vehicle Tracking Dashboard**
   - Fetches live GPS data every 5 seconds from two API endpoints
   - Displays all active vehicles on an interactive map
   - Shows vehicle information including ID, speed, last updated time, and location address

2. **Vehicle History Playback**
   - Allows users to select a vehicle and date/time range
   - Displays location history on the map
   - Provides animated playback timeline
   - Shows trip metrics (total distance, average speed, idle duration)

3. **Role-Based Access**
   - Firebase Authentication for user management
   - Anonymous sign-in option for demo purposes

4. **Data Persistence**
   - Uses Firebase Firestore for data caching

## Tech Stack

- **Frontend**: React, Vite, Material-UI
- **Mapping**: Leaflet.js with React-Leaflet
- **Backend**: Firebase (Authentication & Firestore)
- **APIs**: 
  - Vehicle GPS data APIs
  - OpenStreetMap Nominatim for reverse geocoding

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd vehicle-tracking-dashboard
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Register your web app in Firebase
3. Copy your Firebase configuration values
4. Replace the placeholder values in the [.env](file:///d:/HRMS%20UPLOADING%20FORM/vehicle-tracking-dashboard/.env) file with your actual Firebase credentials

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

This will create a production-ready build in the `dist` folder.

## Project Structure

```
src/
├── components/       # Reusable UI components
├── config/           # Configuration files (Firebase)
├── services/         # Business logic and API services
├── App.jsx          # Main application component
└── main.jsx         # Entry point
```

## API Endpoints

The application uses the following GPS API endpoints:

1. `https://oempowersupply.in/naturegreen.php?key=09C5E59F150AFA8481F39ADCF9405858&cmd=ALL,*`
2. `https://oempowersupply.in/naturegreen.php?key=162814E902A9896655663D59F9BE98D5&cmd=ALL,*`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Leaflet.js](https://leafletjs.com/) for interactive maps
- [OpenStreetMap](https://www.openstreetmap.org/) for map data and geocoding
- [Firebase](https://firebase.google.com/) for backend services