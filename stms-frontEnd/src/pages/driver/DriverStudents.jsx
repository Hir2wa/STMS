import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { driverService } from '../../services/driverService';
import { studentService } from '../../services/studentService';
import toast from 'react-hot-toast';

const DriverStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState({});

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const data = await driverService.getMyStudents();
            // Handle both array and error responses
            if (Array.isArray(data)) {
                setStudents(data);
            } else {
                setStudents([]);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            const errorMsg = error?.response?.data || error?.message || 'Failed to fetch students';
            toast.error(typeof errorMsg === 'string' ? errorMsg : 'Failed to fetch students');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (studentId, newStatus) => {
        setUpdatingStatus({ ...updatingStatus, [studentId]: true });
        try {
            await studentService.updateStatus(studentId, newStatus);
            toast.success('Student status updated successfully');
            fetchStudents(); // Refresh the list
        } catch (error) {
            toast.error('Failed to update student status');
        } finally {
            setUpdatingStatus({ ...updatingStatus, [studentId]: false });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ONBUS':
                return 'bg-emerald-100 text-emerald-700';
            case 'DROPPEDOFF':
                return 'bg-[#d4a574] bg-opacity-20 text-[#d4a574]';
            case 'ABSENT':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ONBUS':
                return <CheckCircle className="h-4 w-4" />;
            case 'DROPPEDOFF':
                return <CheckCircle className="h-4 w-4" />;
            case 'ABSENT':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const filteredStudents = students.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.className?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
                <p className="text-gray-600 mt-1">Manage students assigned to your bus</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No students found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Class</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Pickup Point</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Dropoff Point</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-emerald-700" />
                                                </div>
                                                <span className="font-medium text-gray-900">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{student.email}</td>
                                        <td className="py-3 px-4 text-gray-600">{student.className}</td>
                                        <td className="py-3 px-4 text-gray-600">{student.pickUpPoint || 'N/A'}</td>
                                        <td className="py-3 px-4 text-gray-600">{student.dropOffPoint || 'N/A'}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                                                {getStatusIcon(student.status)}
                                                {student.status || 'ABSENT'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={student.status || 'ABSENT'}
                                                    onChange={(e) => handleStatusChange(student.id, e.target.value)}
                                                    disabled={updatingStatus[student.id]}
                                                    className="px-3 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <option value="ABSENT">Absent</option>
                                                    <option value="ONBUS">On Bus</option>
                                                    <option value="DROPPEDOFF">Dropped Off</option>
                                                </select>
                                            </div>
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

export default DriverStudents;


