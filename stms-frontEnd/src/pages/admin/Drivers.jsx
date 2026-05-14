import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { driverService } from '../../services/driverService';
import Pagination from '../../components/Pagination';

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(2);
    const [showModal, setShowModal] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        licenseNumber: '',
        phoneNumber: '',
        experienceYears: '',
    });

    useEffect(() => {
        fetchDrivers();
        
        // Check if we came from global search
        const globalSearchQuery = sessionStorage.getItem('globalSearchQuery');
        const globalSearchType = sessionStorage.getItem('globalSearchType');
        if (globalSearchQuery && globalSearchType === 'drivers') {
            setSearchTerm(globalSearchQuery);
            // Clear the session storage
            sessionStorage.removeItem('globalSearchQuery');
            sessionStorage.removeItem('globalSearchType');
        }
    }, []);

    const fetchDrivers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !token.trim()) {
                setLoading(false);
                return;
            }
            const data = await driverService.getAll();
            setDrivers(data || []);
        } catch (error) {
            if (error.message?.includes('authentication') || error.message?.includes('Session expired')) {
                // Don't show error toast, redirect will happen
                setLoading(false);
                return;
            }
            console.error('Error fetching drivers:', error);
            const data = error?.response?.data;
            const message =
                typeof data === 'string'
                    ? data
                    : data?.message || data?.error || error?.message || 'Failed to fetch drivers';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name?.trim(),
                email: formData.email?.trim(),
                licenseNumber: formData.licenseNumber?.trim(),
                phoneNumber: formData.phoneNumber?.trim() || null,
                experienceYears: formData.experienceYears ? Number(formData.experienceYears) : 0,
            };

            if (editingDriver) {
                await driverService.update(editingDriver.driverId, payload);
                toast.success('Driver updated successfully');
            } else {
                await driverService.create(payload);
                toast.success('Driver added successfully');
                toast('A password setup OTP was sent to the driver email.');
            }
            setShowModal(false);
            setEditingDriver(null);
            setFormData({ name: '', email: '', licenseNumber: '', phoneNumber: '', experienceYears: '' });
            fetchDrivers();
        } catch (error) {
            console.error('Error saving driver:', error);
            const data = error?.response?.data;
            const message =
                typeof data === 'string'
                    ? data
                    : data?.message || data?.error || error?.message || 'Operation failed';
            toast.error(message);
        }
    };

    const handleEdit = (driver) => {
        setEditingDriver(driver);
        setFormData({
            name: driver.name || '',
            email: driver.email || '',
            licenseNumber: driver.licenseNumber || '',
            phoneNumber: driver.phoneNumber || '',
            experienceYears: driver.experienceYears ?? '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this driver?')) return;
        try {
            await driverService.delete(id);
            toast.success('Driver deleted successfully');
            fetchDrivers();
        } catch (error) {
            console.error('Error deleting driver:', error);
            const data = error?.response?.data;
            const message =
                typeof data === 'string'
                    ? data
                    : data?.message || data?.error || error?.message || 'Failed to delete driver';
            toast.error(message);
        }
    };

    const filteredDrivers = drivers.filter(driver =>
        driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredDrivers.length / pageSize);
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedDrivers = filteredDrivers.slice(startIndex, endIndex);

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
                    <p className="text-gray-600 mt-1">Manage your drivers</p>
                </div>
                <button
                    onClick={() => { setShowModal(true); setEditingDriver(null); setFormData({ name: '', email: '', licenseNumber: '', phoneNumber: '', experienceYears: '' }); }}
                    className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition"
                >
                    <Plus className="h-5 w-5" /> Add Driver
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search drivers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : filteredDrivers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No drivers found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Name</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Email</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">License</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Phone</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Experience</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedDrivers.map((driver) => (
                                    <tr key={driver.driverId} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 flex items-center gap-3">
                                            <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                                <UserCheck className="h-5 w-5 text-amber-700" />
                                            </div>
                                            {driver.name}
                                        </td>
                                        <td className="py-3 px-4">{driver.email || '-'}</td>
                                        <td className="py-3 px-4">{driver.licenseNumber || '-'}</td>
                                        <td className="py-3 px-4">{driver.phoneNumber || '-'}</td>
                                        <td className="py-3 px-4">{Number.isFinite(driver.experienceYears) ? `${driver.experienceYears} yrs` : '-'}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleEdit(driver)} className="p-2 hover:bg-gray-100 rounded-lg">
                                                    <Edit2 className="h-4 w-4 text-gray-600" />
                                                </button>
                                                <button onClick={() => handleDelete(driver.driverId)} className="p-2 hover:bg-red-50 rounded-lg">
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

                {!loading && filteredDrivers.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        pageSize={pageSize}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            setCurrentPage(0);
                        }}
                        totalElements={filteredDrivers.length}
                    />
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editingDriver ? 'Edit Driver' : 'Add New Driver'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                    disabled={!!editingDriver}
                                />
                                <p className="text-xs text-gray-500 mt-1">An OTP will be sent for password setup.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                                <input
                                    type="text"
                                    value={formData.licenseNumber}
                                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.experienceYears}
                                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
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
                                    {editingDriver ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Drivers;
