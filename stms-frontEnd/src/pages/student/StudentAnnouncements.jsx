import React, { useState, useEffect } from 'react';
import { Search, Megaphone, MessageSquare, Send } from 'lucide-react';
import { announcementService } from '../../services/announcementService';
import toast from 'react-hot-toast';

const StudentAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);
    const [replies, setReplies] = useState({});
    const [replyMessages, setReplyMessages] = useState({});
    const [loadingReplies, setLoadingReplies] = useState({});
    const [submittingReply, setSubmittingReply] = useState({});

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const data = await announcementService.getMyAnnouncements();
            setAnnouncements(data || []);
        } catch (error) {
            toast.error('Failed to fetch announcements');
        } finally {
            setLoading(false);
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

    const handleSubmitReply = async (announcementId) => {
        const message = replyMessages[announcementId]?.trim();
        if (!message) {
            toast.error('Please enter a message');
            return;
        }

        setSubmittingReply({ ...submittingReply, [announcementId]: true });
        try {
            await announcementService.createReply(announcementId, message);
            toast.success('Reply sent successfully');
            setReplyMessages({ ...replyMessages, [announcementId]: '' });
            // Refresh replies
            const data = await announcementService.getReplies(announcementId);
            setReplies({ ...replies, [announcementId]: data || [] });
        } catch (error) {
            const errorMsg = error?.response?.data || error?.message || 'Failed to send reply';
            toast.error(errorMsg);
        } finally {
            setSubmittingReply({ ...submittingReply, [announcementId]: false });
        }
    };

    const filteredAnnouncements = announcements.filter(announcement =>
        announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
                <p className="text-gray-600 mt-1">View and respond to announcements</p>
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
                                            </div>
                                            <p className="text-gray-600 text-sm mb-2">{announcement.message}</p>
                                            <p className="text-gray-400 text-xs">
                                                {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : 'Recently'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleToggleAnnouncement(announcement.id)}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            {expandedAnnouncement === announcement.id ? 'Hide Replies' : 'View Replies'}
                                        </button>
                                    </div>
                                </div>

                                {expandedAnnouncement === announcement.id && (
                                    <div className="border-t border-gray-100 bg-gray-50 p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Replies</h4>
                                        
                                        {loadingReplies[announcement.id] ? (
                                            <div className="text-center py-4 text-gray-500">Loading replies...</div>
                                        ) : (
                                            <div className="space-y-3 mb-4">
                                                {replies[announcement.id]?.length > 0 ? (
                                                    replies[announcement.id].map((reply) => (
                                                        <div key={reply.id} className="bg-white p-3 rounded-lg border border-gray-200">
                                                            <div className="flex items-start gap-3">
                                                                <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-xs font-semibold text-emerald-700">
                                                                        {reply.user?.fullNames?.charAt(0) || 'U'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {reply.user?.fullNames || 'Unknown User'}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600 mt-1">{reply.message}</p>
                                                                    <p className="text-xs text-gray-400 mt-1">
                                                                        {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : ''}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-4 text-gray-500 text-sm">No replies yet</div>
                                                )}
                                            </div>
                                        )}

                                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                                            <textarea
                                                value={replyMessages[announcement.id] || ''}
                                                onChange={(e) => setReplyMessages({ ...replyMessages, [announcement.id]: e.target.value })}
                                                placeholder="Write your reply to admin..."
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                            />
                                            <button
                                                onClick={() => handleSubmitReply(announcement.id)}
                                                disabled={submittingReply[announcement.id]}
                                                className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                            >
                                                <Send className="h-4 w-4" />
                                                {submittingReply[announcement.id] ? 'Sending...' : 'Send Reply'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAnnouncements;


