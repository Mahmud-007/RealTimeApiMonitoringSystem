import { LayoutDashboard, Sparkles } from 'lucide-react';

const Navbar = ({ currentView, setCurrentView }) => {
    return (
        <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 p-1.5 rounded-lg">
                        <LayoutDashboard size={20} className="text-white" />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">BizScout Monitor</span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentView('dashboard')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                            currentView === 'dashboard'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                    >
                        <LayoutDashboard size={16} />
                        Dashboard
                    </button>
                    <button
                        onClick={() => setCurrentView('ai')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                            currentView === 'ai'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
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
