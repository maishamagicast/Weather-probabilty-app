export const mockUsers = [
  {
    id: 1,
    email: "farmer.john@agri.com",
    password: "password123",
    name: "John Kiprop",
    location: "Nakuru, Kenya",
    farmSize: "5 acres",
    crops: ["Maize", "Beans", "Potatoes"]
  },
  {
    id: 2,
    email: "mary.wanjiku@farm.co.ke",
    password: "password123",
    name: "Mary Wanjiku",
    location: "Embu, Kenya",
    farmSize: "2 acres",
    crops: ["Coffee", "Bananas"]
  },
  {
    id: 3,
    email: "demo@nasa.earth",
    password: "demo123",
    name: "Demo Farmer",
    location: "Demo Region",
    farmSize: "10 acres",
    crops: ["Mixed Crops"]
  }
];

export const weatherData = {
  "Nakuru, Kenya": {
    temperature: "18-25°C",
    rainfall: "High probability this week",
    soilMoisture: "Optimal",
    recommendation: "Good time for planting maize",
    alert: "Heavy rain expected in 3 days"
  },
  "Embu, Kenya": {
    temperature: "20-28°C",
    rainfall: "Moderate probability",
    soilMoisture: "Slightly dry",
    recommendation: "Consider irrigation",
    alert: "None"
  }
};