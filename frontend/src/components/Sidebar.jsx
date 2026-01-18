import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
    LayoutDashboard,
    Map as MapIcon,
    Activity,
    FileText,
    Settings,
    LogOut,
    Sprout,
    Menu,
    X,
    BookOpen
} from 'lucide-react';

export function Sidebar({ isMobileOpen, setIsMobileOpen }) {
    const location = useLocation();
    const { logout } = useAuthStore();

    const navItems = [
        { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'My Fields', icon: MapIcon, path: '/fields' },
        { name: 'Analysis Trends', icon: Activity, path: '/analysis' },
        { name: 'Reports', icon: FileText, path: '/reports' },
        { name: 'Learn', icon: BookOpen, path: '/learn' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    const NavItem = ({ item }) => {
        const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
        return (
            <Link
                to={item.path}
                className={`flex items-center space-x-3 px-6 py-4 transition-all duration-200 group
          ${isActive
                        ? 'bg-gradient-to-r from-green-50 dark:from-emerald-900/30 to-transparent border-r-4 border-green-600 dark:border-emerald-400'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-emerald-400'
                    }
        `}
            >
                <item.icon
                    className={`w-5 h-5 ${isActive ? 'text-green-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-green-600 dark:group-hover:text-emerald-400'}`}
                />
                <span className={`font-medium ${isActive ? 'text-green-900 dark:text-emerald-100' : ''}`}>
                    {item.name}
                </span>
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-gray-100 dark:border-slate-700/50 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-20 flex items-center px-8 border-b border-gray-50 dark:border-slate-700/50">
                        <div className="flex items-center space-x-2 text-green-700 dark:text-emerald-400">
                            <div className="p-2 bg-green-100 dark:bg-emerald-900/30 rounded-lg">
                                <Sprout className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">SoilSense</span>
                        </div>
                        <button className="ml-auto lg:hidden" onClick={() => setIsMobileOpen(false)}>
                            <X className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-8 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavItem key={item.name} item={item} />
                        ))}
                    </nav>

                    {/* User & Logout */}
                    <div className="p-4 border-t border-gray-50 dark:border-slate-700/50">
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
