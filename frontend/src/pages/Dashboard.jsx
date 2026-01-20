import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Components
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import FieldMap from '../components/FieldMap';
import { AnalysisModal } from '../components/AnalysisModal';

// Icons
import {
    Sprout,
    MapPin,
    ArrowUpRight,
    MoreVertical,
    Trash2,
    Activity,
    Plus,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
    // State
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);

    // Field Creation
    const [isDrawMode, setIsDrawMode] = useState(false);
    const [newFieldGeoJSON, setNewFieldGeoJSON] = useState(null);
    const [newFieldName, setNewFieldName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Analysis
    const [analyzingId, setAnalyzingId] = useState(null);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null); // For Modal
    const [selectedFieldForModal, setSelectedFieldForModal] = useState('');

    // Stats
    const totalArea = fields.reduce((acc, f) => acc + (parseFloat(f.hectares) || 0), 0).toFixed(1);
    const avgHealth = fields.length > 0
        ? Math.round(fields.reduce((acc, f) => acc + (parseFloat(f.soil_health_score) || 0), 0) / fields.filter(f => f.soil_health_score).length || 0)
        : 0;
    useEffect(() => {
        fetchFields();
    }, []);

    const fetchFields = async () => {
        try {
            const response = await api.get('/fields');
            setFields(response.data);
        } catch (error) {
            console.error('Failed to fetch fields', error);
        } finally {
            setLoading(false);
        }
    };

    const onFieldCreated = useCallback((geojson) => {
        setNewFieldGeoJSON(geojson);
        setIsDrawMode(true); // Trigger save form view
    }, []);

    const saveField = async () => {
        console.log("saveField called", newFieldName, newFieldGeoJSON); // DEBUG
        if (!newFieldName || !newFieldGeoJSON) return;
        setIsSaving(true);
        try {
            console.log("Sending API request..."); // DEBUG
            await api.post('/fields', {
                name: newFieldName,
                geojson: newFieldGeoJSON,
                // hectares: 0, // Removed to allow backend to default to 0 and pass min(0.01) validation
                address: ''

            });
            console.log("API request success"); // DEBUG
            setIsDrawMode(false);
            setNewFieldName('');
            setNewFieldGeoJSON(null);
            fetchFields();
        } catch (error) {
            console.error('Failed to save field', error);
            alert('Failed to save field: ' + (error.response?.data?.message || error.message)); // Specific error
        } finally {
            setIsSaving(false);
        }
    };

    const deleteField = async (id) => {
        if (!confirm('Are you sure you want to delete this field?')) return;
        try {
            await api.delete(`/fields/${id}`);
            fetchFields();
        } catch (error) {
            console.error("Failed to delete field", error);
        }
    }

    const analyzeField = async (field) => {
        setAnalyzingId(field.id);
        try {
            const response = await api.post(`/analysis/${field.id}`);
            // Open Modal immediately with result
            setSelectedAnalysis(response.data);
            setSelectedFieldForModal(field.name);
            fetchFields(); // Refresh list background
        } catch (error) {
            console.error("Analysis failed", error);
            alert("Analysis failed. Please try again.");
        } finally {
            setAnalyzingId(null);
        }
    };

    return (
        <DashboardLayout>
                {/* ... (rest of the component structure remains, just wrapped) */}

                {/* Analysis Result Modal */}
                <AnalysisModal
                    isOpen={!!selectedAnalysis}
                    analysis={selectedAnalysis}
                    fieldName={selectedFieldForModal}
                    onClose={() => setSelectedAnalysis(null)}
                />

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-all"
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Fields</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{fields.length}</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                            <MapPin className="w-6 h-6" />
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-all"
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monitor Area</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalArea} <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">ha</span></p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                            <Sprout className="w-6 h-6" />
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-all"
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Health</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{avgHealth || '-'}<span className="text-sm font-semibold text-gray-400 dark:text-gray-500">/100</span></p>
                        </div>
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl text-yellow-600 dark:text-yellow-400">
                            <Activity className="w-6 h-6" />
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-green-600 to-emerald-700 dark:from-emerald-700 dark:to-green-900 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-center items-start"
                    >
                        <p className="font-semibold text-lg">Next Scan Available</p>
                        <p className="text-green-100 text-sm mt-1">Satellite passes in 2 days</p>
                    </motion.div>
                </div>

                {/* Main Content: Map & List Side-by-Side */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">

                    {/* Map Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-2 flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden relative"
                    >
                        <div className="p-4 border-b border-gray-50 dark:border-slate-700/50 flex justify-between items-center bg-white dark:bg-slate-800 z-10">
                            <div>
                                <h2 className="font-bold text-gray-800 dark:text-gray-100">Satellite Map</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Draw polygons to register new fields</p>
                            </div>
                        </div>

                        <div className="flex-1 relative z-0">
                            <FieldMap onFieldCreated={onFieldCreated} fields={fields} />
                        </div>

                        {isDrawMode && (
                            <div className="absolute top-20 right-4 z-[400] bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border border-green-100 dark:border-slate-700 w-80 animate-scale-in">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100">New Field Detected</h3>
                                    <button onClick={() => { setIsDrawMode(false); setNewFieldGeoJSON(null) }} className="bg-gray-100 p-1 rounded-full"><Plus className="rotate-45 text-gray-500 w-4 h-4" /></button>
                                </div>
                                <Input
                                    placeholder="Field Name (e.g. Rice Plot A)"
                                    value={newFieldName}
                                    onChange={(e) => setNewFieldName(e.target.value)}
                                    className="mb-3"
                                    autoFocus
                                />
                                <Button
                                    className="w-full"
                                    onClick={saveField}
                                    isLoading={isSaving}
                                >
                                    Save Field
                                </Button>
                            </div>
                        )}
                    </motion.div>

                    {/* Field List Column */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
                    >
                        <div className="p-5 border-b border-gray-50 dark:border-slate-700/50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg">My Fields</h2>
                            <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400"><Plus className="w-4 h-4 mr-1" /> Add</Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-green-500" /></div>
                            ) : fields.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    No fields yet. Draw on the map to start.
                                </div>
                            ) : (
                                fields.map(field => (
                                    <div key={field.id} className="group bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-transparent hover:border-green-200 dark:hover:border-green-500/30 hover:bg-green-50/50 dark:hover:bg-slate-700 transition-all duration-200 relative">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start space-x-3">
                                                <div className={`mt-1 w-2 h-2 rounded-full ${field.soil_health_score > 70 ? 'bg-green-500' : field.soil_health_score ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{field.name}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Updated: {new Date(field.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => deleteField(field.id)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">Health Score</span>
                                                <span className={`text-lg font-bold ${!field.soil_health_score ? 'text-gray-400 dark:text-gray-500' : field.soil_health_score > 70 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                                    {field.soil_health_score || '--'}
                                                </span>
                                            </div>

                                            <Button
                                                size="sm"
                                                variant={field.soil_health_score ? "outline" : "primary"}
                                                className={field.soil_health_score ? "bg-white dark:bg-slate-600 dark:border-slate-500 dark:text-gray-200" : "shadow-md shadow-green-200 dark:shadow-none"}
                                                onClick={() => analyzeField(field)}
                                                isLoading={analyzingId === field.id}
                                            >
                                                {analyzingId === field.id ? 'Scanning...' : 'Analyze'}
                                                {!analyzingId && <ArrowUpRight className="w-3 h-3 ml-1" />}
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
        </DashboardLayout>
    );
}
