import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, GraduationCap, Bus, User, Route, Megaphone } from 'lucide-react';
import { globalSearchService } from '../services/globalSearchService';
import toast from 'react-hot-toast';

const GlobalSearch = ({ onClose }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) {
            toast.error('Please enter a search term');
            return;
        }

        setLoading(true);
        try {
            const data = await globalSearchService.search(query.trim(), 0, 5);
            setResults(data);
        } catch (error) {
            toast.error('Search failed');
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEntityIcon = (type) => {
        switch (type) {
            case 'students':
                return <GraduationCap className="h-4 w-4" />;
            case 'buses':
                return <Bus className="h-4 w-4" />;
            case 'drivers':
                return <User className="h-4 w-4" />;
            case 'routes':
                return <Route className="h-4 w-4" />;
            case 'announcements':
                return <Megaphone className="h-4 w-4" />;
            default:
                return <Search className="h-4 w-4" />;
        }
    };

    const handleItemClick = (item, type) => {
        // Determine the route based on entity type
        let route = '';
        switch (type) {
            case 'students':
                route = '/admin/students';
                break;
            case 'buses':
                route = '/admin/buses';
                break;
            case 'drivers':
                route = '/admin/drivers';
                break;
            case 'routes':
                route = '/admin/routes';
                break;
            case 'announcements':
                route = '/admin/announcements';
                break;
            default:
                return;
        }

        // Close the search modal
        onClose();
        
        // Navigate to the appropriate page
        navigate(route);
        
        // Store the search query in sessionStorage so the target page can highlight/filter results
        if (query.trim()) {
            sessionStorage.setItem('globalSearchQuery', query.trim());
            sessionStorage.setItem('globalSearchType', type);
            // Clear after a short delay to avoid persistence issues
            setTimeout(() => {
                sessionStorage.removeItem('globalSearchQuery');
                sessionStorage.removeItem('globalSearchType');
            }, 5000);
        }
    };

    const renderResults = (items, type, label) => {
        if (!items || items.content?.length === 0) return null;

        return (
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                    {getEntityIcon(type)}
                    <span>{label} ({items.totalElements})</span>
                </div>
                <div className="space-y-1">
                    {items.content.slice(0, 3).map((item, idx) => (
                        <div
                            key={idx}
                            className="p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer text-sm transition-colors"
                            onClick={() => handleItemClick(item, type)}
                        >
                            {item.name || item.plateNumber || item.routeName || item.title || 'N/A'}
                        </div>
                    ))}
                    {items.totalElements > 3 && (
                        <div 
                            className="text-xs text-gray-500 p-2 hover:text-gray-700 cursor-pointer"
                            onClick={() => handleItemClick(null, type)}
                        >
                            +{items.totalElements - 3} more...
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-20">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Global Search</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search across students, buses, drivers, routes, announcements..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            autoFocus
                        />
                    </form>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Searching...</div>
                    ) : results ? (
                        <div>
                            {renderResults(results.students, 'students', 'Students')}
                            {renderResults(results.buses, 'buses', 'Buses')}
                            {renderResults(results.drivers, 'drivers', 'Drivers')}
                            {renderResults(results.routes, 'routes', 'Routes')}
                            {renderResults(results.announcements, 'announcements', 'Announcements')}
                            {(!results.students?.content?.length &&
                                !results.buses?.content?.length &&
                                !results.drivers?.content?.length &&
                                !results.routes?.content?.length &&
                                !results.announcements?.content?.length) && (
                                <div className="text-center py-8 text-gray-500">No results found</div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            Enter a search term to find students, buses, drivers, routes, and announcements
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;

