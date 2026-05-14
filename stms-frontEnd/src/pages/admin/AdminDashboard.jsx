import React from 'react';
import Layout from '../../components/Layout';
import { LayoutDashboard, Bus, Users, Map, Calendar, Bell, UserPlus } from 'lucide-react';

const AdminDashboard = () => {
    const menuItems = [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Buses', path: '/admin/buses', icon: Bus },
        { label: 'Drivers', path: '/admin/drivers', icon: UserPlus },
        { label: 'Routes', path: '/admin/routes', icon: Map },
        { label: 'Students', path: '/admin/students', icon: Users },
        { label: 'Schedules', path: '/admin/schedules', icon: Calendar },
        { label: 'Announcements', path: '/admin/announcements', icon: Bell },
    ];

    return (
        <Layout menuItems={menuItems}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {['Total Students', 'Active Buses', 'Total Drivers', 'Routes'].map((title, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{Math.floor(Math.random() * 100) + 10}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">New Schedule Published</p>
                                <p className="text-xs text-gray-500">2 hours ago</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
