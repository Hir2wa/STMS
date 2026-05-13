import React, { useState, useEffect } from 'react';
import { Plus, Search, Bell, Megaphone, MessageSquare, Users } from 'lucide-react';
import { announcementService } from '../../services/announcementService';
import { studentService } from '../../services/studentService';
import { driverService } from '../../services/driverService';
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

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);
    const [replies, setReplies] = useState({});
    const [loadingReplies, setLoadingReplies] = useState({});
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        priority: 'NORMAL',
        targetType: 'ROLE', // ROLE or SPECIFIC
        targetAudience: 'ALL', // ALL, DRIVER, STUDENT
        recipientEmail: '' // Specific user email
    });
    const [students, setStudents] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loadingRecipients, setLoadingRecipients] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
        fetchRecipients();
        
        // Check if we came from global search
        const globalSearchQuery = sessionStorage.getItem('globalSearchQuery');
        const globalSearchType = sessionStorage.getItem('globalSearchType');
        if (globalSearchQuery && globalSearchType === 'announcements') {
            setSearchTerm(globalSearchQuery);
            // Clear the session storage
            sessionStorage.removeItem('globalSearchQuery');
            sessionStorage.removeItem('globalSearchType');
        }
    }, []);

    const fetchRecipients = async () => {
        setLoadingRecipients(true);
        try {
            const [studentsData, driversData] = await Promise.all([
                studentService.getAll().catch(() => []),
                driverService.getAll().catch(() => [])
            ]);
            setStudents(studentsData || []);
            setDrivers(driversData || []);
        } catch (error) {
            console.error('Error fetching recipients:', error);
        } finally {
            setLoadingRecipients(false);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const data = await announcementService.getAll();
            setAnnouncements(data || []);
        } catch (error) {
            toast.error('Failed to fetch announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const announcementData = {
                title: formData.title,
                message: formData.message,
                priority: formData.priority,
                targetAudience: formData.targetType === 'SPECIFIC' ? 'SPECIFIC' : formData.targetAudience,
                recipientEmail: formData.targetType === 'SPECIFIC' ? formData.recipientEmail : null
            };
            await announcementService.create(announcementData);
            toast.success('Announcement created successfully');
            setShowModal(false);
            setFormData({ 
                title: '', 
                message: '', 
                priority: 'NORMAL',
                targetType: 'ROLE',
                targetAudience: 'ALL',
                recipientEmail: ''
            });
            fetchAnnouncements();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Operation failed'));
        }
    };

    const fetchReplies = async (announcementId) => {
        if (replies[announcementId]) {
            return; // Already loaded
        }

        setLoadingReplies({ ...loadingReplies, [announcementId]: true });
        try {
            const data = await announcementService.getReplies(announcementId);
            setReplies({ ...replies, [announcementId]: data || [] });
        } catch (error) {
            toast.error('Failed to fetch replies');
        } finally {
            setLoadingReplies({ ...loadingReplies, [announcementId]: false });
        }
    };

    const handleToggleAnnouncement = (announcementId) => {
        if (expandedAnnouncement === announcementId) {
            setExpandedAnnouncement(null);
        } else {
            setExpandedAnnouncement(announcementId);
            fetchReplies(announcementId);
        }
    };

    const filteredAnnouncements = announcements.filter(announcement =>
        announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH': return 'bg-red-100 text-red-700';
            case 'URGENT': return 'bg-orange-100 text-orange-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
                    <p className="text-gray-600 mt-1">Manage system announcements</p>
                </div>
                <button
                    onClick={() => { 
                        setShowModal(true); 
                        setFormData({ 
                            title: '', 
                            message: '', 
                            priority: 'NORMAL',
                            targetType: 'ROLE',
                            targetAudience: 'ALL',
                            recipientEmail: ''
                        }); 
                    }}
                    className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition"
                >
                    <Plus className="h-5 w-5" /> New Announcement
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search announcements..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : filteredAnnouncements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No announcements found</div>
                ) : (
                    <div className="space-y-4">
                        {filteredAnnouncements.map((announcement, index) => (
                            <div key={announcement.id || index} className="border border-gray-100 rounded-lg overflow-hidden">
                                <div className="p-4 hover:bg-gray-50 transition">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Megaphone className="h-6 w-6 text-amber-700" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                                                    {announcement.priority || 'NORMAL'}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm">{announcement.message}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <p className="text-gray-400 text-xs">
                                                    {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : 'Recently'}
                                                </p>
                                                {announcement.recipientEmail ? (
                                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                                        To: {announcement.recipientEmail}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                        To: {announcement.targetAudience || 'ALL'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggleAnnouncement(announcement.id)}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            {expandedAnnouncement === announcement.id ? 'Hide Replies' : `View Replies (${replies[announcement.id]?.length || 0})`}
                                        </button>
                                    </div>
                                </div>

                                {expandedAnnouncement === announcement.id && (
                                    <div className="border-t border-gray-100 bg-gray-50 p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Replies from Students & Drivers</h4>
                                        
                                        {loadingReplies[announcement.id] ? (
                                            <div className="text-center py-4 text-gray-500">Loading replies...</div>
                                        ) : (
                                            <div className="space-y-3">