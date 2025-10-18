import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format } from 'date-fns';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Paper, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

// Import our services
import { fetchLiveVehicles, fetchVehicleHistory, calculateTripMetrics } from './services/vehicleService';

// Import Firebase auth
import { auth } from './config/firebase';
import { signInAnonymously, signOut, onAuthStateChanged } from 'firebase/auth';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [tripMetrics, setTripMetrics] = useState(null);
  
  const mapRef = useRef();
  const playbackInterval = useRef(null);
  const playbackIndex = useRef(0);

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    
    return () => unsubscribe();
  }, []);

  // Fetch live vehicle data
  const fetchLiveVehiclesData = async () => {
    try {
      setLoading(true);
      const data = await fetchLiveVehicles();
      setVehicles(data);
    } catch (error) {
      showSnackbar('Error fetching vehicle data', 'error');
      console.error('Error fetching vehicle data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vehicle history
  const loadVehicleHistory = async () => {
    if (!selectedVehicle) {
      showSnackbar('Please select a vehicle', 'warning');
      return;
    }
    
    try {
      setLoading(true);
      const data = await fetchVehicleHistory(selectedVehicle, startDate, endDate);
      setHistoryData(data);
      
      // Calculate and set trip metrics
      const metrics = calculateTripMetrics(data);
      setTripMetrics(metrics);
      
      showSnackbar('History data loaded successfully', 'success');
    } catch (error) {
      showSnackbar('Error fetching vehicle history', 'error');
      console.error('Error fetching vehicle history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize and set up interval for live data
  useEffect(() => {
    if (currentUser) {
      fetchLiveVehiclesData();
      const interval = setInterval(fetchLiveVehiclesData, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Handle play/pause for history playback
  const togglePlayback = () => {
    if (!historyData.length) {
      showSnackbar('No history data to play', 'warning');
      return;
    }
    
    if (isPlaying) {
      // Stop playback
      setIsPlaying(false);
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    } else {
      // Start playback
      setIsPlaying(true);
      playbackIndex.current = 0;
      
      playbackInterval.current = setInterval(() => {
        if (playbackIndex.current < historyData.length) {
          // Update map view to current position
          if (mapRef.current && historyData[playbackIndex.current]) {
            const pos = historyData[playbackIndex.current];
            mapRef.current.setView([pos.lat, pos.lng], 15);
          }
          playbackIndex.current++;
        } else {
          // End of playback
          setIsPlaying(false);
          if (playbackInterval.current) {
            clearInterval(playbackInterval.current);
          }
        }
      }, 1000); // Update every second
    }
  };

  // Handle authentication
  const handleAuth = async () => {
    try {
      if (currentUser) {
        await signOut(auth);
        showSnackbar('Signed out successfully', 'info');
      } else {
        await signInAnonymously(auth);
        showSnackbar('Signed in successfully', 'success');
      }
    } catch (error) {
      showSnackbar('Authentication error: ' + error.message, 'error');
      console.error('Authentication error:', error);
    }
  };

  // Show snackbar message
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Vehicle Tracking Dashboard
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleAuth}
            startIcon={currentUser ? <LogoutIcon /> : <LoginIcon />}
          >
            {currentUser ? 'Sign Out' : 'Sign In'}
          </Button>
        </Toolbar>
      </AppBar>
      
      {!currentUser ? (
        <Container maxWidth="md" sx={{ mt: 5, textAlign: 'center' }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              Vehicle Tracking Dashboard
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Please sign in to access the vehicle tracking dashboard
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={handleAuth}
              startIcon={<LoginIcon />}
            >
              Sign In Anonymously
            </Button>
          </Paper>
        </Container>
      ) : (
        <Container maxWidth="xl" sx={{ mt: 3 }}>
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Vehicle</InputLabel>
                <Select
                  value={selectedVehicle}
                  label="Vehicle"
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                >
                  {vehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name || vehicle.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <Button 
                variant="contained" 
                onClick={loadVehicleHistory}
                disabled={!selectedVehicle || loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                Load History
              </Button>
              
              <Button 
                variant="contained" 
                color={isPlaying ? "secondary" : "primary"}
                onClick={togglePlayback}
                disabled={!historyData.length}
                startIcon={isPlaying ? <StopIcon /> : <PlayArrowIcon />}
              >
                {isPlaying ? 'Stop' : 'Play'} Playback
              </Button>
            </Box>
            
            {tripMetrics && (
              <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                <Typography><strong>Total Distance:</strong> {tripMetrics.totalDistance} km</Typography>
                <Typography><strong>Average Speed:</strong> {tripMetrics.averageSpeed} km/h</Typography>
                <Typography><strong>Idle Duration:</strong> {tripMetrics.idleDuration} minutes</Typography>
              </Box>
            )}
          </Paper>
          
          <Paper elevation={3} sx={{ p: 2, height: '70vh', position: 'relative' }}>
            {loading && (
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000 }}>
                <CircularProgress />
              </Box>
            )}
            
            <MapContainer 
              center={[12.9716, 77.5946]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {vehicles.map((vehicle) => (
                <Marker 
                  key={vehicle.id} 
                  position={[vehicle.lat, vehicle.lng]}
                >
                  <Popup>
                    <Box>
                      <Typography variant="h6">{vehicle.name || vehicle.id}</Typography>
                      <Typography>Speed: {vehicle.speed} km/h</Typography>
                      <Typography>Last Updated: {vehicle.time}</Typography>
                      <Typography>Address: {vehicle.address || 'Fetching...'}</Typography>
                    </Box>
                  </Popup>
                </Marker>
              ))}
              
              {historyData.length > 0 && (
                <Polyline
                  positions={historyData.map(point => [point.lat, point.lng])}
                  color="blue"
                />
              )}
            </MapContainer>
          </Paper>
        </Container>
      )}
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;