import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import { LayoutDashboard, Calendar, Bell, Users, CalendarDays } from 'lucide-react';
import DriverAnnouncements from './DriverAnnouncements';
import DriverStudents from './DriverStudents';
import DriverSchedule from './DriverSchedule';
import { driverService } from '../../services/driverService';
import toast from 'react-hot-toast';

const DriverDashboardHome = () => {
    const [stats, setStats] = useState({ schedulesCount: 0, studentsCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await driverService.getMyStats();
            // Handle both object with counts and error messages
            if (data && typeof data === 'object') {
                setStats({
                    schedulesCount: data.schedulesCount || 0,
                    studentsCount: data.studentsCount || 0
                });
            } else {
                setStats({ schedulesCount: 0, studentsCount: 0 });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            const errorMsg = error?.response?.data?.error || error?.response?.data || error?.message || 'Failed to fetch stats';
            toast.error(errorMsg);
            setStats({ schedulesCount: 0, studentsCount: 0 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
                <p className="text-gray-600 mt-1">Overview of your assignments</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <CalendarDays className="h-8 w-8 text-emerald-700" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Schedules</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {loading ? '...' : stats.schedulesCount}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-[#d4a574] bg-opacity-20 rounded-lg flex items-center justify-center">
                            <Users className="h-8 w-8 text-[#d4a574]" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Assigned Students</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {loading ? '...' : stats.studentsCount}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DriverDashboard = () => {
    const menuItems = [
        { label: 'Dashboard', path: '/driver', icon: LayoutDashboard },
        { label: 'My Students', path: '/driver/students', icon: Users },
        { label: 'My Schedule', path: '/driver/schedule', icon: Calendar },
        { label: 'Announcements', path: '/driver/announcements', icon: Bell },
    ];

    return (
        <Layout menuItems={menuItems}>
            <Routes>
                <Route index element={<DriverDashboardHome />} />
                <Route path="students" element={<DriverStudents />} />
                <Route path="announcements" element={<DriverAnnouncements />} />
                <Route path="schedule" element={<DriverSchedule />} />
            </Routes>
        </Layout>
    );
};

export default DriverDashboard;
