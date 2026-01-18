import { DashboardLayout } from '../components/DashboardLayout';
import { BookOpen, Sprout, Activity, Database, TrendingUp, DollarSign } from 'lucide-react';

export default function Learn() {
    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">Learning Center</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">

                {/* 1. What is NDVI? */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                        <Database className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">What is NDVI?</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        The **Normalized Difference Vegetation Index (NDVI)** is a simple graphical indicator that can be used to analyze remote sensing measurements and assess whether the target being observed contains live green vegetation or not.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        Healthy vegetation reflects more near-infrared (NIR) and green light compared to other wavelengths. By comparing these values, satellites like Sentinel-2 can determine the density and health of the crop canopy.
                    </p>
                </div>

                {/* 2. Understanding the Score */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                        <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Reading Your Soil Score</h2>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 mr-3 flex-shrink-0"></div>
                            <div>
                                <span className="font-bold text-gray-800">70 - 100 (Excellent)</span>
                                <p className="text-sm text-gray-500 mt-1">Dense, healthy vegetation. Photosynthesis is active and vigorous.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1.5 mr-3 flex-shrink-0"></div>
                            <div>
                                <span className="font-bold text-gray-800">40 - 69 (Moderate)</span>
                                <p className="text-sm text-gray-500 mt-1">Some stress detected. Could be due to water shortage, nutrient lack, or early growth stage.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 mr-3 flex-shrink-0"></div>
                            <div>
                                <span className="font-bold text-gray-800">0 - 39 (Critical)</span>
                                <p className="text-sm text-gray-500 mt-1">Bare soil, inorganic material, or dead vegetation. Requires immediate attention.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Soil Regeneration */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 md:col-span-2">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                        <Sprout className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Regenerative Agriculture 101</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-gray-800 mb-2">1. Minimize Soil Disturbance</h3>
                            <p className="text-gray-600 text-sm">
                                Tilling destroys soil structure and fungal networks. No-till farming preserves organic matter and prevents erosion.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 mb-2">2. Cover Crops</h3>
                            <p className="text-gray-600 text-sm">
                                Never leave soil bare. Planting cover crops (clover, rye) protects the soil surface and roots feed microbes.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 mb-2">3. Crop Rotation</h3>
                            <p className="text-gray-600 text-sm">
                                Rotating crops breaks pest cycles and naturally replenishes specific nutrients in the soil.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 mb-2">4. Integrated Livestock</h3>
                            <p className="text-gray-600 text-sm">
                                Managed grazing can stimulate plant growth and return natural fertilizer (manure) to the soil system.
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                        <p className="text-emerald-800 font-medium text-sm">
                            <BookOpen className="w-4 h-4 inline mr-2" />
                            Want to learn more? Check out the <a href="https://rodaleinstitute.org/why-organic/organic-farming-practices/regenerative-organic-agriculture/" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-900">Rodale Institute</a> or <a href="https://www.nrcs.usda.gov/conservation-basics/natural-resource-concerns/soil" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-900">USDA NRCS</a> resources.
                        </p>
                    </div>
                </div>

                {/* 4. The Impact (New Section) */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-sm border border-blue-100 md:col-span-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Why Soil Health Matters: The Data</h2>
                    <p className="text-gray-600 mb-6">
                        Transitioning to regenerative practices is not just about environmental stewardship; it's an economic imperative.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-5 rounded-xl shadow-sm">
                            <div className="flex items-center mb-2">
                                <Sprout className="w-5 h-5 text-green-500 mr-2" />
                                <span className="font-bold text-gray-700">Carbon Capture</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">1.5 Tons</p>
                            <p className="text-xs text-gray-500 mt-1">of CO2 sequestered per acre annually by regenerative farms.</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm">
                            <div className="flex items-center mb-2">
                                <DollarSign className="w-5 h-5 text-yellow-500 mr-2" />
                                <span className="font-bold text-gray-700">Profitability</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">+$150/acre</p>
                            <p className="text-xs text-gray-500 mt-1">Average increase in profit due to reduced input costs (fertilizer/fuel).</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm">
                            <div className="flex items-center mb-2">
                                <Database className="w-5 h-5 text-blue-500 mr-2" />
                                <span className="font-bold text-gray-700">Water Retention</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">+30%</p>
                            <p className="text-xs text-gray-500 mt-1">Higher water holding capacity, creating drought resilience.</p>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
