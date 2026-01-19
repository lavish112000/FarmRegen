import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Leaf, ArrowRight, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [validationError, setValidationError] = useState(null);

    const { signup, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError(null);

        if (formData.password !== formData.confirmPassword) {
            setValidationError("Passwords do not match");
            return;
        }

        const success = await signup({
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            phone: formData.phone
        });

        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex w-full">
            {/* Left Side - Image/Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
                <img
                    src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop"
                    alt="Satellite View of Fields"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-green-900/40 to-black/40 flex flex-col justify-between p-12">
                    <div>
                        <div className="flex items-center space-x-2 text-white mb-6">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                <Leaf className="w-8 h-8 text-green-400" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">SoilSense</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white leading-tight max-w-lg">
                            Join thousands of farmers improving their yield.
                        </h1>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center space-x-3 text-green-50">
                                <div className="p-1.5 bg-green-500/20 rounded-full"><Sprout className="w-5 h-5" /></div>
                                <span>Free satellite monitoring</span>
                            </div>
                            <div className="flex items-center space-x-3 text-green-50">
                                <div className="p-1.5 bg-green-500/20 rounded-full"><Sprout className="w-5 h-5" /></div>
                                <span>Weekly soil health reports</span>
                            </div>
                            <div className="flex items-center space-x-3 text-green-50">
                                <div className="p-1.5 bg-green-500/20 rounded-full"><Sprout className="w-5 h-5" /></div>
                                <span>Expert recommendations</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-green-200 text-sm">
                        &copy; 2026 SoilSense Project. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-slate-900 md:px-12 overflow-y-auto transition-colors duration-300">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Create Account</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            Get started with SoilSense in less than 2 minutes.
                        </p>
                    </div>

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                        {(error || validationError) && (
                            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-md">
                                <p className="text-sm text-red-700 dark:text-red-400">{error || validationError}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                name="full_name"
                                type="text"
                                required
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Ram Kumar"
                                className="py-3"
                            />
                            <Input
                                label="Email address"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="farmer@example.com"
                                className="py-3"
                            />
                            <Input
                                label="Phone Number (Optional)"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+91 9876543210"
                                className="py-3"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="py-3"
                                />
                                <Input
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="py-3"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input id="terms" name="terms" type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" required />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                I agree to the <a href="#" className="text-green-600 dark:text-green-400 hover:text-green-500">Terms</a> and <a href="#" className="text-green-600 dark:text-green-400 hover:text-green-500">Privacy Policy</a>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-3 text-lg shadow-lg hover:shadow-green-500/30 transition-shadow duration-300"
                            isLoading={isLoading}
                        >
                            Create Account <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>

                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-green-600 dark:text-green-400 hover:text-green-500 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
