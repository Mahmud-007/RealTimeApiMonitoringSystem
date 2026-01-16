import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const IncidentList = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchIncidents = async () => {
        try {
            const res = await fetch('/api/ai/incidents');
            const data = await res.json();
            if (Array.isArray(data)) {
                setIncidents(data);
            }
        } catch (err) {
            console.error("Failed to fetch incidents", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
        const interval = setInterval(fetchIncidents, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    if (loading && incidents.length === 0) return <div className="text-center py-4 text-gray-400">Loading incidents...</div>;

    if (incidents.length === 0) return (
        <div className="flex flex-col items-center justify-center h-[600px] border border-dashed border-gray-200 rounded-lg text-gray-400 bg-white">
            <CheckCircle size={48} className="mb-2 text-green-500 opacity-50" />
            <p>No active incidents detected.</p>
        </div>
    );

    return (
        <div className="h-[600px] flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="text-amber-500" size={20} />
                    <h3 className="font-bold text-gray-800">Detected Incidents</h3>
                </div>
                <span className="text-xs font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{incidents.length} Active</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {incidents.map(incident => (
                    <div key={incident._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${incident.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                {incident.type}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(incident.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <p className="font-medium text-gray-800 text-sm mb-2">{incident.description}</p>

                        {incident.rootCauseAnalysis && (
                            <div className="bg-indigo-50/50 border border-indigo-100 rounded-md p-3 text-sm space-y-2">
                                <div>
                                    <span className="text-xs font-bold text-indigo-600 uppercase">Analysis</span>
                                    <p className="text-gray-600 mt-0.5">{incident.rootCauseAnalysis}</p>
                                </div>
                                {incident.suggestedFix && (
                                    <div>
                                        <span className="text-xs font-bold text-emerald-600 uppercase">Suggested Fix</span>
                                        <p className="text-gray-600 mt-0.5">{incident.suggestedFix}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!incident.rootCauseAnalysis && (
                            <div className="text-xs text-gray-400 italic mt-2 animate-pulse">
                                AI is analyzing...
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IncidentList;
