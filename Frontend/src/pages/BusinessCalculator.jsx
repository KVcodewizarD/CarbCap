import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';

const BusinessCalculator = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    electricity: { monthlyKWh: '' },
    machinery: [],
    fleet: [],
    waste: { monthlyKg: '' }
  });

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('businessCalculatorData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('businessCalculatorData', JSON.stringify(formData));
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

  const addMachine = () => {
    setFormData(prev => ({
      ...prev,
      machinery: [...prev.machinery, { 
        name: '',
        type: 'light', 
        powerKW: '', 
        hoursPerDay: '', 
        daysPerYear: '250' 
      }]
    }));
  };

  const updateMachine = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      machinery: prev.machinery.map((m, i) => 
        i === index ? { ...m, [field]: value } : m
      )
    }));
  };

  const removeMachine = (index) => {
    setFormData(prev => ({
      ...prev,
      machinery: prev.machinery.filter((_, i) => i !== index)
    }));
  };

  const addFleetVehicle = () => {
    setFormData(prev => ({
      ...prev,
      fleet: [...prev.fleet, { 
        name: '',
        vehicleType: 'lightVehicle', 
        annualKm: '', 
        fuelConsumption: '10' 
      }]
    }));
  };

  const updateFleetVehicle = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      fleet: prev.fleet.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };

  const removeFleetVehicle = (index) => {
    setFormData(prev => ({
      ...prev,
      fleet: prev.fleet.filter((_, i) => i !== index)
    }));
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const csvData = results.data;
        
        // Try to map CSV to machinery or fleet
        if (csvData.length > 0) {
          const firstRow = csvData[0];
          
          // Check if it's machinery data
          if (firstRow.powerKW || firstRow.power) {
            const machinery = csvData
              .filter(row => row.powerKW || row.power)
              .map(row => ({
                name: row.name || row.Name || '',
                type: row.type || row.Type || 'light',
                powerKW: row.powerKW || row.power || '',
                hoursPerDay: row.hoursPerDay || row.hours || '',
                daysPerYear: row.daysPerYear || row.days || '250'
              }));
            setFormData(prev => ({ ...prev, machinery }));
            alert(`Imported ${machinery.length} machinery records`);
          }
          // Check if it's fleet data
          else if (firstRow.annualKm || firstRow.kilometers) {
            const fleet = csvData
              .filter(row => row.annualKm || row.kilometers)
              .map(row => ({
                name: row.name || row.Name || '',
                vehicleType: row.vehicleType || row.type || 'lightVehicle',
                annualKm: row.annualKm || row.kilometers || '',
                fuelConsumption: row.fuelConsumption || row.consumption || '10'
              }));
            setFormData(prev => ({ ...prev, fleet }));
            alert(`Imported ${fleet.length} fleet records`);
          }
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('Failed to parse CSV file. Please check the format.');
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'business', data: formData })
      });
      
      const result = await response.json();
      
      // Save calculation
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'business', 
          inputData: formData, 
          result 
        })
      });
      
      // Store in localStorage and navigate to results
      localStorage.setItem('calculationResult', JSON.stringify({
        type: 'business',
        data: formData,
        result
      }));
      
      navigate('/results');
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Failed to calculate carbon footprint. Please try again.');
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Business Carbon Footprint Calculator
        </h1>
        <p className="text-gray-600">
          Calculate your business operations' carbon footprint. You can manually enter data 
          or upload CSV files for bulk import.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map(num => (
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
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Step 1: Facility Energy */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Facility Energy Usage
            </h2>
            
            <div>
              <label className="label">Monthly Electricity Consumption (kWh)</label>
              <input
                type="number"
                className="input-field"
                value={formData.electricity.monthlyKWh}
                onChange={(e) => updateField('electricity', 'monthlyKWh', e.target.value)}
                placeholder="e.g., 5000"
              />
              <p className="text-sm text-gray-500 mt-1">
                Total facility electricity usage including lighting, HVAC, and office equipment
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Machinery */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Industrial Machinery
              </h2>
              <div className="flex space-x-2">
                <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm cursor-pointer">
                  📄 Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={addMachine}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm"
                >
                  + Add Machine
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>CSV Format:</strong> Columns should include: name, type (light/heavy), 
                powerKW, hoursPerDay, daysPerYear
              </p>
            </div>

            {formData.machinery.map((machine, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Machine {index + 1}</h3>
                  <button
                    onClick={() => removeMachine(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Machine Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={machine.name}
                      onChange={(e) => updateMachine(index, 'name', e.target.value)}
                      placeholder="e.g., CNC Machine"
                    />
                  </div>

                  <div>
                    <label className="label">Type</label>
                    <select
                      className="input-field"
                      value={machine.type}
                      onChange={(e) => updateMachine(index, 'type', e.target.value)}
                    >
                      <option value="light">Light Machinery</option>
                      <option value="heavy">Heavy Machinery</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Power Rating (kW)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={machine.powerKW}
                      onChange={(e) => updateMachine(index, 'powerKW', e.target.value)}
                      placeholder="e.g., 50"
                    />
                  </div>

                  <div>
                    <label className="label">Hours per Day</label>
                    <input
                      type="number"
                      className="input-field"
                      value={machine.hoursPerDay}
                      onChange={(e) => updateMachine(index, 'hoursPerDay', e.target.value)}
                      placeholder="e.g., 8"
                    />
                  </div>

                  <div>
                    <label className="label">Operating Days per Year</label>
                    <input
                      type="number"
                      className="input-field"
                      value={machine.daysPerYear}
                      onChange={(e) => updateMachine(index, 'daysPerYear', e.target.value)}
                      placeholder="e.g., 250"
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.machinery.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No machinery added. Click "Add Machine" or import from CSV.
              </p>
            )}
          </div>
        )}

        {/* Step 3: Fleet */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Fleet Vehicles
              </h2>
              <div className="flex space-x-2">
                <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm cursor-pointer">
                  📄 Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={addFleetVehicle}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm"
                >
                  + Add Vehicle
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>CSV Format:</strong> Columns should include: name, vehicleType 
                (lightVehicle/heavyVehicle), annualKm, fuelConsumption
              </p>
            </div>

            {formData.fleet.map((vehicle, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Vehicle {index + 1}</h3>
                  <button
                    onClick={() => removeFleetVehicle(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Vehicle Name/ID</label>
                    <input
                      type="text"
                      className="input-field"
                      value={vehicle.name}
                      onChange={(e) => updateFleetVehicle(index, 'name', e.target.value)}
                      placeholder="e.g., Delivery Van #1"
                    />
                  </div>

                  <div>
                    <label className="label">Vehicle Type</label>
                    <select
                      className="input-field"
                      value={vehicle.vehicleType}
                      onChange={(e) => updateFleetVehicle(index, 'vehicleType', e.target.value)}
                    >
                      <option value="lightVehicle">Light Vehicle (Car, Van)</option>
                      <option value="heavyVehicle">Heavy Vehicle (Truck, Bus)</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Annual Kilometers</label>
                    <input
                      type="number"
                      className="input-field"
                      value={vehicle.annualKm}
                      onChange={(e) => updateFleetVehicle(index, 'annualKm', e.target.value)}
                      placeholder="e.g., 25000"
                    />
                  </div>

                  <div>
                    <label className="label">Fuel Consumption (L/100km)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field"
                      value={vehicle.fuelConsumption}
                      onChange={(e) => updateFleetVehicle(index, 'fuelConsumption', e.target.value)}
                      placeholder="e.g., 12"
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.fleet.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No vehicles added. Click "Add Vehicle" or import from CSV.
              </p>
            )}
          </div>
        )}

        {/* Step 4: Waste */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Industrial Waste
            </h2>

            <div>
              <label className="label">Monthly Industrial Waste (kg)</label>
              <input
                type="number"
                className="input-field"
                value={formData.waste.monthlyKg}
                onChange={(e) => updateField('waste', 'monthlyKg', e.target.value)}
                placeholder="e.g., 500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Total industrial and commercial waste generated monthly
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

          {step < 4 ? (
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
              Calculate Business Footprint
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCalculator;
