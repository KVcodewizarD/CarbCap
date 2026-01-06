import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Calculate Your Carbon Footprint
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Take the first step towards a sustainable future. CarbCap helps you measure, 
          understand, and reduce your environmental impact with precision and transparency.
        </p>
        <div className="flex justify-center items-center space-x-4">
          <div className="flex items-center space-x-2 text-primary-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">100% Offline</span>
          </div>
          <div className="flex items-center space-x-2 text-primary-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Privacy First</span>
          </div>
          <div className="flex items-center space-x-2 text-primary-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Instant Results</span>
          </div>
        </div>
      </section>

      {/* Calculator Type Selection */}
      <section className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Individual Calculator Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🏠</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Individual & Household
            </h2>
            <p className="text-gray-600 mb-6">
              Calculate your personal carbon footprint based on your lifestyle, 
              travel habits, energy consumption, and dietary choices.
            </p>
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-primary-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Home energy usage tracking</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-primary-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Vehicle & travel emissions</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-primary-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Food & lifestyle impact</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-primary-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Waste & recycling habits</span>
            </li>
          </ul>
          
          <button
            onClick={() => navigate('/individual')}
            className="w-full bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg"
          >
            Start Individual Calculator →
          </button>
        </div>

        {/* Business Calculator Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🏭</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Small Business & Industry
            </h2>
            <p className="text-gray-600 mb-6">
              Measure your business operations' environmental impact including 
              machinery, fleet vehicles, and industrial processes.
            </p>
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-primary-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Industrial machinery emissions</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-primary-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Fleet vehicle tracking</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-primary-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Energy & facility management</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-primary-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">CSV import for bulk data</span>
            </li>
          </ul>
          
          <button
            onClick={() => navigate('/business')}
            className="w-full bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg"
          >
            Start Business Calculator →
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white rounded-2xl shadow-lg p-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Why Choose CarbCap?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Transparent Calculations
            </h3>
            <p className="text-gray-600">
              See exactly how your footprint is calculated with detailed emission factors and category breakdowns.
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Actionable Insights
            </h3>
            <p className="text-gray-600">
              Get personalized recommendations to reduce your carbon footprint with real impact estimates.
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Scenario Analysis
            </h3>
            <p className="text-gray-600">
              Test "what-if" scenarios to see how lifestyle changes can reduce your environmental impact.
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-5xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Works Offline
            </h3>
            <p className="text-gray-600">
              PWA-enabled app works completely offline with no cloud dependencies or data tracking.
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Detailed Reports
            </h3>
            <p className="text-gray-600">
              Download comprehensive PDF reports with charts, breakdowns, and verification QR codes.
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Privacy Focused
            </h3>
            <p className="text-gray-600">
              All data stored locally on your device. No external databases or cloud services.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Ready to Make a Difference?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of conscious individuals and businesses taking action on climate change.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/individual')}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            Calculate Now
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            View Admin Panel
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
