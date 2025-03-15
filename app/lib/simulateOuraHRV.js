// simulateOuraHRV.js

function simulateHRV({
    days = 30,
    baseHRV = 60,
    variability = 10,
    trend = 'stable', // Options: 'stable', 'improving', 'declining'
  } = {}) {
    const simulatedData = [];
    let currentHRV = baseHRV;
  
    for (let i = 0; i < days; i++) {
      const dailyFluctuation = (Math.random() * variability * 2) - variability;
      currentHRV += dailyFluctuation;
  
      if (trend === 'improving') currentHRV += 0.3;
      else if (trend === 'declining') currentHRV -= 0.3;
  
      currentHRV = Math.max(20, Math.min(120, currentHRV));
  
      simulatedData.push({
        date: new Date(Date.now() - (days - i - 1) * 86400000).toISOString().split('T')[0],
        HRV: parseFloat(currentHRV.toFixed(1)),
      });
    }
  
    return simulatedData;
  }
  
  export default simulateHRV;
  