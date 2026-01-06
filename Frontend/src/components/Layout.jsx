import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold text-primary-600">CarbCap</span>
            </Link>
            <div className="flex space-x-6">
              <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium">
                Home
              </Link>
              <Link to="/individual" className="text-gray-700 hover:text-primary-600 font-medium">
                Individual
              </Link>
              <Link to="/business" className="text-gray-700 hover:text-primary-600 font-medium">
                Business
              </Link>
              <Link to="/admin" className="text-gray-700 hover:text-primary-600 font-medium">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">🌱 CarbCap</h3>
              <p className="text-gray-300">
                Empowering individuals and businesses to measure, understand, and reduce their carbon footprint.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/individual" className="text-gray-300 hover:text-white">
                    Individual Calculator
                  </Link>
                </li>
                <li>
                  <Link to="/business" className="text-gray-300 hover:text-white">
                    Business Calculator
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="text-gray-300 hover:text-white">
                    Admin Panel
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">About</h3>
              <p className="text-gray-300">
                CarbCap is a prototype application for calculating carbon emissions based on locally stored emission factors.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; 2025 CarbCap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
