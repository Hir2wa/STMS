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