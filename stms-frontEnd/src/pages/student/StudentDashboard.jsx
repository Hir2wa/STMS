import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Map, Bell, Bus, MapPin, Calendar, Clock } from 'lucide-react';
import StudentAnnouncements from './StudentAnnouncements';
import { studentService } from '../../services/studentService';
import toast from 'react-hot-toast';

const StudentDashboardHome = () => {
    const [studentInfo, setStudentInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudentInfo();
    }, []);

    const fetchStudentInfo = async () => {
        try {
            const data = await studentService.getMyInfo();
            setStudentInfo(data);
        } catch (error) {
            toast.error('Failed to fetch your information');
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading...</div>;
    }

    if (!studentInfo || !studentInfo.student) {
        return <div className="text-center py-8 text-gray-500">No information available</div>;
    }

    const student = studentInfo.student;
    const bus = studentInfo.bus;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">View your bus and location information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bus Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Bus className="h-6 w-6 text-emerald-700" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Bus Information</h3>
                    </div>
                    {bus ? (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Plate Number</span>
                                <span className="font-semibold text-gray-900">{bus.plateNumber || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Capacity</span>
                                <span className="font-semibold text-gray-900">{bus.capacity || 'N/A'}</span>
                            </div>
                            {bus.driver && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Driver</span>
                                        <span className="font-semibold text-gray-900">{bus.driver.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Driver Contact</span>
                                        <span className="font-semibold text-emerald-700">{bus.driver.phoneNumber || 'N/A'}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No bus assigned yet</p>
                    )}
                </div>

                {/* Pickup/Dropoff Points */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 bg-[#d4a574] bg-opacity-20 rounded-lg flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-[#d4a574]" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Pickup & Dropoff</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Pickup Point</span>
                            <span className="font-semibold text-gray-900">{student.pickUpPoint || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Dropoff Point</span>
                            <span className="font-semibold text-gray-900">{student.dropOffPoint || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Class</span>
                            <span className="font-semibold text-gray-900">{student.className || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudentSchedule = () => {
    const [studentInfo, setStudentInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudentInfo();
    }, []);

    const fetchStudentInfo = async () => {
        try {
            const data = await studentService.getMyInfo();
            setStudentInfo(data);
        } catch (error) {
            toast.error('Failed to fetch your information');
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
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch {
            return timeString;
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading...</div>;
    }

    if (!studentInfo || !studentInfo.student) {
        return <div className="text-center py-8 text-gray-500">No information available</div>;
    }

    const bus = studentInfo.bus;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
                <p className="text-gray-600 mt-1">View your weekly bus schedule</p>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-6 w-6 text-emerald-700" />
                    <h3 className="text-lg font-bold text-gray-900">Weekly Schedule</h3>
                </div>
                {!bus ? (
                    <div className="text-center py-8">
                        <div className="flex flex-col items-center gap-3">
                            <Bus className="h-12 w-12 text-gray-300" />
                            <p className="text-gray-500 font-medium">No bus assigned yet</p>
                            <p className="text-sm text-gray-400">Please contact your administrator to get assigned to a bus</p>
                        </div>
                    </div>
                ) : !bus.schedules || bus.schedules.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="flex flex-col items-center gap-3">
                            <Calendar className="h-12 w-12 text-gray-300" />
                            <p className="text-gray-500 font-medium">No schedule available</p>
                            <p className="text-sm text-gray-400">Your bus (Plate: {bus.plateNumber || 'N/A'}) doesn't have any schedules yet. Please check back later or contact your administrator.</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Day</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Departure Time</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Arrival Time</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Route</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bus.schedules.map((schedule) => (
                                    <tr key={schedule.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{schedule.dayOfWeek || 'N/A'}</td>
                                        <td className="py-3 px-4 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-emerald-700" />
                                                {formatTime(schedule.departureTime)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-emerald-700" />
                                                {formatTime(schedule.arrivalTime)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {schedule.route?.routeName || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const StudentDashboard = () => {
    const menuItems = [
        { label: 'Dashboard', path: '/student', icon: Map },
        { label: 'Schedule', path: '/student/schedule', icon: Calendar },
        { label: 'Announcements', path: '/student/announcements', icon: Bell },
    ];

    return (
        <Layout menuItems={menuItems}>
            <Routes>
                <Route index element={<StudentDashboardHome />} />
                <Route path="schedule" element={<StudentSchedule />} />
                <Route path="announcements" element={<StudentAnnouncements />} />
            </Routes>
        </Layout>
    );
};

export default StudentDashboard;
