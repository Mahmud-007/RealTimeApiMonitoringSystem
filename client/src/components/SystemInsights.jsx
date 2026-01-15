import { Activity, Zap } from 'lucide-react';

const SystemInsights = () => {
    return (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white shadow-lg mb-8">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                    <Activity size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">System Insights (AI)</h2>
                    <p className="text-indigo-100 text-sm">Real-time analysis powered by LLM</p>
                </div>
            </div>
            
            <div className="bg-white/10 rounded-md p-4 backdrop-blur-sm border border-white/20">
                <p className="text-sm text-indigo-100 italic flex items-center gap-2">
                    <Zap size={16} /> Analysis incoming in Phase 4...
                </p>
            </div>
        </div>
    );
};

export default SystemInsights;
