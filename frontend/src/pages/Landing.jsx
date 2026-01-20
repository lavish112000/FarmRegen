import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
  const features = [
    {
      icon: '🛰️',
      title: 'Satellite Analysis',
      description: 'Real-time NDVI, NDMI, EVI analysis from Sentinel-2 satellite imagery to monitor crop health.'
    },
    {
      icon: '🌱',
      title: 'Soil Health Scoring',
      description: 'AI-powered soil health scores with actionable recommendations for regenerative practices.'
    },
    {
      icon: '📊',
      title: 'Detailed Reports',
      description: 'Professional PDF reports with charts, trends, and insights for stakeholders.'
    },
    {
      icon: '🗺️',
      title: 'Field Mapping',
      description: 'Draw and manage your fields with precise boundary mapping and area calculations.'
    },
    {
      icon: '📈',
      title: 'Historical Trends',
      description: 'Track soil health over time with historical analysis and trend visualization.'
    },
    {
      icon: '🌍',
      title: 'Carbon Insights',
      description: 'Estimate carbon sequestration potential and support sustainable farming.'
    }
  ];

  const benefits = [
    { stat: '30%', label: 'Reduction in Input Costs', desc: 'Through precision agriculture practices' },
    { stat: '1.5t', label: 'CO₂ Sequestered/Acre/Year', desc: 'With regenerative methods' },
    { stat: '24/7', label: 'Monitoring Coverage', desc: 'Automated satellite tracking' }
  ];

  const testimonials = [
    {
      quote: "SoilSense transformed how we manage our 500-acre farm. The satellite insights helped us reduce fertilizer use by 25%.",
      author: "Rajesh Kumar",
      role: "Farmer, Punjab"
    },
    {
      quote: "The soil health reports are invaluable for our carbon credit applications. Professional and data-driven.",
      author: "Priya Sharma",
      role: "Agricultural Consultant"
    },
    {
      quote: "Finally, affordable precision agriculture for small-scale farmers. Game changer!",
      author: "Amit Patel",
      role: "Organic Farmer, Gujarat"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold text-green-700 dark:text-green-400">SoilSense</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-4 py-1 rounded-full text-sm font-medium mb-6">
              🚀 Powered by Sentinel-2 Satellite Imagery
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Smart Soil Health
              <span className="text-green-600 dark:text-green-400"> Monitoring</span>
              <br />for Modern Agriculture
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Transform your farming with satellite-powered soil analysis. Get real-time vegetation indices, 
              actionable insights, and professional reports to maximize yields and sustainability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-green-500/25"
              >
                Start Free Analysis →
              </Link>
              <a 
                href="#features" 
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-xl font-semibold text-lg hover:border-green-500 transition-all"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Hero Image/Illustration */}
          <motion.div 
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-1">
              <div className="bg-gray-900 rounded-xl p-8 text-left">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-green-400 text-sm mb-2">NDVI Score</div>
                    <div className="text-3xl font-bold text-white">0.78</div>
                    <div className="text-green-400 text-sm">↑ 12% from last month</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-blue-400 text-sm mb-2">Soil Health</div>
                    <div className="text-3xl font-bold text-white">85/100</div>
                    <div className="text-blue-400 text-sm">Excellent condition</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-yellow-400 text-sm mb-2">Fields Analyzed</div>
                    <div className="text-3xl font-bold text-white">12</div>
                    <div className="text-yellow-400 text-sm">Last scan: 2 days ago</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need for Precision Agriculture
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From satellite imagery to actionable insights, we provide the complete toolkit for modern farming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits/Stats Section */}
      <section className="py-20 px-4 bg-green-600 dark:bg-green-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div 
                key={benefit.label}
                className="text-center text-white"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-5xl md:text-6xl font-bold mb-2">{benefit.stat}</div>
                <div className="text-xl font-semibold mb-1">{benefit.label}</div>
                <div className="text-green-100">{benefit.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Farmers Across India
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See how SoilSense is transforming agricultural practices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of farmers using satellite technology for smarter agriculture.
            Start your free analysis today.
          </p>
          <Link 
            to="/signup" 
            className="inline-block bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-50 transition-all hover:shadow-lg"
          >
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌱</span>
                <span className="text-xl font-bold text-white">SoilSense</span>
              </div>
              <p className="text-sm">
                Smart soil health monitoring powered by satellite imagery and AI.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} SoilSense. All rights reserved.</p>
            <p className="mt-2">Powered by Google Earth Engine & Sentinel-2 Satellite Imagery</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
