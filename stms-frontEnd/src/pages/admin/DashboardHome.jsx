import React, { useState, useEffect } from 'react';
import { Bell, Users, Bus, Map, TrendingUp, Activity } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { busService } from '../../services/busService';
import { driverService } from '../../services/driverService';
import { routeService } from '../../services/routeService';

const DashboardHome = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeBuses: 0,
        totalDrivers: 0,
        totalRoutes: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || !token.trim()) {
                    console.warn('No token found - user not authenticated');
                    setLoading(false);
                    return;
                }

                const [studentsData, busesData, driversData, routesData] = await Promise.all([
                    studentService.getAll().catch((err) => {
                        if (err.message?.includes('authentication') || err.message?.includes('Session expired')) {
                            return [];
                        }
                        console.error('Failed to fetch students:', err);
                        return [];
                    }),
                    busService.getAll().catch((err) => {
                        if (err.message?.includes('authentication') || err.message?.includes('Session expired')) {
                            return [];
                        }
                        console.error('Failed to fetch buses:', err);
                        return [];
                    }),
                    driverService.getAll().catch((err) => {
                        if (err.message?.includes('authentication') || err.message?.includes('Session expired')) {
                            return [];
                        }
                        console.error('Failed to fetch drivers:', err);
                        return [];
                    }),
                    routeService.getAll().catch((err) => {
                        if (err.message?.includes('authentication') || err.message?.includes('Session expired')) {
                            return [];
                        }
                        console.error('Failed to fetch routes:', err);
                        return [];
                    })
                ]);

                setStats({
                    totalStudents: Array.isArray(studentsData) ? studentsData.length : 0,
                    activeBuses: Array.isArray(busesData) ? busesData.length : 0,
                    totalDrivers: Array.isArray(driversData) ? driversData.length : 0,
                    totalRoutes: Array.isArray(routesData) ? routesData.length : 0,
                });
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-[#1a3a2f]' },
        { title: 'Active Buses', value: stats.activeBuses, icon: Bus, color: 'bg-[#d4a574]' },
        { title: 'Total Drivers', value: stats.totalDrivers, icon: Activity, color: 'bg-[#2d5a47]' },
        { title: 'Routes', value: stats.totalRoutes, icon: Map, color: 'bg-[#8b7355]' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#1a3a2f]">Dashboard</h1>
                <p className="text-[#5a7d6a] mt-1">Welcome to the Student Transportation Management System</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-[#d4a574]/20 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`h-12 w-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <TrendingUp className="h-5 w-5 text-[#2d5a47]" />
                            </div>
                            <h3 className="text-[#5a7d6a] text-sm font-medium uppercase tracking-wider">{stat.title}</h3>
                            <p className="text-3xl font-bold text-[#1a3a2f] mt-2">
                                {loading ? '...' : stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#d4a574]/20 p-6">
                <h3 className="text-lg font-bold text-[#1a3a2f] mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center p-3 hover:bg-[#faf6f1] rounded-lg transition">
                            <div className="h-10 w-10 rounded-full bg-[#d4a574]/20 flex items-center justify-center text-[#1a3a2f] mr-4">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#1a3a2f]">New Schedule Published</p>
                                <p className="text-xs text-[#5a7d6a]">2 hours ago</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
