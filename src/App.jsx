import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
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
  CircularProgress
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

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

  // Fetch live vehicle data
  const fetchLiveVehicles = async () => {
    try {
      setLoading(true);
      // API 1
      const response1 = await axios.get('https://oempowersupply.in/naturegreen.php?key=09C5E59F150AFA8481F39ADCF9405858&cmd=ALL,*');
      // API 2
      const response2 = await axios.get('https://oempowersupply.in/naturegreen.php?key=162814E902A9896655663D59F9BE98D5&cmd=ALL,*');
      
      // Combine data from both APIs
      const combinedData = [...response1.data, ...response2.data];
      setVehicles(combinedData);
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vehicle history
  const fetchVehicleHistory = async () => {
    if (!selectedVehicle) return;
    
    try {
      setLoading(true);
      // We'll need to implement the actual history fetching logic here
      // This is a placeholder for now
      console.log(`Fetching history for vehicle ${selectedVehicle} from ${startDate} to ${endDate}`);
      // For demonstration, we'll use mock data
      const mockHistory = [
        { id: 1, lat: 12.9716, lng: 77.5946, speed: 45, time: '2023-05-01 10:00:00' },
        { id: 2, lat: 12.9726, lng: 77.5956, speed: 42, time: '2023-05-01 10:05:00' },
        { id: 3, lat: 12.9736, lng: 77.5966, speed: 40, time: '2023-05-01 10:10:00' },
      ];
      setHistoryData(mockHistory);
    } catch (error) {
      console.error('Error fetching vehicle history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize and set up interval for live data
  useEffect(() => {
    fetchLiveVehicles();
    const interval = setInterval(fetchLiveVehicles, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle play/pause for history playback
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Vehicle Tracking Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      
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
              onClick={fetchVehicleHistory}
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
        </Paper>
        
        <Paper elevation={3} sx={{ p: 2, height: '70vh', position: 'relative' }}>
          {loading && (
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000 }}>
              <CircularProgress />
            </Box>
          )}
          
          <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: '100%', width: '100%' }}>
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
          </MapContainer>
        </Paper>
      </Container>
    </>
  );
}

export default App;