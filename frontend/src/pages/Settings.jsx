import { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { User, Mail, Phone, Save } from 'lucide-react';

export default function Settings() {
    const { user, updateProfile, isLoading } = useAuthStore();
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateProfile({
            full_name: formData.full_name,
            phone: formData.phone
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Account Settings</h1>

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

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <Button type="submit" isLoading={isLoading} className="px-8">
                                <Save className="w-4 h-4 mr-2" /> Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
