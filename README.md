# 🌱 CarbCap - Carbon Footprint Calculator

A comprehensive prototype web application for calculating carbon footprints for individuals, households, and small businesses. Built with React, Node.js, and designed to work completely offline.

## 🎯 Features

### Core Functionality
- ✅ **Dual Calculator Types**: Individual/Household and Small Business/Industry
- ✅ **Multi-step Input Forms**: Intuitive data collection for energy, transportation, food, and waste
- ✅ **Accurate Calculations**: Using locally stored emission factors (kg CO₂e)
- ✅ **Visual Results Dashboard**: Interactive charts with Recharts (pie, bar, and donut charts)
- ✅ **PDF Report Generation**: Downloadable reports with QR codes and unique IDs
- ✅ **Scenario Analysis**: "What-if" simulator to test emission reduction strategies
- ✅ **Benchmark Comparison**: Compare against national and global averages
- ✅ **AI-based Suggestions**: Personalized recommendations for reducing emissions
- ✅ **CSV Import**: Bulk data import for businesses (machinery & fleet)
- ✅ **Admin Panel**: Manage calculations and emission factors
- ✅ **Mock Carbon Offset**: Simulated offset purchase flow
- ✅ **Offline-First PWA**: Works without internet connection
- ✅ **Local Data Storage**: No external databases or cloud dependencies

### Technical Highlights
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Backend**: Node.js + Express
- **Data Storage**: Local JSON files
- **PDF Generation**: jsPDF
- **PWA Support**: Vite PWA Plugin + Workbox
- **CSV Parsing**: PapaParse

## 📁 Project Structure

```
carbon footprint/
├── backend/
│   ├── server.js           # Express server with API endpoints
│   ├── package.json        # Backend dependencies
│   ├── data/              # Local JSON storage
│   │   ├── factors.json   # Emission factors
│   │   ├── calculations.json
│   │   └── benchmarks.json
│   └── README.md
│
└── Frontend/
    ├── index.html
    ├── package.json        # Frontend dependencies
    ├── vite.config.js     # Vite + PWA configuration
    ├── tailwind.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   ├── components/
    │   │   └── Layout.jsx
    │   └── pages/
    │       ├── LandingPage.jsx
    │       ├── IndividualCalculator.jsx
    │       ├── BusinessCalculator.jsx
    │       ├── Results.jsx
    │       └── AdminPanel.jsx
    └── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd "d:\carbon footprint"
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../Frontend
   npm install
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on: `http://localhost:5000`

2. **Start the Frontend Development Server** (in a new terminal)
   ```bash
   cd Frontend
   npm run dev
   ```
   Frontend runs on: `http://localhost:3000`

3. **Open your browser** and navigate to `http://localhost:3000`

## 📖 User Guide

### For Individuals

1. **Landing Page**: Click "Start Individual Calculator"
2. **Step 1 - Home Energy**: Enter electricity, gas, and water consumption
3. **Step 2 - Transportation**: Add vehicles and public transport usage
4. **Step 3 - Air Travel**: Enter domestic and international flight distances
5. **Step 4 - Food**: Estimate weekly food consumption by category
6. **Step 5 - Waste**: Enter waste management data
7. **View Results**: See your total footprint with charts and recommendations
8. **Download Report**: Generate a PDF report with QR code
9. **Test Scenarios**: Try "what-if" scenarios to see potential reductions

### For Businesses

1. **Landing Page**: Click "Start Business Calculator"
2. **Step 1 - Facility Energy**: Enter monthly electricity consumption
3. **Step 2 - Machinery**: Add industrial equipment (or import CSV)
4. **Step 3 - Fleet**: Add company vehicles (or import CSV)
5. **Step 4 - Waste**: Enter industrial waste data
6. **View Results**: Comprehensive business emissions report

### For Administrators

1. **Navigate to Admin Panel** from the menu
2. **View Calculations**: See all saved calculations
3. **Manage Emission Factors**: 
   - View current factors
   - Edit directly or upload JSON
   - Download current factors
4. **Statistics**: View system-wide statistics

## 📊 API Endpoints

### Backend API (http://localhost:5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/factors` | Retrieve emission factors |
| GET | `/api/benchmarks` | Get benchmark data |
| POST | `/api/calculate` | Calculate carbon footprint |
| POST | `/api/save` | Save calculation result |
| GET | `/api/calculations` | Get all calculations |
| GET | `/api/reports/:id` | Get specific report |
| POST | `/api/upload-factors` | Upload emission factors (multipart) |
| PUT | `/api/factors` | Update emission factors (JSON) |
| POST | `/api/suggestions` | Get AI-based suggestions |

## 🗂️ Data Storage

All data is stored locally in JSON files:

- **`data/factors.json`**: Emission factors for all categories
- **`data/calculations.json`**: User calculation history
- **`data/benchmarks.json`**: National/regional averages

### Example Emission Factors
```json
{
  "electricity": {
    "grid": 0.5,
    "renewable": 0.02
  },
  "transportation": {
    "petrol": 2.31,
    "diesel": 2.68,
    "electric": 0.05
  }
}
```

## 🎨 Features Breakdown

### Calculation Engine
- Multi-category emission calculations
- Support for various fuel types and energy sources
- Accurate conversion to tCO₂e (tons of CO₂ equivalent)

### Visualization
- Pie charts showing category distribution
- Bar charts for detailed breakdown
- Tooltip information for transparency

### Reporting
- PDF generation with jsPDF
- QR codes for verification
- Unique calculation IDs
- Reduction recommendations

### PWA Support
- Service worker for offline functionality
- Manifest file for installability
- Cached API responses
- Works without internet

## 🔧 Configuration

### Tailwind CSS
Custom theme colors defined in `tailwind.config.js`:
- Primary color: Green (#10b981)
- Extended color palette for charts

### Vite PWA
Configured in `vite.config.js` with:
- Auto-update registration
- Network-first caching strategy
- API response caching

## 📝 CSV Import Format

### Machinery CSV
```csv
name,type,powerKW,hoursPerDay,daysPerYear
CNC Machine,heavy,50,8,250
Compressor,light,20,10,300
```

### Fleet CSV
```csv
name,vehicleType,annualKm,fuelConsumption
Van #1,lightVehicle,25000,9
Truck #1,heavyVehicle,40000,15
```

## 🌍 Emission Factor Sources

Emission factors are based on:
- IPCC Guidelines
- UK Government GHG Conversion Factors
- India's Carbon Disclosure Index (CaDI)
- EPA Emission Factors

## 🚀 Building for Production

### Frontend
```bash
cd Frontend
npm run build
npm run preview
```

### Backend
```bash
cd backend
npm start
```

## 🔐 Privacy & Security

- **No external databases**: All data stored locally
- **No user tracking**: Privacy-first approach
- **No cloud dependencies**: Fully offline capable
- **Local storage**: Browser localStorage for user data

## 📱 PWA Installation

1. Open the app in a supported browser (Chrome, Edge, Firefox)
2. Look for the "Install" prompt or menu option
3. Install to home screen/desktop
4. Use like a native application

## 🎯 Future Enhancements (Beyond Prototype)

- Real authentication system
- Cloud sync option (optional)
- More detailed categories
- Integration with real carbon offset platforms
- Mobile app versions
- Multi-language support
- Advanced AI recommendations
- Historical tracking & trends

## 🤝 Contributing

This is a prototype application. For improvements:
1. Test thoroughly
2. Verify emission factors
3. Enhance UI/UX
4. Add more categories
5. Improve calculations

## 📄 License

This is a prototype application for educational and demonstration purposes.

## 👥 Support

For issues or questions:
- Check the Admin Panel for system statistics
- Review emission factors in the Admin section
- Download calculation data for analysis

## 🎉 Acknowledgments

- Emission factors based on international standards
- UI inspired by modern sustainability platforms
- Built with open-source technologies

---

**Made with 🌱 for a sustainable future**
