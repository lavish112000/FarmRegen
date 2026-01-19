import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Leaf, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
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
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-green-900/90 via-green-900/40 to-transparent flex flex-col justify-between p-12">
                    <div>
                        <div className="flex items-center space-x-2 text-white mb-6">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                <Leaf className="w-8 h-8 text-green-400" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">SoilSense</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white leading-tight max-w-lg">
                            Monitor your soil health from space.
                        </h1>
                        <p className="mt-4 text-green-100 text-lg max-w-md">
                            Advanced satellite imagery and AI analysis to help you make better farming decisions.
                        </p>
                    </div>
                    <div className="text-green-200 text-sm">
                        &copy; 2026 SoilSense Project. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 md:px-12 transition-colors duration-300">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <div className="flex justify-center lg:justify-start lg:hidden mb-6">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome back</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            Sign in to access your farm dashboard.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-md">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                label="Email address"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="farmer@example.com"
                                className="py-3"
                            />
                            <div className="relative">
                                <Input
                                    label="Password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="py-3"
                                />
                                <div className="text-right mt-1">
                                    <a href="#" className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-500">
                                        Forgot password?
                                    </a>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-3 text-lg shadow-lg hover:shadow-green-500/30 transition-shadow duration-300"
                            isLoading={isLoading}
                        >
                            Sign In <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>

                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Don't have an account?{' '}
                                <Link to="/signup" className="font-semibold text-green-600 dark:text-green-400 hover:text-green-500 transition-colors">
                                    create a free account
                                </Link>
                            </p>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
