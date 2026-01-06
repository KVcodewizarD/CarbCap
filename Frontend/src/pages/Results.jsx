import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';

const Results = () => {
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [benchmarks, setBenchmarks] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [scenarioData, setScenarioData] = useState(null);
  const [calculationId, setCalculationId] = useState(null);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

  useEffect(() => {
    const storedData = localStorage.getItem('calculationResult');
    if (!storedData) {
      navigate('/');
      return;
    }

    const parsed = JSON.parse(storedData);
    setResultData(parsed);
    
    // Fetch benchmarks
    fetch('/api/benchmarks')
      .then(res => res.json())
      .then(data => setBenchmarks(data))
      .catch(console.error);

    // Fetch suggestions
    fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        breakdown: parsed.result.breakdown, 
        type: parsed.type 
      })
    })
      .then(res => res.json())
      .then(data => setSuggestions(data.suggestions))
      .catch(console.error);

    // Get calculation ID if available
    const id = sessionStorage.getItem('lastCalculationId');
    if (id) setCalculationId(id);
  }, [navigate]);

  if (!resultData) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const { result, type } = resultData;
  const breakdown = result.breakdown;

  // Prepare chart data
  const chartData = Object.entries(breakdown).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    value: parseFloat(value.toFixed(2)),
    percentage: ((value / result.totalEmissions) * 100).toFixed(1)
  }));

  const handleScenarioChange = async (changes) => {
    const modifiedData = { ...resultData.data };
    
    // Apply scenario changes
    Object.entries(changes).forEach(([key, value]) => {
      if (key.includes('.')) {
        const [category, field] = key.split('.');
        modifiedData[category] = { ...modifiedData[category], [field]: value };
      }
    });

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data: modifiedData })
      });
      
      const newResult = await response.json();
      setScenarioData(newResult);
    } catch (error) {
      console.error('Scenario calculation error:', error);
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129);
    doc.text('🌱 CarbCap', 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Carbon Footprint Report', 20, 35);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 42);
    if (calculationId) {
      doc.text(`Report ID: ${calculationId}`, 20, 48);
    }
    
    // Generate QR Code
    if (calculationId) {
      try {
        const qrDataUrl = await QRCode.toDataURL(`CarbCap-${calculationId}`);
        doc.addImage(qrDataUrl, 'PNG', 160, 15, 30, 30);
      } catch (error) {
        console.error('QR generation error:', error);
      }
    }
    
    // Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary', 20, 60);
    
    doc.setFontSize(11);
    doc.text(`Calculator Type: ${type === 'individual' ? 'Individual/Household' : 'Small Business'}`, 20, 70);
    
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text(`${result.totalEmissions} ${result.unit}`, 20, 85);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Total Annual Carbon Footprint', 20, 92);
    
    // Benchmark comparison
    if (benchmarks) {
      const avg = type === 'individual' 
        ? benchmarks.individual.india.average 
        : benchmarks.business.smallOffice;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const comparison = result.totalEmissions > avg 
        ? `${((result.totalEmissions / avg - 1) * 100).toFixed(0)}% above` 
        : `${((1 - result.totalEmissions / avg) * 100).toFixed(0)}% below`;
      doc.text(`${comparison} national average (${avg} tCO2e)`, 20, 102);
    }
    
    // Category Breakdown Table
    doc.text('Emission Breakdown by Category', 20, 115);
    
    const tableData = chartData.map(item => [
      item.name,
      `${item.value} tCO2e`,
      `${item.percentage}%`
    ]);
    
    doc.autoTable({
      startY: 120,
      head: [['Category', 'Emissions', 'Percentage']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });
    
    // Suggestions
    if (suggestions.length > 0) {
      const finalY = doc.lastAutoTable.finalY || 120;
      doc.setFontSize(14);
      doc.text('Recommendations', 20, finalY + 15);
      
      doc.setFontSize(10);
      suggestions.slice(0, 5).forEach((suggestion, index) => {
        const y = finalY + 25 + (index * 15);
        if (y > 270) return; // Avoid page overflow
        
        doc.setTextColor(16, 185, 129);
        doc.text(`• ${suggestion.category}:`, 25, y);
        doc.setTextColor(0, 0, 0);
        doc.text(suggestion.tip, 25, y + 5);
        doc.setTextColor(100, 100, 100);
        doc.text(`Potential reduction: ${suggestion.potentialReduction}`, 30, y + 10);
      });
    }
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This report was generated by CarbCap - Carbon Footprint Calculator', 20, pageHeight - 15);
    doc.text('For more information, visit our application.', 20, pageHeight - 10);
    
    // Save
    doc.save(`CarbCap_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Your Carbon Footprint
            </h1>
            <p className="text-gray-600">
              {type === 'individual' ? 'Individual/Household' : 'Small Business'} Calculator Results
            </p>
            {calculationId && (
              <p className="text-sm text-gray-500 mt-2">Report ID: {calculationId}</p>
            )}
          </div>
          <button
            onClick={generatePDF}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-semibold flex items-center space-x-2"
          >
            <span>📄</span>
            <span>Download PDF Report</span>
          </button>
        </div>

        {/* Total Emissions */}
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-8 text-center">
          <div className="text-6xl font-bold text-primary-600 mb-2">
            {result.totalEmissions}
          </div>
          <div className="text-2xl text-gray-700 mb-4">
            {result.unit} per year
          </div>
          
          {/* Benchmark Comparison */}
          {benchmarks && (
            <div className="mt-4 text-gray-600">
              {type === 'individual' ? (
                <>
                  <p className="text-lg">
                    National Average (India): <strong>{benchmarks.individual.india.average} tCO2e</strong>
                  </p>
                  <p className="text-lg">
                    Global Average: <strong>{benchmarks.individual.global.average} tCO2e</strong>
                  </p>
                  {result.totalEmissions > benchmarks.individual.india.average ? (
                    <p className="text-orange-600 mt-2">
                      ⚠️ Your footprint is {((result.totalEmissions / benchmarks.individual.india.average - 1) * 100).toFixed(0)}% 
                      above the national average
                    </p>
                  ) : (
                    <p className="text-green-600 mt-2">
                      ✓ Your footprint is {((1 - result.totalEmissions / benchmarks.individual.india.average) * 100).toFixed(0)}% 
                      below the national average
                    </p>
                  )}
                </>
              ) : (
                <p className="text-lg">
                  Average Small Office: <strong>{benchmarks.business.smallOffice} tCO2e</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Emissions by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Category Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: 'tCO2e', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Detailed Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chartData.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <span 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
              </div>
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {item.value} tCO2e
              </div>
              <div className="text-sm text-gray-600">
                {item.percentage}% of total
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            💡 Personalized Recommendations
          </h2>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border-l-4 border-primary-600 bg-primary-50 p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {suggestion.category}
                    </h3>
                    <p className="text-gray-700">{suggestion.tip}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-primary-600">
                      {suggestion.potentialReduction}
                    </div>
                    <div className="text-xs text-gray-500">
                      potential reduction
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scenario Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          🎯 What-If Scenario Analysis
        </h2>
        <p className="text-gray-600 mb-6">
          See how changes in your lifestyle or operations could reduce your carbon footprint.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {type === 'individual' && (
            <>
              <button
                onClick={() => handleScenarioChange({ 'electricity.monthlyKWh': resultData.data.electricity.monthlyKWh * 0.8 })}
                className="border-2 border-primary-600 text-primary-600 px-6 py-4 rounded-lg hover:bg-primary-50 font-semibold text-left"
              >
                <div className="text-lg mb-1">Reduce electricity by 20%</div>
                <div className="text-sm text-gray-600">Switch to LED bulbs, improve insulation</div>
              </button>

              <button
                onClick={() => handleScenarioChange({ 'publicTransport.monthlyKm': (resultData.data.publicTransport.monthlyKm || 0) + 100 })}
                className="border-2 border-primary-600 text-primary-600 px-6 py-4 rounded-lg hover:bg-primary-50 font-semibold text-left"
              >
                <div className="text-lg mb-1">Use public transport more</div>
                <div className="text-sm text-gray-600">Add 100km monthly public transport</div>
              </button>
            </>
          )}

          {type === 'business' && (
            <>
              <button
                onClick={() => handleScenarioChange({ 'electricity.monthlyKWh': resultData.data.electricity.monthlyKWh * 0.85 })}
                className="border-2 border-primary-600 text-primary-600 px-6 py-4 rounded-lg hover:bg-primary-50 font-semibold text-left"
              >
                <div className="text-lg mb-1">Reduce facility energy by 15%</div>
                <div className="text-sm text-gray-600">Upgrade to efficient equipment</div>
              </button>

              <button
                onClick={() => handleScenarioChange({ 'waste.monthlyKg': resultData.data.waste.monthlyKg * 0.7 })}
                className="border-2 border-primary-600 text-primary-600 px-6 py-4 rounded-lg hover:bg-primary-50 font-semibold text-left"
              >
                <div className="text-lg mb-1">Reduce waste by 30%</div>
                <div className="text-sm text-gray-600">Improve recycling and waste management</div>
              </button>
            </>
          )}
        </div>

        {scenarioData && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-800 mb-2">Scenario Result:</h3>
            <div className="flex items-center space-x-4">
              <div>
                <div className="text-sm text-gray-600">Current</div>
                <div className="text-2xl font-bold text-gray-800">{result.totalEmissions} tCO2e</div>
              </div>
              <div className="text-3xl">→</div>
              <div>
                <div className="text-sm text-gray-600">After Change</div>
                <div className="text-2xl font-bold text-primary-600">{scenarioData.totalEmissions} tCO2e</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Reduction</div>
                <div className="text-2xl font-bold text-green-600">
                  -{(result.totalEmissions - scenarioData.totalEmissions).toFixed(2)} tCO2e
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mock Offset Section */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🌳 Offset Your Carbon Footprint
        </h2>
        <p className="text-gray-600 mb-6">
          Support verified carbon offset projects to neutralize your emissions.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border-2 border-transparent hover:border-primary-600 transition-all cursor-pointer">
            <div className="text-4xl mb-3">🌲</div>
            <h3 className="font-bold text-gray-800 mb-2">Forest Conservation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Protect existing forests and prevent deforestation
            </p>
            <div className="text-primary-600 font-semibold">
              ₹500 / tCO2e
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border-2 border-transparent hover:border-primary-600 transition-all cursor-pointer">
            <div className="text-4xl mb-3">☀️</div>
            <h3 className="font-bold text-gray-800 mb-2">Renewable Energy</h3>
            <p className="text-sm text-gray-600 mb-4">
              Support solar and wind energy projects
            </p>
            <div className="text-primary-600 font-semibold">
              ₹600 / tCO2e
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border-2 border-transparent hover:border-primary-600 transition-all cursor-pointer">
            <div className="text-4xl mb-3">🌱</div>
            <h3 className="font-bold text-gray-800 mb-2">Tree Planting</h3>
            <p className="text-sm text-gray-600 mb-4">
              Plant new trees and restore degraded land
            </p>
            <div className="text-primary-600 font-semibold">
              ₹450 / tCO2e
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 font-semibold">
            Purchase Offsets (Mock)
          </button>
          <p className="text-sm text-gray-500 mt-2">
            * This is a prototype. No real transactions will be processed.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => navigate('/')}
          className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 font-semibold"
        >
          Calculate Again
        </button>
        <button
          onClick={generatePDF}
          className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 font-semibold"
        >
          Download Full Report
        </button>
      </div>
    </div>
  );
};

export default Results;
