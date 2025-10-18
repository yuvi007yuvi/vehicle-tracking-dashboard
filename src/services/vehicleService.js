import axios from 'axios';

// API endpoints
const API_ENDPOINTS = [
  'https://oempowersupply.in/naturegreen.php?key=09C5E59F150AFA8481F39ADCF9405858&cmd=ALL,*',
  'https://oempowersupply.in/naturegreen.php?key=162814E902A9896655663D59F9BE98D5&cmd=ALL,*'
];

// Reverse geocoding using OpenStreetMap Nominatim
const reverseGeocode = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    return response.data.display_name || 'Address not found';
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return 'Address unavailable';
  }
};

// Fetch live vehicle data from all endpoints
export const fetchLiveVehicles = async () => {
  try {
    // Fetch data from all endpoints concurrently
    const responses = await Promise.all(
      API_ENDPOINTS.map(url => axios.get(url).catch(error => {
        console.error(`Error fetching from ${url}:`, error);
        return { data: [] };
      }))
    );

    // Combine data from all responses
    let allVehicles = [];
    responses.forEach(response => {
      if (Array.isArray(response.data)) {
        allVehicles = [...allVehicles, ...response.data];
      }
    });

    // Process vehicle data and add addresses
    const processedVehicles = await Promise.all(
      allVehicles.map(async (vehicle) => {
        // Add address if coordinates are available
        if (vehicle.lat && vehicle.lng) {
          vehicle.address = await reverseGeocode(vehicle.lat, vehicle.lng);
        }
        return vehicle;
      })
    );

    return processedVehicles;
  } catch (error) {
    console.error('Error fetching live vehicles:', error);
    return [];
  }
};

// Fetch vehicle history (placeholder implementation)
export const fetchVehicleHistory = async (vehicleId, startDate, endDate) => {
  try {
    // In a real implementation, we would filter the API data by date
    // For now, we'll return mock data
    console.log(`Fetching history for vehicle ${vehicleId} from ${startDate} to ${endDate}`);
    
    // Mock data for demonstration
    const mockHistory = [
      { id: 1, lat: 12.9716, lng: 77.5946, speed: 45, time: '2023-05-01 10:00:00' },
      { id: 2, lat: 12.9726, lng: 77.5956, speed: 42, time: '2023-05-01 10:05:00' },
      { id: 3, lat: 12.9736, lng: 77.5966, speed: 40, time: '2023-05-01 10:10:00' },
      { id: 4, lat: 12.9746, lng: 77.5976, speed: 38, time: '2023-05-01 10:15:00' },
      { id: 5, lat: 12.9756, lng: 77.5986, speed: 35, time: '2023-05-01 10:20:00' }
    ];
    
    return mockHistory;
  } catch (error) {
    console.error('Error fetching vehicle history:', error);
    return [];
  }
};

// Calculate trip metrics
export const calculateTripMetrics = (historyData) => {
  if (!historyData || historyData.length === 0) {
    return {
      totalDistance: 0,
      averageSpeed: 0,
      idleDuration: 0
    };
  }

  // Calculate total distance (simplified calculation)
  let totalDistance = 0;
  for (let i = 1; i < historyData.length; i++) {
    const prevPoint = historyData[i-1];
    const currPoint = historyData[i];
    
    // Simplified distance calculation (in kilometers)
    const distance = Math.sqrt(
      Math.pow(currPoint.lat - prevPoint.lat, 2) + 
      Math.pow(currPoint.lng - prevPoint.lng, 2)
    ) * 111; // Approximation: 1 degree ≈ 111 km
    
    totalDistance += distance;
  }

  // Calculate average speed
  const totalSpeed = historyData.reduce((sum, point) => sum + (point.speed || 0), 0);
  const averageSpeed = totalSpeed / historyData.length;

  // Calculate idle duration (simplified)
  let idleDuration = 0;
  for (let i = 0; i < historyData.length; i++) {
    if (historyData[i].speed === 0) {
      idleDuration += 5; // Assuming 5-minute intervals
    }
  }

  return {
    totalDistance: totalDistance.toFixed(2),
    averageSpeed: averageSpeed.toFixed(2),
    idleDuration
  };
};