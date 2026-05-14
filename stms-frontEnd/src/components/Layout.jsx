import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children, menuItems }) => {
    const { user, logout } = useAuth();

    return (
        <div className="flex min-h-screen bg-[#faf6f1] font-sans">
            <Sidebar menuItems={menuItems} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header user={user} onLogout={logout} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 relative">
                    {children}
                </main>
                <Footer
                    copyrightText="© 2025 STMS. All rights reserved."
                    links={[{ label: 'Privacy Policy', url: '#' }, { label: 'Terms of Service', url: '#' }]}
                />
            </div>
        </div>
    );
};

export default Layout;

