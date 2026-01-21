import { X, ExternalLink, Download, Share2, Droplets, Leaf, Sun } from 'lucide-react';
import { Button } from './Button';
import { useState } from 'react';
import { downloadReport } from '../services/api';

export function AnalysisModal({ isOpen, onClose, analysis, fieldName }) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    if (!isOpen || !analysis) return null;

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            await downloadReport(analysis.id, fieldName);
        } catch {
            alert('Failed to download report. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Use soil_score from backend (includes uniformity penalty), fallback to NDVI calculation
    const score = analysis.soil_score ?? Math.round((analysis.ndvi_mean || 0) * 100);
    const getScoreColor = (s) => s > 70 ? 'text-green-600' : s > 40 ? 'text-yellow-600' : 'text-red-600';
    const getScoreLabel = (s) => s > 70 ? 'Excellent' : s > 40 ? 'Moderate' : 'Critical';

    // Parse indices data if available
    const indices = analysis.indices_data ?
        (typeof analysis.indices_data === 'string' ? JSON.parse(analysis.indices_data) : analysis.indices_data)
        : analysis.indices || null;

    // Helper to format index values
    const formatIndex = (value) => {
        const num = Number(value);
        return value !== null && value !== undefined && !isNaN(num) ? num.toFixed(3) : 'N/A';
    };

    // Moisture status color
    const getMoistureColor = (status) => {
        switch (status) {
            case 'Adequate': return 'text-blue-600 bg-blue-100';
            case 'Moderate': return 'text-cyan-600 bg-cyan-100';
            case 'Low': return 'text-yellow-600 bg-yellow-100';
            case 'Stressed': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Report</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Field: <span className="font-semibold text-gray-800 dark:text-gray-200">{fieldName}</span> •
                            Date: {new Date(analysis.analysis_date).toLocaleDateString()}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-gray-700 px-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview'
                            ? 'border-green-500 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('indices')}
                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'indices'
                            ? 'border-green-500 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Vegetation Indices
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left: Score Card */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-100 dark:border-gray-600">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Soil Health Score</p>
                                    <div className="mt-4 flex items-baseline space-x-2">
                                        <span className={`text-5xl font-extrabold ${getScoreColor(score)}`}>
                                            {score}
                                        </span>
                                        <span className="text-gray-400 font-medium">/ 100</span>
                                    </div>
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold mt-2 ${score > 70 ? 'bg-green-100 text-green-700' :
                                        score > 40 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {getScoreLabel(score)} Condition
                                    </div>
                                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                        Based on multi-index satellite analysis including NDVI, NDMI, EVI, and SAVI.
                                        {score > 70 ? " Vegetation looks healthy and vigorous." : " Detected stress in vegetation coverage."}
                                    </p>
                                </div>

                                {/* Quick Stats */}
                                {indices && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-green-600 mb-1">
                                                <Leaf className="w-4 h-4" />
                                                <span className="text-xs font-medium">NDVI</span>
                                            </div>
                                            <span className="text-xl font-bold text-green-700 dark:text-green-400">
                                                {formatIndex(indices.ndvi?.mean || analysis.ndvi_mean)}
                                            </span>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                                <Droplets className="w-4 h-4" />
                                                <span className="text-xs font-medium">Moisture</span>
                                            </div>
                                            <span className={`text-sm font-bold px-2 py-0.5 rounded ${getMoistureColor(indices.ndmi?.status || analysis.moisture_status)}`}>
                                                {indices.ndmi?.status || analysis.moisture_status || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex space-x-3">
                                    <Button
                                        className="flex-1"
                                        variant="outline"
                                        onClick={handleDownload}
                                        disabled={isDownloading}
                                    >
                                        {isDownloading ? (
                                            <span className="animate-pulse">Generating...</span>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4 mr-2" /> PDF Report
                                            </>
                                        )}
                                    </Button>
                                    <Button className="flex-1" variant="outline">
                                        <Share2 className="w-4 h-4 mr-2" /> Share
                                    </Button>
                                </div>
                            </div>

                            {/* Right: Satellite Image */}
                            <div className="flex flex-col">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Satellite Imagery (NDVI)</p>
                                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-inner bg-gray-100 dark:bg-gray-700 flex-1 relative min-h-[250px]">
                                    {analysis.satellite_image_url ? (
                                        <img
                                            src={analysis.satellite_image_url}
                                            alt="NDVI Analysis"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            No Image Available
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded backdrop-blur-md">
                                        Sentinel-2 Source
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'indices' && (
                        <div className="space-y-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Detailed vegetation indices calculated from Sentinel-2 satellite imagery.
                            </p>

                            {indices ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* NDVI Card */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-5 border border-green-200 dark:border-green-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-2 bg-green-500 rounded-lg">
                                                <Leaf className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-green-800 dark:text-green-300">NDVI</h3>
                                                <p className="text-xs text-green-600 dark:text-green-400">Vegetation Index</p>
                                            </div>
                                        </div>
                                        <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">
                                            {formatIndex(indices.ndvi?.mean)}
                                        </div>
                                        <p className="text-xs text-green-600 dark:text-green-400">
                                            {indices.ndvi?.description || 'Measures vegetation health and density'}
                                        </p>
                                        <div className="mt-3 flex gap-4 text-xs text-green-600">
                                            <span>Min: {formatIndex(indices.ndvi?.min)}</span>
                                            <span>Max: {formatIndex(indices.ndvi?.max)}</span>
                                        </div>
                                    </div>

                                    {/* NDMI Card */}
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-5 border border-blue-200 dark:border-blue-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-2 bg-blue-500 rounded-lg">
                                                <Droplets className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-blue-800 dark:text-blue-300">NDMI</h3>
                                                <p className="text-xs text-blue-600 dark:text-blue-400">Moisture Index</p>
                                            </div>
                                        </div>
                                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                                            {formatIndex(indices.ndmi?.mean)}
                                        </div>
                                        <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${getMoistureColor(indices.ndmi?.status)}`}>
                                            {indices.ndmi?.status || 'Unknown'}
                                        </div>
                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                            {indices.ndmi?.description || 'Measures vegetation water content'}
                                        </p>
                                    </div>

                                    {/* EVI Card */}
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl p-5 border border-emerald-200 dark:border-emerald-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-2 bg-emerald-500 rounded-lg">
                                                <Sun className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-emerald-800 dark:text-emerald-300">EVI</h3>
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400">Enhanced Vegetation</p>
                                            </div>
                                        </div>
                                        <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                                            {formatIndex(indices.evi?.mean)}
                                        </div>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                            {indices.evi?.description || 'Improved sensitivity in high biomass areas'}
                                        </p>
                                        <div className="mt-3 flex gap-4 text-xs text-emerald-600">
                                            <span>Min: {formatIndex(indices.evi?.min)}</span>
                                            <span>Max: {formatIndex(indices.evi?.max)}</span>
                                        </div>
                                    </div>

                                    {/* SAVI Card */}
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl p-5 border border-amber-200 dark:border-amber-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-2 bg-amber-500 rounded-lg">
                                                <span className="text-white text-lg">🌾</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-amber-800 dark:text-amber-300">SAVI</h3>
                                                <p className="text-xs text-amber-600 dark:text-amber-400">Soil Adjusted</p>
                                            </div>
                                        </div>
                                        <div className="text-3xl font-bold text-amber-700 dark:text-amber-300 mb-2">
                                            {formatIndex(indices.savi?.mean)}
                                        </div>
                                        <p className="text-xs text-amber-600 dark:text-amber-400">
                                            {indices.savi?.description || 'Corrects for soil brightness in sparse vegetation'}
                                        </p>
                                        <div className="mt-3 flex gap-4 text-xs text-amber-600">
                                            <span>Min: {formatIndex(indices.savi?.min)}</span>
                                            <span>Max: {formatIndex(indices.savi?.max)}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <p>Detailed indices data not available for this analysis.</p>
                                    <p className="text-sm mt-2">Run a new analysis to get comprehensive vegetation indices.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
