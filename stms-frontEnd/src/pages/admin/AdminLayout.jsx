import React from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Bus, Users, Map, Calendar, Bell, UserPlus, MapPin } from 'lucide-react';
import Layout from '../../components/Layout';

const AdminLayout = () => {
    const menuItems = [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Buses', path: '/admin/buses', icon: Bus },
        { label: 'Drivers', path: '/admin/drivers', icon: UserPlus },
        { label: 'Routes', path: '/admin/routes', icon: Map },
        { label: 'Students', path: '/admin/students', icon: Users },
        { label: 'Schedules', path: '/admin/schedules', icon: Calendar },
        { label: 'Announcements', path: '/admin/announcements', icon: Bell },
        { label: 'Locations', path: '/admin/locations', icon: MapPin },
    ];

    return (
        <Layout menuItems={menuItems}>
            <Outlet />
        </Layout>
    );
};

export default AdminLayout;
