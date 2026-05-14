import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Button from '../../components/Button';

const SetPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const requestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/auth/password/otp/request', {
                email,
                purpose: 'PASSWORD_SETUP'
            });
            toast.success('OTP sent. Check your email (and server logs in dev).');
            setStep(2);
        } catch (err) {
            const data = err?.response?.data;
            toast.error(typeof data === 'string' ? data : data?.message || data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const confirmOtp = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await axios.post('/auth/password/otp/confirm', {
                email,
                otp,
                newPassword,
                purpose: 'PASSWORD_SETUP'
            });
            toast.success('Password set. You can now login.');
            setStep(3);
        } catch (err) {
            const data = err?.response?.data;
            toast.error(typeof data === 'string' ? data : data?.message || data?.error || 'Failed to set password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-emerald-900/10">
                <h1 className="text-2xl font-bold text-emerald-950 font-serif">Set password</h1>
                <p className="text-emerald-800/60 mt-2 text-sm">
                    If you were newly registered, request your setup OTP here (valid 5 minutes).
                </p>

                {step === 1 && (
                    <form onSubmit={requestOtp} className="mt-6 space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-emerald-900 block">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-2 block w-full px-4 py-3 border border-emerald-200/60 rounded-xl focus:ring-2 focus:ring-emerald-800/10 focus:border-emerald-800"
                                required
                            />
                        </div>
                        <Button
                            text={loading ? 'Sending OTP...' : 'Send setup OTP'}
                            type="submit"
                            variant="brand"
                            className="w-full !py-3 !rounded-xl"
                        />
                        <div className="text-sm text-emerald-800/70">
                            <Link to="/login" className="text-emerald-800 hover:underline">Back to login</Link>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={confirmOtp} className="mt-6 space-y-4">
                        <div className="text-sm text-gray-600">
                            OTP was sent to <span className="font-medium">{email}</span>.
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-emerald-900 block">OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="mt-2 block w-full px-4 py-3 border border-emerald-200/60 rounded-xl focus:ring-2 focus:ring-emerald-800/10 focus:border-emerald-800"
                                placeholder="6-digit code"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-emerald-900 block">New password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-2 block w-full px-4 py-3 border border-emerald-200/60 rounded-xl focus:ring-2 focus:ring-emerald-800/10 focus:border-emerald-800"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-emerald-900 block">Confirm password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-2 block w-full px-4 py-3 border border-emerald-200/60 rounded-xl focus:ring-2 focus:ring-emerald-800/10 focus:border-emerald-800"
                                required
                            />
                        </div>
                        <Button
                            text={loading ? 'Updating...' : 'Set password'}
                            type="submit"
                            variant="brand"
                            className="w-full !py-3 !rounded-xl"
                        />
                        <button
                            type="button"
                            className="text-sm text-emerald-800 hover:underline"
                            onClick={() => setStep(1)}
                        >
                            Resend OTP
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <div className="mt-6 space-y-4">
                        <div className="text-sm text-gray-700">Password set successfully.</div>
                        <Link to="/login">
                            <Button text="Go to login" type="button" variant="brand" className="w-full !py-3 !rounded-xl" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SetPassword;

