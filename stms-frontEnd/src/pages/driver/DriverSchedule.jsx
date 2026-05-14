import React, { useState, useEffect } from 'react';
import { Clock, Calendar as CalendarIcon, MapPin, Bus as BusIcon } from 'lucide-react';
import { driverService } from '../../services/driverService';
import toast from 'react-hot-toast';

const DriverSchedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busInfo, setBusInfo] = useState(null);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const data = await driverService.getMySchedules();
            
            // Handle both old format (array) and new format (object with bus and schedules)
            if (Array.isArray(data)) {
                // Old format - just an array of schedules
                setSchedules(data || []);
                // Try to extract bus from first schedule
                if (data && data.length > 0 && data[0].bus) {
                    setBusInfo(data[0].bus);
                }
            } else if (data && typeof data === 'object') {
                // New format - object with bus and schedules
                setSchedules(data.schedules || []);
                setBusInfo(data.bus || null);
            } else {
                setSchedules([]);
                setBusInfo(null);
            }
        } catch (error) {
            const status = error?.response?.status;
            if (status === 401) {
                toast.error('Authentication required. Please log in again.');
            } else if (status === 500) {
                toast.error('Server error. Please try again later.');
            } else {
                toast.error('Failed to fetch schedules');
            }
            setSchedules([]);
            setBusInfo(null);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch {
            return timeString;
        }
    };

    // Sort schedules by day of week
    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const sortedSchedules = [...schedules].sort((a, b) => {
        const dayA = dayOrder.indexOf(a.dayOfWeek || '');
        const dayB = dayOrder.indexOf(b.dayOfWeek || '');
        if (dayA !== dayB) return dayA - dayB;
        // If same day, sort by departure time
        return (a.departureTime || '').localeCompare(b.departureTime || '');
    });

    if (loading) {
        return (
            <div className="text-center py-8 text-gray-500">Loading schedules...</div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
                <p className="text-gray-600 mt-1">Your weekly transportation schedule</p>
            </div>

            {busInfo && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <BusIcon className="h-8 w-8 text-emerald-700" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Assigned Bus</p>
                            <p className="text-2xl font-bold text-gray-900">{busInfo.plateNumber || 'N/A'}</p>
                            {busInfo.route && (
                                <p className="text-sm text-gray-600 mt-1">Route: {busInfo.route.routeName || 'N/A'}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {schedules.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <CalendarIcon className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">No schedule available</p>
                        <p className="text-sm text-gray-400">
                            {busInfo 
                                ? `Your bus (Plate: ${busInfo.plateNumber || 'N/A'}) doesn't have any schedules yet. Please contact your administrator.`
                                : 'You are not assigned to a bus yet. Please contact your administrator to get assigned to a bus.'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Day</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Departure</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Arrival</th>
                                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Route</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedSchedules.map((schedule, index) => (
                                    <tr key={schedule.id ?? index} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                    <CalendarIcon className="h-5 w-5 text-indigo-700" />
                                                </div>
                                                <span className="font-medium text-gray-900">{schedule.dayOfWeek || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700">{formatTime(schedule.departureTime)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700">{formatTime(schedule.arrivalTime)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {schedule.route ? (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-700">{schedule.route.routeName || 'N/A'}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverSchedule;
