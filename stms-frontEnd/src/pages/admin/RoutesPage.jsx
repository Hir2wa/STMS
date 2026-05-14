import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin } from 'lucide-react';
import { routeService } from '../../services/routeService';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

const getErrorMessage = (error, fallback = 'Operation failed') => {
    const data = error?.response?.data;
    if (!data) return error?.message || fallback;
    if (typeof data === 'string') return data;
    return data?.message || data?.error || (() => {
        try {
            return JSON.stringify(data);
        } catch {
            return fallback;
        }
    })();
};

const RoutesPage = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(2);
    const [showModal, setShowModal] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [formData, setFormData] = useState({
        routeName: '',
        startPoint: '',
        endPoint: '',
        distance: ''
    });

    useEffect(() => {
        fetchRoutes();
        
        // Check if we came from global search
        const globalSearchQuery = sessionStorage.getItem('globalSearchQuery');
        const globalSearchType = sessionStorage.getItem('globalSearchType');
        if (globalSearchQuery && globalSearchType === 'routes') {
            setSearchTerm(globalSearchQuery);
            // Clear the session storage
            sessionStorage.removeItem('globalSearchQuery');
            sessionStorage.removeItem('globalSearchType');
        }
    }, []);

    const fetchRoutes = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !token.trim()) {
                setLoading(false);
                return;
            }
            const data = await routeService.getAll();
            setRoutes(data || []);
        } catch (error) {
            if (error.message?.includes('authentication') || error.message?.includes('Session expired')) {
                // Don't show error toast, redirect will happen
                setLoading(false);
                return;
            }
            toast.error('Failed to fetch routes');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Prepare route data with proper type conversion
            const routeData = {
                routeName: formData.routeName,
                startPoint: formData.startPoint,
                endPoint: formData.endPoint,
                distance: formData.distance && formData.distance.trim() !== '' 
                    ? parseFloat(formData.distance) 
                    : null
            };

            if (editingRoute) {
                await routeService.update(editingRoute.routeId, routeData);
                toast.success('Route updated successfully');
            } else {
                await routeService.create(routeData);
                toast.success('Route added successfully');
            }
            setShowModal(false);
            setEditingRoute(null);
            setFormData({ routeName: '', startPoint: '', endPoint: '', distance: '' });
            fetchRoutes();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Operation failed'));
        }
    };

    const handleEdit = (route) => {
        setEditingRoute(route);
        setFormData({
            routeName: route.routeName || '',
            startPoint: route.startPoint || '',
            endPoint: route.endPoint || '',
            distance: route.distance != null ? String(route.distance) : ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this route?')) return;
        try {
            await routeService.delete(id);
            toast.success('Route deleted successfully');
            fetchRoutes();
        } catch (error) {
            toast.error('Failed to delete route');
        }
    };

    const filteredRoutes = routes.filter(route =>
        route.routeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.startPoint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.endPoint?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredRoutes.length / pageSize);
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRoutes = filteredRoutes.slice(startIndex, endIndex);

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Routes</h1>
                    <p className="text-gray-600 mt-1">Manage transportation routes</p>
                </div>
                <button
                    onClick={() => { setShowModal(true); setEditingRoute(null); setFormData({ routeName: '', startPoint: '', endPoint: '', distance: '' }); }}
                    className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition"
                >
                    <Plus className="h-5 w-5" /> Add Route
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search routes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : filteredRoutes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No routes found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Route Name</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Start Point</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">End Point</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Distance</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRoutes.map((route) => (
                                    <tr key={route.routeId} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 flex items-center gap-3">
                                            <div className="h-10 w-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                                <MapPin className="h-5 w-5 text-teal-700" />
                                            </div>
                                            {route.routeName}
                                        </td>
                                        <td className="py-3 px-4">{route.startPoint || '-'}</td>
                                        <td className="py-3 px-4">{route.endPoint || '-'}</td>
                                        <td className="py-3 px-4">{route.distance ? `${route.distance} km` : '-'}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleEdit(route)} className="p-2 hover:bg-gray-100 rounded-lg">
                                                    <Edit2 className="h-4 w-4 text-gray-600" />
                                                </button>
                                                <button onClick={() => handleDelete(route.routeId)} className="p-2 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && filteredRoutes.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        pageSize={pageSize}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            setCurrentPage(0);
                        }}
                        totalElements={filteredRoutes.length}
                    />
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editingRoute ? 'Edit Route' : 'Add New Route'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Route Name</label>
                                <input
                                    type="text"
                                    value={formData.routeName}
                                    onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Point</label>
                                <input
                                    type="text"
                                    value={formData.startPoint}
                                    onChange={(e) => setFormData({ ...formData, startPoint: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Point</label>
                                <input
                                    type="text"
                                    value={formData.endPoint}
                                    onChange={(e) => setFormData({ ...formData, endPoint: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                                <input
                                    type="number"
                                    value={formData.distance}
                                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
                                >
                                    {editingRoute ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoutesPage;
