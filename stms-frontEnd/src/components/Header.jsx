import React, { useState } from 'react';
import { User, LogOut, Search } from 'lucide-react';
import GlobalSearch from './GlobalSearch';

const Header = ({ user, onLogout }) => {
    const [showGlobalSearch, setShowGlobalSearch] = useState(false);

    return (
        <>
            <header className="bg-[#f5e6d3] shadow-sm border-b border-[#d4a574]/30 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-[#1a3a2f] leading-tight">Dashboard</h1>
                    <span className="text-sm text-[#5a7d6a]">Welcome back, {user?.fullNames?.split(' ')[0]}</span>
                </div>
                <div className="flex items-center space-x-6">
                    <button
                        onClick={() => setShowGlobalSearch(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-[#1a3a2f] rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium border border-[#d4a574]/30"
                        title="Global Search (Ctrl+K)"
                    >
                        <Search className="h-4 w-4" />
                        Search
                    </button>
                    <div className="flex items-center space-x-3">
                        <div className="bg-[#1a3a2f] p-2 rounded-full">
                            <User className="h-5 w-5 text-[#d4a574]" />
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-semibold text-[#1a3a2f]">{user?.fullNames || 'User'}</div>
                            <div className="text-xs text-[#5a7d6a] uppercase tracking-wider">{user?.role || 'GUEST'}</div>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-[#d4a574]/40 mx-2"></div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a3a2f] text-[#f5e6d3] rounded-lg hover:bg-[#2d5a47] transition-colors text-sm font-medium"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </header>
            {showGlobalSearch && <GlobalSearch onClose={() => setShowGlobalSearch(false)} />}
        </>
    );
};

export default Header;

