import AIChat from './AIChat';
import IncidentList from './IncidentList';
import useRealTimeLogs from '../hooks/useRealTimeLogs';

const AIHub = () => {
    const { aiStats } = useRealTimeLogs();

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-brand-dark uppercase tracking-tight">AI Integration Hub</h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Intelligent Anomaly Detection & Assistance</p>
                    </div>

                    <div className="px-5 py-3 bg-brand-dark rounded-xl border border-brand-yellow/20 shadow-xl flex items-center gap-6">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest mb-1 text-gray-400">Total Usage Cost</div>
                            <div className="text-2xl font-black text-brand-yellow tracking-tight">
                                <span className="text-sm font-bold mr-0.5">$</span>{aiStats.totalCost}
                            </div>
                        </div>
                        <div className="h-10 w-px bg-brand-yellow/10" />
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter flex flex-col gap-0.5">
                            <span className="flex justify-between gap-4 italic opacity-70 border-b border-brand-yellow/5 pb-0.5">Input <span className="text-brand-yellow font-black not-italic ml-2">{aiStats.totalInputTokens.toLocaleString()}</span></span>
                            <span className="flex justify-between gap-4 italic opacity-70">Output <span className="text-brand-yellow font-black not-italic ml-2">{aiStats.totalOutputTokens.toLocaleString()}</span></span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <section>
                        <IncidentList />
                    </section>
                    <section>
                        <AIChat />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AIHub;
