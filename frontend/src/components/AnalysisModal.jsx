import { X, ExternalLink, Download, Share2 } from 'lucide-react';
import { Button } from './Button';
import { useState } from 'react';
import { downloadReport } from '../services/api';

export function AnalysisModal({ isOpen, onClose, analysis, fieldName }) {
    if (!isOpen || !analysis) return null;

    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            await downloadReport(analysis.id, fieldName);
        } catch (error) {
            alert('Failed to download report. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const score = Math.round(analysis.ndvi_mean * 100);
    const getScoreColor = (s) => s > 70 ? 'text-green-600' : s > 40 ? 'text-yellow-600' : 'text-red-600';
    const getScoreLabel = (s) => s > 70 ? 'Excellent' : s > 40 ? 'Moderate' : 'Critical';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Analysis Report</h2>
                        <p className="text-gray-500 mt-1">Field: <span className="font-semibold text-gray-800">{fieldName}</span> • Date: {analysis.analysis_date}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left: Score Card */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Soil Health Score</p>
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
                                <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                                    Based on NDVI analysis of recent satellite imagery.
                                    {score > 70 ? " Vegetation looks healthy and vigorous." : " Detected stress in vegetation coverage. Investigating irrigation is recommended."}
                                </p>
                            </div>

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
                            <p className="text-sm font-medium text-gray-500 mb-3">Satellite Imagery (NDVI)</p>
                            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100 flex-1 relative min-h-[250px]">
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
                </div>
            </div>
        </div>
    );
}
