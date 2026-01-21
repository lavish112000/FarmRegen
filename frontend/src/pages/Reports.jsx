import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { FileText, Download, FileSpreadsheet, Table, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import api, { exportCSV, exportExcel, downloadReport } from '../services/api';
import { AnalysisModal } from '../components/AnalysisModal';

export default function Reports() {
    const [analyses, setAnalyses] = useState([]);
    const [fields, setFields] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState({ csv: false, excel: false });
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [selectedFieldFilter, setSelectedFieldFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [analysesRes, fieldsRes] = await Promise.all([
                api.get('/analysis/history'),
                api.get('/fields')
            ]);
            setAnalyses(analysesRes.data);
            setFields(fieldsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = async () => {
        setIsExporting(prev => ({ ...prev, csv: true }));
        try {
            await exportCSV(selectedFieldFilter || null);
        } catch {
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(prev => ({ ...prev, csv: false }));
        }
    };

    const handleExportExcel = async () => {
        setIsExporting(prev => ({ ...prev, excel: true }));
        try {
            await exportExcel(selectedFieldFilter || null);
        } catch {
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(prev => ({ ...prev, excel: false }));
        }
    };

    const filteredAnalyses = selectedFieldFilter
        ? analyses.filter(a => a.field_id === selectedFieldFilter)
        : analyses;

    const getScoreColor = (score) => {
        if (score >= 70) return 'text-green-600 bg-green-100';
        if (score >= 40) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Reports & Exports</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Download your analysis data in various formats
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <select
                        value={selectedFieldFilter}
                        onChange={(e) => setSelectedFieldFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200"
                    >
                        <option value="">All Fields</option>
                        {fields.map(field => (
                            <option key={field.id} value={field.id}>{field.name}</option>
                        ))}
                    </select>
                    <Button
                        variant="outline"
                        onClick={handleExportCSV}
                        disabled={isExporting.csv || analyses.length === 0}
                    >
                        {isExporting.csv ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Table className="w-4 h-4 mr-2" />
                        )}
                        Export CSV
                    </Button>
                    <Button
                        onClick={handleExportExcel}
                        disabled={isExporting.excel || analyses.length === 0}
                    >
                        {isExporting.excel ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                        )}
                        Export Excel
                    </Button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                            <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyses.length}</p>
                            <p className="text-xs text-gray-500">Total Analyses</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {analyses.length > 0
                                    ? Math.round(analyses.reduce((sum, a) => sum + (a.soil_score || 0), 0) / analyses.length)
                                    : 0}
                            </p>
                            <p className="text-xs text-gray-500">Avg Score</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                            <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{fields.length}</p>
                            <p className="text-xs text-gray-500">Fields Tracked</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                            <Download className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Export Ready</p>
                            <p className="text-xs text-gray-500">CSV, Excel, PDF</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analysis History Table */}
            {filteredAnalyses.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Field</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">NDVI</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredAnalyses.map((analysis) => (
                                    <tr key={analysis.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {analysis.field_name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {new Date(analysis.analysis_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(analysis.soil_score)}`}>
                                                {analysis.soil_score}/100
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {analysis.ndvi_mean !== null && analysis.ndvi_mean !== undefined ? Number(analysis.ndvi_mean).toFixed(3) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedAnalysis(analysis)}
                                                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => downloadReport(analysis.id, analysis.field_name)}
                                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                >
                                                    PDF
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-12 border border-green-100 dark:border-gray-600 text-center">
                    <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm mx-auto mb-6">
                        <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Analysis Data Yet</h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                        Run soil analysis on your fields to generate reports and export data.
                    </p>
                </div>
            )}

            {/* Analysis Modal */}
            <AnalysisModal
                isOpen={!!selectedAnalysis}
                onClose={() => setSelectedAnalysis(null)}
                analysis={selectedAnalysis}
                fieldName={selectedAnalysis?.field_name}
            />
        </DashboardLayout>
    );
}
