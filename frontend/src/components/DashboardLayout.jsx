import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Search, Bell, User, Sun, Moon } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { motion } from 'framer-motion';

export function DashboardLayout({ children }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { user } = useAuthStore();
    const { isDarkMode, toggleTheme, initTheme } = useThemeStore();

    useEffect(() => {
        initTheme();
    }, [initTheme]);

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-20 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 px-8 flex items-center justify-between z-30 sticky top-0 shadow-sm dark:shadow-slate-900/20">
                    <div className="flex items-center">
                        <button
                            className="mr-4 lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 hidden md:block">
                            Dashboard
                        </h1>
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Search Bar */}
                        <div className="hidden md:flex items-center bg-gray-100/80 dark:bg-slate-700/50 backdrop-blur-sm rounded-full px-4 py-2 w-64 border border-transparent focus-within:border-green-500 dark:focus-within:border-emerald-400 focus-within:bg-white dark:focus-within:bg-slate-700 transition-all">
                            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Search fields, reports..."
                                className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400 dark:placeholder-gray-500 dark:text-gray-200"
                            />
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Theme Toggle */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleTheme}
                                className="p-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-emerald-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </motion.button>

                            <button className="p-2 relative text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-emerald-400 transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                            </button>

                            <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-2"></div>

                            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors">
                                <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-700 dark:from-emerald-500 dark:to-green-700 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                                    {user?.name?.[0] || user?.full_name?.[0] || 'U'}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                                        {user?.name || user?.full_name || 'User'}
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-emerald-400 font-medium">Pro Plan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Scrollable Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-7xl mx-auto"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
