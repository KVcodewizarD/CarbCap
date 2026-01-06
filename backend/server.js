import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// File paths
const DATA_DIR = join(__dirname, 'data');
const FACTORS_FILE = join(DATA_DIR, 'factors.json');
const CALCULATIONS_FILE = join(DATA_DIR, 'calculations.json');
const BENCHMARKS_FILE = join(DATA_DIR, 'benchmarks.json');

// Ensure data directory exists
async function initializeDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize factors.json if not exists
    try {
      await fs.access(FACTORS_FILE);
    } catch {
      const defaultFactors = {
        electricity: {
          grid: 0.5, // kg CO2e per kWh
          renewable: 0.02
        },
        naturalGas: {
          heating: 2.03 // kg CO2e per m³
        },
        transportation: {
          petrol: 2.31, // kg CO2e per liter
          diesel: 2.68,
          electric: 0.05, // kg CO2e per km
          hybrid: 0.12,
          publicTransport: 0.089, // kg CO2e per km
          flight: {
            domestic: 0.255, // kg CO2e per km
            international: 0.195
          }
        },
        waste: {
          landfill: 0.5, // kg CO2e per kg
          recycled: 0.02,
          composted: 0.1
        },
        food: {
          meat: 6.61, // kg CO2e per kg
          dairy: 1.37,
          vegetables: 0.43,
          grains: 0.77
        },
        water: {
          supply: 0.344 // kg CO2e per m³
        },
        business: {
          machinery: {
            light: 0.6, // kg CO2e per kWh
            heavy: 0.8
          },
          fleet: {
            lightVehicle: 2.5, // kg CO2e per liter
            heavyVehicle: 3.2
          },
          industrialWaste: 0.7 // kg CO2e per kg
        }
      };
      await fs.writeFile(FACTORS_FILE, JSON.stringify(defaultFactors, null, 2));
    }
    
    // Initialize calculations.json if not exists
    try {
      await fs.access(CALCULATIONS_FILE);
    } catch {
      await fs.writeFile(CALCULATIONS_FILE, JSON.stringify([], null, 2));
    }
    
    // Initialize benchmarks.json if not exists
    try {
      await fs.access(BENCHMARKS_FILE);
    } catch {
      const defaultBenchmarks = {
        individual: {
          india: {
            average: 1.9, // tons CO2e per year
            urban: 2.5,
            rural: 1.3
          },
          usa: {
            average: 16.0,
            urban: 17.5,
            rural: 14.0
          },
          global: {
            average: 4.8
          }
        },
        business: {
          smallManufacturing: 50, // tons CO2e per year
          smallRetail: 20,
          smallOffice: 15
        }
      };
      await fs.writeFile(BENCHMARKS_FILE, JSON.stringify(defaultBenchmarks, null, 2));
    }
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}

// Helper function to read JSON file
async function readJSONFile(filePath) {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

// Helper function to write JSON file
async function writeJSONFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// API Routes

// GET emission factors
app.get('/api/factors', async (req, res) => {
  try {
    const factors = await readJSONFile(FACTORS_FILE);
    res.json(factors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve emission factors' });
  }
});

// GET benchmarks
app.get('/api/benchmarks', async (req, res) => {
  try {
    const benchmarks = await readJSONFile(BENCHMARKS_FILE);
    res.json(benchmarks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve benchmarks' });
  }
});

// POST calculate carbon footprint
app.post('/api/calculate', async (req, res) => {
  try {
    const { type, data } = req.body; // type: 'individual' or 'business'
    const factors = await readJSONFile(FACTORS_FILE);
    
    let totalEmissions = 0;
    let breakdown = {};
    
    if (type === 'individual') {
      // Electricity
      const electricityEmissions = (data.electricity?.monthlyKWh || 0) * 12 * factors.electricity.grid / 1000;
      breakdown.electricity = electricityEmissions;
      totalEmissions += electricityEmissions;
      
      // Natural Gas
      const gasEmissions = (data.naturalGas?.monthlyCubicMeters || 0) * 12 * factors.naturalGas.heating / 1000;
      breakdown.naturalGas = gasEmissions;
      totalEmissions += gasEmissions;
      
      // Transportation
      let transportEmissions = 0;
      if (data.vehicles) {
        data.vehicles.forEach(vehicle => {
          const annualKm = vehicle.annualKm || 0;
          const fuelConsumption = vehicle.fuelConsumption || 8; // L/100km
          const fuelType = vehicle.fuelType || 'petrol';
          
          if (fuelType === 'electric') {
            transportEmissions += annualKm * factors.transportation.electric;
          } else if (fuelType === 'hybrid') {
            transportEmissions += annualKm * factors.transportation.hybrid;
          } else {
            const litersUsed = (annualKm / 100) * fuelConsumption;
            transportEmissions += litersUsed * factors.transportation[fuelType];
          }
        });
      }
      
      // Public transport
      const publicTransportKm = (data.publicTransport?.monthlyKm || 0) * 12;
      transportEmissions += publicTransportKm * factors.transportation.publicTransport;
      
      // Flights
      const domesticFlights = (data.flights?.domesticKm || 0) * factors.transportation.flight.domestic;
      const internationalFlights = (data.flights?.internationalKm || 0) * factors.transportation.flight.international;
      transportEmissions += (domesticFlights + internationalFlights);
      
      breakdown.transportation = transportEmissions / 1000;
      totalEmissions += transportEmissions / 1000;
      
      // Waste
      const wasteEmissions = (
        ((data.waste?.monthlyLandfill || 0) * factors.waste.landfill) +
        ((data.waste?.monthlyRecycled || 0) * factors.waste.recycled) +
        ((data.waste?.monthlyComposted || 0) * factors.waste.composted)
      ) * 12 / 1000;
      breakdown.waste = wasteEmissions;
      totalEmissions += wasteEmissions;
      
      // Food
      const foodEmissions = (
        ((data.food?.weeklyMeat || 0) * 52 * factors.food.meat) +
        ((data.food?.weeklyDairy || 0) * 52 * factors.food.dairy) +
        ((data.food?.weeklyVegetables || 0) * 52 * factors.food.vegetables) +
        ((data.food?.weeklyGrains || 0) * 52 * factors.food.grains)
      ) / 1000;
      breakdown.food = foodEmissions;
      totalEmissions += foodEmissions;
      
      // Water
      const waterEmissions = (data.water?.monthlyM3 || 0) * 12 * factors.water.supply / 1000;
      breakdown.water = waterEmissions;
      totalEmissions += waterEmissions;
      
    } else if (type === 'business') {
      // Business electricity
      const electricityEmissions = (data.electricity?.monthlyKWh || 0) * 12 * factors.electricity.grid / 1000;
      breakdown.electricity = electricityEmissions;
      totalEmissions += electricityEmissions;
      
      // Machinery
      let machineryEmissions = 0;
      if (data.machinery) {
        data.machinery.forEach(machine => {
          const power = machine.powerKW || 0;
          const hoursPerDay = machine.hoursPerDay || 0;
          const daysPerYear = machine.daysPerYear || 250;
          const type = machine.type || 'light';
          const kwh = power * hoursPerDay * daysPerYear;
          machineryEmissions += kwh * factors.business.machinery[type];
        });
      }
      breakdown.machinery = machineryEmissions / 1000;
      totalEmissions += machineryEmissions / 1000;
      
      // Fleet
      let fleetEmissions = 0;
      if (data.fleet) {
        data.fleet.forEach(vehicle => {
          const annualKm = vehicle.annualKm || 0;
          const fuelConsumption = vehicle.fuelConsumption || 10;
          const vehicleType = vehicle.vehicleType || 'lightVehicle';
          const litersUsed = (annualKm / 100) * fuelConsumption;
          fleetEmissions += litersUsed * factors.business.fleet[vehicleType];
        });
      }
      breakdown.fleet = fleetEmissions / 1000;
      totalEmissions += fleetEmissions / 1000;
      
      // Industrial waste
      const wasteEmissions = (data.waste?.monthlyKg || 0) * 12 * factors.business.industrialWaste / 1000;
      breakdown.industrialWaste = wasteEmissions;
      totalEmissions += wasteEmissions;
    }
    
    res.json({
      totalEmissions: parseFloat(totalEmissions.toFixed(2)),
      breakdown,
      unit: 'tCO2e'
    });
    
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate carbon footprint' });
  }
});

// POST save calculation
app.post('/api/save', async (req, res) => {
  try {
    const { type, inputData, result } = req.body;
    const calculations = await readJSONFile(CALCULATIONS_FILE);
    
    const calculation = {
      id: uuidv4(),
      type,
      inputData,
      result,
      timestamp: new Date().toISOString(),
      dateCreated: new Date().toLocaleString()
    };
    
    calculations.push(calculation);
    await writeJSONFile(CALCULATIONS_FILE, calculations);
    
    res.json({ 
      success: true, 
      calculationId: calculation.id,
      message: 'Calculation saved successfully' 
    });
    
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to save calculation' });
  }
});

// GET all calculations
app.get('/api/calculations', async (req, res) => {
  try {
    const calculations = await readJSONFile(CALCULATIONS_FILE);
    res.json(calculations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve calculations' });
  }
});

// GET specific report by ID
app.get('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const calculations = await readJSONFile(CALCULATIONS_FILE);
    const report = calculations.find(calc => calc.id === id);
    
    if (report) {
      res.json(report);
    } else {
      res.status(404).json({ error: 'Report not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve report' });
  }
});

// POST upload emission factors
const upload = multer({ dest: 'uploads/' });
app.post('/api/upload-factors', upload.single('factorsFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileContent = await fs.readFile(req.file.path, 'utf-8');
    const newFactors = JSON.parse(fileContent);
    
    await writeJSONFile(FACTORS_FILE, newFactors);
    
    // Clean up uploaded file
    await fs.unlink(req.file.path);
    
    res.json({ 
      success: true, 
      message: 'Emission factors updated successfully' 
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload emission factors' });
  }
});

// PUT update emission factors
app.put('/api/factors', async (req, res) => {
  try {
    const newFactors = req.body;
    await writeJSONFile(FACTORS_FILE, newFactors);
    res.json({ 
      success: true, 
      message: 'Emission factors updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update emission factors' });
  }
});

// GET suggestions based on footprint
app.post('/api/suggestions', async (req, res) => {
  try {
    const { breakdown, type } = req.body;
    const suggestions = [];
    
    if (type === 'individual') {
      if (breakdown.transportation > 2) {
        suggestions.push({
          category: 'Transportation',
          tip: 'Consider switching to an electric or hybrid vehicle',
          potentialReduction: '1.5 tCO2e/year'
        });
        suggestions.push({
          category: 'Transportation',
          tip: 'Use public transport or carpool when possible',
          potentialReduction: '0.8 tCO2e/year'
        });
      }
      
      if (breakdown.electricity > 1.5) {
        suggestions.push({
          category: 'Energy',
          tip: 'Switch to renewable energy or install solar panels',
          potentialReduction: '1.2 tCO2e/year'
        });
        suggestions.push({
          category: 'Energy',
          tip: 'Upgrade to energy-efficient appliances',
          potentialReduction: '0.5 tCO2e/year'
        });
      }
      
      if (breakdown.food > 1) {
        suggestions.push({
          category: 'Food',
          tip: 'Reduce meat consumption to 2-3 times per week',
          potentialReduction: '0.7 tCO2e/year'
        });
      }
      
      if (breakdown.waste > 0.3) {
        suggestions.push({
          category: 'Waste',
          tip: 'Increase recycling and composting efforts',
          potentialReduction: '0.2 tCO2e/year'
        });
      }
    } else {
      if (breakdown.machinery > 5) {
        suggestions.push({
          category: 'Machinery',
          tip: 'Upgrade to energy-efficient industrial equipment',
          potentialReduction: '3 tCO2e/year'
        });
      }
      
      if (breakdown.fleet > 3) {
        suggestions.push({
          category: 'Fleet',
          tip: 'Transition to electric or hybrid vehicles',
          potentialReduction: '2 tCO2e/year'
        });
      }
    }
    
    // Always add general tips
    suggestions.push({
      category: 'General',
      tip: 'Conduct regular energy audits',
      potentialReduction: 'Varies'
    });
    
    res.json({ suggestions });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

// Initialize and start server
initializeDataFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`CarbCap Backend Server running on http://localhost:${PORT}`);
  });
});
