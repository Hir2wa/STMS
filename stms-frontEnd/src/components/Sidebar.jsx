import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ menuItems }) => {
    const location = useLocation();

    return (
        <aside className="w-72 bg-[#1a3a2f] text-white min-h-screen flex flex-col shadow-2xl z-20">
            <div className="px-6 py-8 border-b border-[#2d5a47] flex items-center justify-center">
                <div className="h-10 w-10 bg-[#d4a574] rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-[#d4a574]/30">
                    <span className="font-bold text-xl text-[#1a3a2f]">S</span>
                </div>
                <span className="text-2xl font-bold tracking-tight text-[#f5e6d3]">STMS</span>
            </div>

            <div className="px-6 py-6">
                <p className="text-xs uppercase tracking-wider text-[#8ba89a] font-bold mb-4 px-2">Main Menu</p>
                <nav className="space-y-1">
                    {menuItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={index}
                                to={item.path}
                                className={`group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-[#d4a574] text-[#1a3a2f] shadow-lg shadow-[#d4a574]/40 translate-x-1'
                                    : 'text-[#c5d4cb] hover:bg-[#2d5a47] hover:text-[#f5e6d3] hover:translate-x-1'
                                    }`}
                            >
                                {Icon && <Icon className={`h-5 w-5 ${isActive ? 'text-[#1a3a2f]' : 'text-[#8ba89a] group-hover:text-[#f5e6d3]'}`} />}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-[#2d5a47]">
                <div className="bg-[#2d5a47]/50 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-xs text-[#8ba89a] text-center">System v1.0.0</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

