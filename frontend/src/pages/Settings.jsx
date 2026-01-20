import { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { User, Mail, Phone, Save, Lock, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
    const { user, updateProfile, changePassword, isLoading } = useAuthStore();
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
        setPasswordMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateProfile({
            full_name: formData.full_name,
            phone: formData.phone
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        // Validate password length
        if (passwordData.newPassword.length < 8) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            return;
        }

        setPasswordLoading(true);
        const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
        setPasswordLoading(false);

        if (result.success) {
            setPasswordMessage({ type: 'success', text: result.message });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
            setPasswordMessage({ type: 'error', text: result.message });
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Account Settings</h1>

                {/* Profile Section */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                    <div className="flex items-center mb-8">
                        <div className="w-20 h-20 bg-green-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-2xl font-bold">
                            {user?.full_name?.[0] || 'U'}
                        </div>
                        <div className="ml-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.full_name}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Full Name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            icon={User}
                        />

                        <Input
                            label="Email Address"
                            name="email"
                            value={formData.email}
                            disabled
                            icon={Mail}
                            className="bg-gray-50 dark:bg-slate-700/50 dark:text-gray-400"
                        />

                        <Input
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            icon={Phone}
                            placeholder="+1 (555) 000-0000"
                        />

                        <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                            <Button type="submit" isLoading={isLoading} className="px-8">
                                <Save className="w-4 h-4 mr-2" /> Save Changes
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Password Change Section */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
                        </div>
                    </div>

                    {passwordMessage.text && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${
                            passwordMessage.type === 'success' 
                                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                            {passwordMessage.text}
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="relative">
                            <Input
                                label="Current Password"
                                name="currentPassword"
                                type={showPasswords ? 'text' : 'password'}
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                icon={Lock}
                                placeholder="Enter current password"
                            />
                        </div>

                        <Input
                            label="New Password"
                            name="newPassword"
                            type={showPasswords ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            icon={Lock}
                            placeholder="Enter new password (min 8 chars)"
                        />

                        <Input
                            label="Confirm New Password"
                            name="confirmPassword"
                            type={showPasswords ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            icon={Lock}
                            placeholder="Confirm new password"
                        />

                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={() => setShowPasswords(!showPasswords)}
                                className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                {showPasswords ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                                {showPasswords ? 'Hide' : 'Show'} passwords
                            </button>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                            <Button 
                                type="submit" 
                                isLoading={passwordLoading}
                                disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                className="px-8"
                            >
                                <Lock className="w-4 h-4 mr-2" /> Update Password
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
