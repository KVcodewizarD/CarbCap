import { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('calculations');
  const [calculations, setCalculations] = useState([]);
  const [factors, setFactors] = useState(null);
  const [editingFactors, setEditingFactors] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadCalculations();
    loadFactors();
  }, []);

  const loadCalculations = async () => {
    try {
      const response = await fetch('/api/calculations');
      const data = await response.json();
      setCalculations(data);
    } catch (error) {
      console.error('Error loading calculations:', error);
    }
  };

  const loadFactors = async () => {
    try {
      const response = await fetch('/api/factors');
      const data = await response.json();
      setFactors(data);
    } catch (error) {
      console.error('Error loading factors:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('factorsFile', file);

    try {
      const response = await fetch('/api/upload-factors', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Emission factors uploaded successfully!');
        loadFactors();
      } else {
        alert('Failed to upload emission factors');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const saveFactors = async () => {
    try {
      const response = await fetch('/api/factors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(factors)
      });

      if (response.ok) {
        alert('Emission factors updated successfully!');
        setEditingFactors(false);
      } else {
        alert('Failed to update emission factors');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving factors');
    }
  };

  const downloadFactorsJSON = () => {
    const dataStr = JSON.stringify(factors, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'emission-factors.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteCalculation = async (id) => {
    if (!confirm('Are you sure you want to delete this calculation?')) return;
    
    // Since we don't have a delete endpoint, we'll just filter locally
    setCalculations(calculations.filter(calc => calc.id !== id));
    alert('Note: This is a client-side deletion only in the prototype.');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Admin Panel
        </h1>
        <p className="text-gray-600">
          View calculations, manage emission factors, and configure the system.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('calculations')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calculations'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Saved Calculations ({calculations.length})
          </button>
          <button
            onClick={() => setActiveTab('factors')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'factors'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Emission Factors
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Statistics
          </button>
        </nav>
      </div>

      {/* Calculations Tab */}
      {activeTab === 'calculations' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Saved Calculations
            </h2>
            <button
              onClick={loadCalculations}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm"
            >
              🔄 Refresh
            </button>
          </div>

          {calculations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No calculations saved yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Emissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {calculations.map((calc) => (
                    <tr key={calc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                        {calc.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          calc.type === 'individual'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {calc.type === 'individual' ? 'Individual' : 'Business'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {calc.result.totalEmissions} {calc.result.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {calc.dateCreated}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => {
                            const dataStr = JSON.stringify(calc, null, 2);
                            const dataBlob = new Blob([dataStr], { type: 'application/json' });
                            const url = URL.createObjectURL(dataBlob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `calculation-${calc.id}.json`;
                            link.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => deleteCalculation(calc.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Emission Factors Tab */}
      {activeTab === 'factors' && factors && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Emission Factors Management
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={downloadFactorsJSON}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-semibold"
              >
                💾 Download JSON
              </button>
              <label className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
                uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                {uploading ? '⏳ Uploading...' : '📤 Upload JSON'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {!editingFactors ? (
                <button
                  onClick={() => setEditingFactors(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm font-semibold"
                >
                  ✏️ Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={saveFactors}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold"
                  >
                    ✓ Save
                  </button>
                  <button
                    onClick={() => {
                      loadFactors();
                      setEditingFactors(false);
                    }}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-semibold"
                  >
                    ✗ Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {editingFactors ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Editing emission factors will affect all future calculations. 
                  Make sure to verify values from reliable sources.
                </p>
              </div>
              
              <textarea
                className="w-full h-96 font-mono text-sm border border-gray-300 rounded-lg p-4"
                value={JSON.stringify(factors, null, 2)}
                onChange={(e) => {
                  try {
                    setFactors(JSON.parse(e.target.value));
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Display factors in a readable format */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Electricity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Grid Electricity</div>
                    <div className="text-xl font-bold text-gray-800">{factors.electricity.grid} kg CO₂e/kWh</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Renewable</div>
                    <div className="text-xl font-bold text-gray-800">{factors.electricity.renewable} kg CO₂e/kWh</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Transportation</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Petrol</div>
                    <div className="text-xl font-bold text-gray-800">{factors.transportation.petrol} kg CO₂e/L</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Diesel</div>
                    <div className="text-xl font-bold text-gray-800">{factors.transportation.diesel} kg CO₂e/L</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Electric</div>
                    <div className="text-xl font-bold text-gray-800">{factors.transportation.electric} kg CO₂e/km</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Hybrid</div>
                    <div className="text-xl font-bold text-gray-800">{factors.transportation.hybrid} kg CO₂e/km</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Food</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Meat</div>
                    <div className="text-xl font-bold text-gray-800">{factors.food.meat} kg CO₂e/kg</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Dairy</div>
                    <div className="text-xl font-bold text-gray-800">{factors.food.dairy} kg CO₂e/kg</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Vegetables</div>
                    <div className="text-xl font-bold text-gray-800">{factors.food.vegetables} kg CO₂e/kg</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Grains</div>
                    <div className="text-xl font-bold text-gray-800">{factors.food.grains} kg CO₂e/kg</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Click "Edit" to modify factors directly, or download/upload JSON files 
                  for bulk changes. All values are based on internationally recognized emission databases.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            System Statistics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {calculations.length}
              </div>
              <div className="text-sm text-gray-600">Total Calculations</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
              <div className="text-3xl mb-2">👤</div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {calculations.filter(c => c.type === 'individual').length}
              </div>
              <div className="text-sm text-gray-600">Individual Calculations</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
              <div className="text-3xl mb-2">🏭</div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {calculations.filter(c => c.type === 'business').length}
              </div>
              <div className="text-sm text-gray-600">Business Calculations</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Average Emissions</h3>
            
            {calculations.length > 0 ? (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Individual Average</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {(calculations
                      .filter(c => c.type === 'individual')
                      .reduce((sum, c) => sum + c.result.totalEmissions, 0) /
                      calculations.filter(c => c.type === 'individual').length || 0
                    ).toFixed(2)} tCO₂e/year
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Business Average</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {(calculations
                      .filter(c => c.type === 'business')
                      .reduce((sum, c) => sum + c.result.totalEmissions, 0) /
                      calculations.filter(c => c.type === 'business').length || 0
                    ).toFixed(2)} tCO₂e/year
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No data available yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
