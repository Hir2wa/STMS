import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        const error = searchParams.get('error');

        if (error) {
            toast.error('OAuth authentication failed: ' + error);
            navigate('/login');
            return;
        }

        if (token && email) {
            // Normalize token
            const cleanToken = token.replace(/^"|"$/g, '').trim();
            
            // Set token in localStorage and axios
            localStorage.setItem('token', cleanToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
            
            // Fetch user details
            axios.get(`http://localhost:8081/api/users/email/${email}`)
                .then(response => {
                    const userData = response.data;
                    localStorage.setItem('user', JSON.stringify(userData));
                    
                    toast.success('Login successful!');
                    
                    // Redirect based on role
                    if (userData.role === 'ADMIN') {
                        navigate('/admin');
                    } else if (userData.role === 'DRIVER') {
                        navigate('/driver');
                    } else if (userData.role === 'STUDENT' || userData.role === 'PARENT') {
                        navigate('/student');
                    } else {
                        navigate('/');
                    }
                    // Reload to update AuthContext
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error fetching user:', error);
                    toast.error('Failed to fetch user details');
                    navigate('/login');
                });
        } else {
            toast.error('Invalid OAuth callback');
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto"></div>
                <p className="mt-4 text-gray-600">Completing login...</p>
            </div>
        </div>
    );
};

export default OAuthCallback;

