import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import IndividualCalculator from './pages/IndividualCalculator';
import BusinessCalculator from './pages/BusinessCalculator';
import Results from './pages/Results';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/individual" element={<IndividualCalculator />} />
          <Route path="/business" element={<BusinessCalculator />} />
          <Route path="/results" element={<Results />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
