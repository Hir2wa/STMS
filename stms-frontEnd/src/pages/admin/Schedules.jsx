import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { scheduleService } from '../../services/scheduleService';
import { busService } from '../../services/busService';
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

const Schedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [buses, setBuses] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [formData, setFormData] = useState({
        departureTime: '',
        arrivalTime: '',
        dayOfWeek: 'MONDAY',
        busId: '',
        routeId: ''
    });

    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const businessDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const weekendDays = ['SATURDAY', 'SUNDAY'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [schedulesData, busesData, routesData] = await Promise.all([
                scheduleService.getAll(),
                busService.getAll(),
                routeService.getAll()
            ]);
            setSchedules(schedulesData || []);
            setBuses(busesData || []);
            setRoutes(routesData || []);
        } catch (error) {
            const status = error?.response?.status;
            if (status === 401) {
                toast.error('Authentication required. Please log in again.');
                // Optionally redirect to login
                // window.location.href = '/login';
            } else if (status === 500) {
                toast.error('Server error. Please try again later.');
                console.error('Server error:', error);
            } else {
                toast.error(getErrorMessage(error, 'Failed to fetch data'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Determine which days to create schedules for
            let daysToCreate = [];
            
            if (formData.dayOfWeek === 'BUSINESS_DAYS') {
                daysToCreate = businessDays;
            } else if (formData.dayOfWeek === 'WEEKEND_DAYS') {
                daysToCreate = weekendDays;
            } else {
                // Single day
                daysToCreate = [formData.dayOfWeek];
            }

            // Base schedule data
            const baseScheduleData = {
                departureTime: formData.departureTime,
                arrivalTime: formData.arrivalTime,
                // Backend Bus uses `id` (not busId)
                bus: formData.busId ? { id: parseInt(formData.busId) } : null,
                route: formData.routeId ? { routeId: parseInt(formData.routeId) } : null
            };

            if (editingSchedule) {
                // When editing, only update the single schedule
                const scheduleData = {
                    ...baseScheduleData,
                    dayOfWeek: formData.dayOfWeek
                };
                await scheduleService.update(editingSchedule.id, scheduleData);
                toast.success('Schedule updated successfully');
            } else {
                // When creating, create schedules for all selected days
                let successCount = 0;
                let errorCount = 0;
                
                for (const day of daysToCreate) {
                    try {
                        const scheduleData = {
                            ...baseScheduleData,
                            dayOfWeek: day
                        };
                        await scheduleService.create(scheduleData);
                        successCount++;
                    } catch (error) {
                        errorCount++;
                        console.error(`Failed to create schedule for ${day}:`, error);
                    }
                }

                if (errorCount === 0) {
                    toast.success(`Successfully created ${successCount} schedule(s)`);
                } else if (successCount > 0) {
                    toast.success(`Created ${successCount} schedule(s), ${errorCount} failed`);
                } else {
                    toast.error('Failed to create schedules');
                }
            }

            setShowModal(false);
            setEditingSchedule(null);
            setFormData({ departureTime: '', arrivalTime: '', dayOfWeek: 'MONDAY', busId: '', routeId: '' });
            fetchData();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Operation failed'));
        }
    };

    const handleEdit = (schedule) => {
        setEditingSchedule(schedule);
        setFormData({
            departureTime: typeof schedule.departureTime === 'string' ? schedule.departureTime.slice(0, 5) : '',
            arrivalTime: typeof schedule.arrivalTime === 'string' ? schedule.arrivalTime.slice(0, 5) : '',
            dayOfWeek: schedule.dayOfWeek || 'MONDAY',
            busId: schedule.bus?.id?.toString() || '',
            routeId: schedule.route?.routeId?.toString() || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;
        try {
            await scheduleService.delete(id);
            toast.success('Schedule deleted successfully');
            fetchData();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to delete schedule'));
        }
    };

    // Filter schedules based on search term
    const filteredSchedules = schedules.filter(schedule =>
        schedule.dayOfWeek?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.departureTime?.toString().includes(searchTerm) ||
        schedule.arrivalTime?.toString().includes(searchTerm) ||
        schedule.bus?.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.route?.routeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredSchedules.length / pageSize);
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedSchedules = filteredSchedules.slice(startIndex, endIndex);

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Schedules</h1>
                    <p className="text-gray-600 mt-1">Manage bus schedules</p>
                </div>
                <button
                    onClick={() => { setShowModal(true); setEditingSchedule(null); setFormData({ departureTime: '', arrivalTime: '', dayOfWeek: 'MONDAY', busId: '', routeId: '' }); }}
                    className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition"
                >
                    <Plus className="h-5 w-5" /> Add Schedule
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search schedules..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : filteredSchedules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No schedules found</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Day</th>
                                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Departure</th>
                                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Arrival</th>
                                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Bus</th>
                                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Route</th>
                                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedSchedules.map((schedule, index) => (
                                        <tr key={schedule.id ?? index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 flex items-center gap-3">
                                                <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                    <CalendarIcon className="h-5 w-5 text-indigo-700" />
                                                </div>
                                                {schedule.dayOfWeek}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    {schedule.departureTime || '-'}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    {schedule.arrivalTime || '-'}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">{schedule.bus?.plateNumber || '-'}</td>
                                            <td className="py-3 px-4">{schedule.route?.routeName || '-'}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(schedule)}
                                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="h-4 w-4 text-gray-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(schedule.id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {!loading && filteredSchedules.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                pageSize={pageSize}
                                onPageSizeChange={(newSize) => {
                                    setPageSize(newSize);
                                    setCurrentPage(0);
                                }}
                                totalElements={filteredSchedules.length}
                            />
                        )}
                    </>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                                <select
                                    value={formData.dayOfWeek}
                                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    disabled={editingSchedule !== null}
                                >
                                    {!editingSchedule && (
                                        <>
                                            <option value="BUSINESS_DAYS">Business Days (Mon-Fri)</option>
                                            <option value="WEEKEND_DAYS">Weekend Days (Sat-Sun)</option>
                                            <option disabled>──────────</option>
                                        </>
                                    )}
                                    {daysOfWeek.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                                {!editingSchedule && (formData.dayOfWeek === 'BUSINESS_DAYS' || formData.dayOfWeek === 'WEEKEND_DAYS') && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formData.dayOfWeek === 'BUSINESS_DAYS' 
                                            ? 'This will create schedules for Monday through Friday'
                                            : 'This will create schedules for Saturday and Sunday'}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                                <input
                                    type="time"
                                    value={formData.departureTime}
                                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
                                <input
                                    type="time"
                                    value={formData.arrivalTime}
                                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bus</label>
                                <select
                                    value={formData.busId}
                                    onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">Select a bus</option>
                                    {buses.map((bus, idx) => (
                                        <option
                                            key={bus?.busId ?? bus?.id ?? bus?.plateNumber ?? `bus-${idx}`}
                                            value={bus?.busId ?? bus?.id ?? ''}
                                        >
                                            {bus?.plateNumber ?? bus?.busNumber ?? `Bus ${idx + 1}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                                <select
                                    value={formData.routeId}
                                    onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">Select a route</option>
                                    {routes.map((route, idx) => (
                                        <option
                                            key={route?.routeId ?? route?.id ?? route?.routeName ?? `route-${idx}`}
                                            value={route?.routeId ?? route?.id ?? ''}
                                        >
                                            {route?.routeName ?? `Route ${idx + 1}`}
                                        </option>
                                    ))}
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
                                    {editingSchedule ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedules;
