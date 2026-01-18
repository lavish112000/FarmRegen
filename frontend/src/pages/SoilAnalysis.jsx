import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import api from '../services/api';
import { AnalysisModal } from '../components/AnalysisModal';
import { Calendar, Activity, ArrowUpRight, TrendingUp, Filter } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

export default function SoilAnalysis() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [fieldFilter, setFieldFilter] = useState('all');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/analysis/history');
                setHistory(response.data);
            } catch (error) {
                console.error('Failed to fetch history', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Filter logic
    const uniqueFields = useMemo(() => {
        const names = history.map(h => h.field_name);
        return [...new Set(names)];
    }, [history]);

    const filteredHistory = useMemo(() => {
        return fieldFilter === 'all'
            ? history
            : history.filter(h => h.field_name === fieldFilter);
    }, [history, fieldFilter]);

    // Chart Data Preparation
    const chartData = useMemo(() => {
        // Sort by date ascending for chart
        const sorted = [...filteredHistory].sort((a, b) => new Date(a.analysis_date) - new Date(b.analysis_date));
        return sorted.map(h => ({
            date: new Date(h.analysis_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            score: Math.round((h.ndvi_mean || 0) * 100),
            fullDate: h.analysis_date,
            field: h.field_name
        }));
    }, [filteredHistory]);

    return (
        <DashboardLayout>
            <AnalysisModal
                isOpen={!!selectedAnalysis}
                analysis={selectedAnalysis}
                fieldName={selectedAnalysis?.field_name}
                onClose={() => setSelectedAnalysis(null)}
            />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Analysis Trends</h1>
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <select
                        className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2"
                        value={fieldFilter}
                        onChange={(e) => setFieldFilter(e.target.value)}
                    >
                        <option value="all">All Fields</option>
                        {uniqueFields.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : history.length === 0 ? (
                <div className="bg-white p-12 rounded-xl text-center shadow-sm border border-gray-100">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Analysis Data</h3>
                    <p className="text-gray-500 mt-2">Run an analysis on your dashboard to see records here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Chart Section */}
                    {chartData.length > 1 && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                                Health Trend {fieldFilter !== 'all' && `(${fieldFilter})`}
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ stroke: '#22c55e', strokeWidth: 2 }}
                                        />
                                        <ReferenceLine y={40} stroke="orange" strokeDasharray="3 3" />
                                        <ReferenceLine y={70} stroke="green" strokeDasharray="3 3" />
                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            stroke="#16a34a"
                                            strokeWidth={3}
                                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                            activeDot={{ r: 6, fill: '#16a34a' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* History Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredHistory.map((record) => (
                            <div key={record.id} onClick={() => setSelectedAnalysis(record)} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer group">
                                <div className="h-40 bg-gray-100 relative">
                                    {record.satellite_image_url ? (
                                        <img src={record.satellite_image_url} alt="Map" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-700">
                                        {record.ndvi_mean ? Math.round(record.ndvi_mean * 100) : '-'} Score
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 line-clamp-1">{record.field_name}</h3>
                                        <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="w-3 h-3 mr-2" />
                                        {new Date(record.analysis_date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
