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