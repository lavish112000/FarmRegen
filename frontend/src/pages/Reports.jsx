import { DashboardLayout } from '../components/DashboardLayout';
import { FileText, Download, Lock } from 'lucide-react';
import { Button } from '../components/Button';

export default function Reports() {
    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Reports</h1>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-12 border border-green-100 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-6">
                    <FileText className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Advanced Reporting</h2>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                    We are building comprehensive PDF generation for your farm's health trends, yield predictions, and soil analysis logs.
                </p>
                <div className="inline-flex items-center space-x-4">
                    <Button variant="outline" disabled>
                        <Lock className="w-4 h-4 mr-2" /> Export to CSV
                    </Button>
                    <Button disabled>
                        <Download className="w-4 h-4 mr-2" /> Download PDF Sample
                    </Button>
                </div>
                <p className="text-xs text-gray-400 mt-6 font-medium">COMING SOON IN V2.0</p>
            </div>
        </DashboardLayout>
    );
}
