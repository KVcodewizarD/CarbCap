import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const IndividualCalculator = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    electricity: { monthlyKWh: '' },
    naturalGas: { monthlyCubicMeters: '' },
    vehicles: [],
    publicTransport: { monthlyKm: '' },
    flights: { domesticKm: '', internationalKm: '' },
    waste: { monthlyLandfill: '', monthlyRecycled: '', monthlyComposted: '' },
    food: { weeklyMeat: '', weeklyDairy: '', weeklyVegetables: '', weeklyGrains: '' },
    water: { monthlyM3: '' }
  });

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('individualCalculatorData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('individualCalculatorData', JSON.stringify(formData));
  }, [formData]);

  const updateField = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const addVehicle = () => {
    setFormData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, { fuelType: 'petrol', annualKm: '', fuelConsumption: '8' }]
    }));
  };

  const updateVehicle = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };

  const removeVehicle = (index) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'individual', data: formData })
      });
      
      const result = await response.json();
      
      // Save calculation
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'individual', 
          inputData: formData, 
          result 
        })
      });
      
      // Store in localStorage and navigate to results
      localStorage.setItem('calculationResult', JSON.stringify({
        type: 'individual',
        data: formData,
        result
      }));
      
      navigate('/results');
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Failed to calculate carbon footprint. Please try again.');
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Individual Carbon Footprint Calculator
        </h1>
        <p className="text-gray-600">
          Answer the following questions to calculate your annual carbon footprint.
          Your progress is automatically saved.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5].map(num => (
            <div 
              key={num}
              className={`flex-1 text-center ${step >= num ? 'text-primary-600 font-semibold' : 'text-gray-400'}`}
            >
              Step {num}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-primary-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Step 1: Energy */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Home Energy Usage
            </h2>
            
            <div>
              <label className="label">Monthly Electricity Consumption (kWh)</label>
              <input
                type="number"
                className="input-field"
                value={formData.electricity.monthlyKWh}
                onChange={(e) => updateField('electricity', 'monthlyKWh', e.target.value)}
                placeholder="e.g., 300"
              />
              <p className="text-sm text-gray-500 mt-1">
                Check your electricity bill for this information
              </p>
            </div>

            <div>
              <label className="label">Monthly Natural Gas Usage (cubic meters)</label>
              <input
                type="number"
                className="input-field"
                value={formData.naturalGas.monthlyCubicMeters}
                onChange={(e) => updateField('naturalGas', 'monthlyCubicMeters', e.target.value)}
                placeholder="e.g., 50"
              />
              <p className="text-sm text-gray-500 mt-1">
                For heating and cooking. Leave blank if not applicable.
              </p>
            </div>

            <div>
              <label className="label">Monthly Water Consumption (cubic meters)</label>
              <input
                type="number"
                className="input-field"
                value={formData.water.monthlyM3}
                onChange={(e) => updateField('water', 'monthlyM3', e.target.value)}
                placeholder="e.g., 15"
              />
              <p className="text-sm text-gray-500 mt-1">
                Check your water bill or estimate based on household size
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Transportation */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Transportation
            </h2>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="label mb-0">Personal Vehicles</label>
                <button
                  onClick={addVehicle}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm"
                >
                  + Add Vehicle
                </button>
              </div>

              {formData.vehicles.map((vehicle, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">Vehicle {index + 1}</h3>
                    <button
                      onClick={() => removeVehicle(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Fuel Type</label>
                      <select
                        className="input-field"
                        value={vehicle.fuelType}
                        onChange={(e) => updateVehicle(index, 'fuelType', e.target.value)}
                      >
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Annual Kilometers</label>
                      <input
                        type="number"
                        className="input-field"
                        value={vehicle.annualKm}
                        onChange={(e) => updateVehicle(index, 'annualKm', e.target.value)}
                        placeholder="e.g., 15000"
                      />
                    </div>

                    <div>
                      <label className="label">Fuel Consumption (L/100km)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input-field"
                        value={vehicle.fuelConsumption}
                        onChange={(e) => updateVehicle(index, 'fuelConsumption', e.target.value)}
                        placeholder="e.g., 8"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {formData.vehicles.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No vehicles added. Click "Add Vehicle" to add one.
                </p>
              )}
            </div>

            <div>
              <label className="label">Monthly Public Transport (km)</label>
              <input
                type="number"
                className="input-field"
                value={formData.publicTransport.monthlyKm}
                onChange={(e) => updateField('publicTransport', 'monthlyKm', e.target.value)}
                placeholder="e.g., 200"
              />
              <p className="text-sm text-gray-500 mt-1">
                Bus, train, metro, etc.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Air Travel */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Air Travel
            </h2>

            <div>
              <label className="label">Annual Domestic Flight Distance (km)</label>
              <input
                type="number"
                className="input-field"
                value={formData.flights.domesticKm}
                onChange={(e) => updateField('flights', 'domesticKm', e.target.value)}
                placeholder="e.g., 2000"
              />
              <p className="text-sm text-gray-500 mt-1">
                Estimate: Short flight ≈ 500km, Medium ≈ 1000km
              </p>
            </div>

            <div>
              <label className="label">Annual International Flight Distance (km)</label>
              <input
                type="number"
                className="input-field"
                value={formData.flights.internationalKm}
                onChange={(e) => updateField('flights', 'internationalKm', e.target.value)}
                placeholder="e.g., 5000"
              />
              <p className="text-sm text-gray-500 mt-1">
                Estimate: Regional ≈ 3000km, Intercontinental ≈ 10000km
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Food */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Food Consumption
            </h2>
            <p className="text-gray-600 mb-4">
              Estimate your weekly consumption in kilograms
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Weekly Meat Consumption (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  value={formData.food.weeklyMeat}
                  onChange={(e) => updateField('food', 'weeklyMeat', e.target.value)}
                  placeholder="e.g., 2.5"
                />
              </div>

              <div>
                <label className="label">Weekly Dairy Consumption (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  value={formData.food.weeklyDairy}
                  onChange={(e) => updateField('food', 'weeklyDairy', e.target.value)}
                  placeholder="e.g., 3"
                />
              </div>

              <div>
                <label className="label">Weekly Vegetables (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  value={formData.food.weeklyVegetables}
                  onChange={(e) => updateField('food', 'weeklyVegetables', e.target.value)}
                  placeholder="e.g., 5"
                />
              </div>

              <div>
                <label className="label">Weekly Grains (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  value={formData.food.weeklyGrains}
                  onChange={(e) => updateField('food', 'weeklyGrains', e.target.value)}
                  placeholder="e.g., 2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Waste */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Waste Management
            </h2>
            <p className="text-gray-600 mb-4">
              Estimate your monthly waste in kilograms
            </p>

            <div>
              <label className="label">Monthly Landfill Waste (kg)</label>
              <input
                type="number"
                className="input-field"
                value={formData.waste.monthlyLandfill}
                onChange={(e) => updateField('waste', 'monthlyLandfill', e.target.value)}
                placeholder="e.g., 40"
              />
              <p className="text-sm text-gray-500 mt-1">
                General waste that goes to landfill
              </p>
            </div>

            <div>
              <label className="label">Monthly Recycled Waste (kg)</label>
              <input
                type="number"
                className="input-field"
                value={formData.waste.monthlyRecycled}
                onChange={(e) => updateField('waste', 'monthlyRecycled', e.target.value)}
                placeholder="e.g., 20"
              />
              <p className="text-sm text-gray-500 mt-1">
                Paper, plastic, glass, metal
              </p>
            </div>

            <div>
              <label className="label">Monthly Composted Waste (kg)</label>
              <input
                type="number"
                className="input-field"
                value={formData.waste.monthlyComposted}
                onChange={(e) => updateField('waste', 'monthlyComposted', e.target.value)}
                placeholder="e.g., 10"
              />
              <p className="text-sm text-gray-500 mt-1">
                Food scraps and organic waste
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`px-6 py-3 rounded-lg font-semibold ${
              step === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            ← Previous
          </button>

          {step < 5 ? (
            <button
              onClick={nextStep}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-semibold"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 font-semibold"
            >
              Calculate My Footprint
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndividualCalculator;
