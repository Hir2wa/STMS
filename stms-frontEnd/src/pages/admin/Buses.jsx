import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Bus as BusIcon, UserPlus, UserX } from 'lucide-react';
import { busService } from '../../services/busService';
import { driverService } from '../../services/driverService';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

const Buses = () => {
    const [buses, setBuses] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(2);
    const [showModal, setShowModal] = useState(false);
    const [editingBus, setEditingBus] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assigningBus, setAssigningBus] = useState(null);
    const [selectedDriverId, setSelectedDriverId] = useState('');
    const [formData, setFormData] = useState({
        plateNumber: '',
        capacity: '',
        status: 'ACTIVE',
    });

    useEffect(() => {
        fetchBuses();
        fetchDrivers();
        
        // Check if we came from global search
        const globalSearchQuery = sessionStorage.getItem('globalSearchQuery');
        const globalSearchType = sessionStorage.getItem('globalSearchType');
        if (globalSearchQuery && globalSearchType === 'buses') {
            setSearchTerm(globalSearchQuery);
            // Clear the session storage
            sessionStorage.removeItem('globalSearchQuery');
            sessionStorage.removeItem('globalSearchType');
        }
    }, []);

    const fetchBuses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !token.trim()) {
                setLoading(false);
                return;
            }
            const data = await busService.getAll();
            setBuses(data || []);
        } catch (error) {
            if (error.message?.includes('authentication') || error.message?.includes('Session expired')) {
                // Don't show error toast, redirect will happen
                return;
            }
            toast.error('Failed to fetch buses');
        } finally {
            setLoading(false);
        }
    };

    const fetchDrivers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !token.trim()) {
                return;
            }
            const data = await driverService.getAll();
            setDrivers(data || []);
        } catch (error) {
            if (error.message?.includes('authentication') || error.message?.includes('Session expired')) {
                // Don't show error, redirect will happen
                return;
            }
            console.error('Failed to fetch drivers');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                plateNumber: formData.plateNumber?.trim(),
                capacity: Number(formData.capacity),
                status: formData.status,
            };

            if (editingBus) {
                await busService.update(editingBus.id, payload);
                toast.success('Bus updated successfully');
            } else {
                await busService.create(payload);
                toast.success('Bus added successfully');
            }
            setShowModal(false);
            setEditingBus(null);
            setFormData({ plateNumber: '', capacity: '', status: 'ACTIVE' });
            fetchBuses();
        } catch (error) {
            const data = error?.response?.data;
            const message =
                typeof data === 'string'
                    ? data
                    : data?.message || data?.error || error?.message || 'Operation failed';
            toast.error(message);
        }
    };

    const openAssignDriver = (bus) => {
        setAssigningBus(bus);
        setSelectedDriverId(bus?.driver?.driverId ? String(bus.driver.driverId) : '');
        setShowAssignModal(true);
    };

    const handleAssignDriver = async (e) => {
        e.preventDefault();
        if (!assigningBus?.id) return;
        if (!selectedDriverId) {
            toast.error('Please select a driver');
            return;
        }
        try {
            await busService.assignDriver(assigningBus.id, Number(selectedDriverId));
            toast.success('Driver assigned successfully');
            setShowAssignModal(false);
            setAssigningBus(null);
            setSelectedDriverId('');
            fetchBuses();
        } catch (error) {
            const data = error?.response?.data;
            const message =
                typeof data === 'string'
                    ? data
                    : data?.message || data?.error || error?.message || 'Failed to assign driver';
            toast.error(message);
        }
    };

    const handleRemoveDriver = async (bus) => {
        if (!bus?.id) return;
        if (!window.confirm('Remove driver from this bus?')) return;
        try {
            await busService.removeDriver(bus.id);
            toast.success('Driver removed successfully');
            fetchBuses();
        } catch (error) {
            const data = error?.response?.data;
            const message =
                typeof data === 'string'
                    ? data
                    : data?.message || data?.error || error?.message || 'Failed to remove driver';
            toast.error(message);
        }
    };

    const handleEdit = (bus) => {
        setEditingBus(bus);
        setFormData({
            plateNumber: bus.plateNumber || '',
            capacity: bus.capacity ?? '',
            status: bus.status || 'ACTIVE',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this bus?')) return;
        try {
            await busService.delete(id);
            toast.success('Bus deleted successfully');
            fetchBuses();
        } catch (error) {
            toast.error('Failed to delete bus');
        }
    };

    const filteredBuses = buses.filter(bus =>
        bus.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredBuses.length / pageSize);
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedBuses = filteredBuses.slice(startIndex, endIndex);

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    const statusLabel = (status) => {
        if (status === 'UNDERMAINTAINANCE') return 'UNDER MAINTENANCE';
        return status || '-';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Buses</h1>
                    <p className="text-gray-600 mt-1">Manage your fleet of buses</p>
                </div>
                <button
                    onClick={() => { setShowModal(true); setEditingBus(null); setFormData({ plateNumber: '', capacity: '', status: 'ACTIVE' }); }}
                    className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition"
                >
                    <Plus className="h-5 w-5" /> Add Bus
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search buses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : filteredBuses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No buses found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Plate Number</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Capacity</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Status</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Driver</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedBuses.map((bus) => (
                                    <tr key={bus.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 flex items-center gap-3">
                                            <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                <BusIcon className="h-5 w-5 text-emerald-700" />
                                            </div>
                                            {bus.plateNumber}
                                        </td>
                                        <td className="py-3 px-4">{bus.capacity} seats</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${bus.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                    bus.status === 'INACTIVE' ? 'bg-gray-100 text-gray-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {statusLabel(bus.status)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {bus.driver ? (
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">{bus.driver.name}</div>
                                                    <div className="text-gray-500">{bus.driver.licenseNumber || ''}</div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openAssignDriver(bus)}
                                                    className="p-2 hover:bg-emerald-50 rounded-lg"
                                                    title="Assign driver"
                                                >
                                                    <UserPlus className="h-4 w-4 text-emerald-700" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveDriver(bus)}
                                                    className="p-2 hover:bg-red-50 rounded-lg"
                                                    title="Remove driver"
                                                    disabled={!bus.driver}
                                                >
                                                    <UserX className={`h-4 w-4 ${bus.driver ? 'text-red-600' : 'text-gray-300'}`} />
                                                </button>
                                                <button onClick={() => handleEdit(bus)} className="p-2 hover:bg-gray-100 rounded-lg">
                                                    <Edit2 className="h-4 w-4 text-gray-600" />
                                                </button>
                                                <button onClick={() => handleDelete(bus.id)} className="p-2 hover:bg-red-50 rounded-lg">
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

                {!loading && filteredBuses.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        pageSize={pageSize}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            setCurrentPage(0);
                        }}
                        totalElements={filteredBuses.length}
                    />
                )}
            </div>

            {showAssignModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Assign Driver</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Bus: <span className="font-medium">{assigningBus?.plateNumber}</span>
                        </p>
                        <form onSubmit={handleAssignDriver} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                                <select
                                    value={selectedDriverId}
                                    onChange={(e) => setSelectedDriverId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                >
                                    <option value="">Select driver</option>
                                    {drivers.map((d) => (
                                        <option key={d.driverId} value={d.driverId}>
                                            {d.name} {d.licenseNumber ? `(${d.licenseNumber})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowAssignModal(false); setAssigningBus(null); setSelectedDriverId(''); }}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
                                >
                                    Assign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editingBus ? 'Edit Bus' : 'Add New Bus'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
                                <input
                                    type="text"
                                    value={formData.plateNumber}
                                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="UNDERMAINTAINANCE">Under maintenance</option>
                                </select>
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
                                    {editingBus ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Buses;
