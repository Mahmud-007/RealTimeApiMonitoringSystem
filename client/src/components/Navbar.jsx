import { LayoutDashboard, Sparkles } from 'lucide-react';

const Navbar = ({ currentView, setCurrentView }) => {
    return (
        <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-biz-dark p-1.5 rounded-lg border border-biz-yellow/30">
                        <img
                            src="https://www.bizscout.com/favicon.ico"
                            alt="BizScout"
                            className="w-5 h-5 object-contain"
                        />
                    </div>
                    <span className="font-bold text-biz-dark text-lg uppercase tracking-tight">BizScout Monitor</span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentView('dashboard')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${currentView === 'dashboard'
                            ? 'bg-biz-yellow text-biz-dark shadow-sm'
                            : 'text-gray-500 hover:text-biz-dark hover:bg-biz-yellow/10'
                            }`}
                    >
                        <LayoutDashboard size={16} />
                        Dashboard
                    </button>
                    <button
                        onClick={() => setCurrentView('ai')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${currentView === 'ai'
                            ? 'bg-biz-yellow text-biz-dark shadow-sm'
                            : 'text-gray-500 hover:text-biz-dark hover:bg-biz-yellow/10'
                            }`}
                    >
                        <Sparkles size={16} />
                        AI Insights
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
