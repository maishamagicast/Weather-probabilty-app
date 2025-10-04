import { mockUsers, weatherData } from '../data/mockData';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authAPI = {
  async login(email, password) {
    await delay(1000);
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword, token: 'mock-jwt-token' };
    }
    return { success: false, error: 'Invalid credentials' };
  },

  async signup(userData) {
    await delay(1000);
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      crops: userData.crops || [],
      location: userData.location || 'Nairobi, Kenya',
      farmSize: userData.farmSize || '5 acres'
    };
    const { password: _, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword, token: 'mock-jwt-token' };
  }
};

export const weatherAPI = {
  async getWeatherData(location) {
    await delay(800);
    
    // Default data if location not found
    const defaultData = {
      temperature: "20-30°C",
      rainfall: "Moderate probability this week",
      soilMoisture: "Optimal",
      recommendation: "Good time for planting most crops",
      alert: "None"
    };
    
    return {
      success: true,
      data: weatherData[location] || defaultData
    };
  },

  async getHistoricalData(location, period = '7d') {
    await delay(1200);
    
    const defaultHistorical = {
      averageTemp: "22°C",
      totalRainfall: "45mm",
      soilTrend: "Stable",
      prediction: "Favorable conditions for next 2 weeks"
    };
    
    return {
      success: true,
      data: defaultHistorical
    };
  }
};