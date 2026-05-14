import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, MapPin, Bus, Navigation, MessageSquare, 
  Users, ArrowRight, Activity, UserCheck
} from 'lucide-react';
import { studentService } from '../services/studentService';
import { busService } from '../services/busService';
import { driverService } from '../services/driverService';
import { routeService } from '../services/routeService';
import busHero from '../assets/bus-hero.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: null, buses: null, drivers: null, routes: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !token.trim()) { setLoading(false); return; }

        const [s, b, d, r] = await Promise.all([
          studentService.getAll().catch(() => []),
          busService.getAll().catch(() => []),
          driverService.getAll().catch(() => []),
          routeService.getAll().catch(() => []),
        ]);
        setStats({
          students: Array.isArray(s) ? s.length : 0,
          buses: Array.isArray(b) ? b.length : 0,
          drivers: Array.isArray(d) ? d.length : 0,
          routes: Array.isArray(r) ? r.length : 0,
        });
      } catch { /* silently fail */ }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const show = (v) => (v === null ? '–' : v);

  const objectives = [
    { icon: ShieldCheck, title: 'Safety First', desc: 'Track every pickup and drop-off so students are always accounted for.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Activity, title: 'Live Monitoring', desc: 'See bus locations, driver status, and attendance in real time.', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Bus, title: 'Easy Management', desc: 'Manage buses, drivers, routes, and schedules from one dashboard.', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: MessageSquare, title: 'Stay Connected', desc: 'Send announcements and updates to parents, drivers, and staff.', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: MapPin, title: 'Smart Locations', desc: 'Organized by Province, District, Sector, Cell, and Village.', color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf8]" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Simple Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-[#1a3a2f] rounded-lg flex items-center justify-center">
            <Bus className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-[#1a3a2f]">STMS</span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="px-5 py-2 bg-[#1a3a2f] text-white text-sm font-semibold rounded-full hover:bg-[#2d5a47] transition-colors"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section className="px-6 lg:px-12 pt-8 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="lg:w-1/2 text-center lg:text-left">
            <p className="text-sm font-semibold text-[#d4a574] uppercase tracking-wider mb-3">School Bus Tracking System</p>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1a3a2f] leading-tight mb-5">
              Keep every student safe on every ride
            </h1>
            <p className="text-lg text-[#5a7d6a] mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
              STMS helps schools track buses, manage drivers, and keep parents informed — all in one simple platform.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-7 py-3.5 bg-[#1a3a2f] text-white rounded-xl font-semibold hover:bg-[#2d5a47] transition-all hover:shadow-lg group"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="lg:w-1/2">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-white/80 bg-white p-3">
              <img src={busHero} alt="School bus tracking" className="rounded-xl w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#1a3a2f] py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 px-6 text-center text-white">
          {[
            { icon: Users, label: 'Students', value: stats.students },
            { icon: Bus, label: 'Buses', value: stats.buses },
            { icon: UserCheck, label: 'Drivers', value: stats.drivers },
            { icon: Navigation, label: 'Routes', value: stats.routes },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <s.icon className="h-6 w-6 text-[#d4a574] mb-2" />
              <p className="text-3xl font-bold">
                {loading ? <span className="inline-block w-8 h-6 bg-white/10 rounded animate-pulse" /> : show(s.value)}
              </p>
              <p className="text-xs text-emerald-200/60 uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        {stats.students === null && !loading && (
          <p className="text-center text-emerald-200/40 text-xs mt-4">Sign in to see live numbers</p>
        )}
      </section>

      {/* Objectives */}
      <section className="px-6 lg:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1a3a2f] text-center mb-3">What this app does</h2>
          <p className="text-[#5a7d6a] text-center mb-12 max-w-lg mx-auto">
            Everything you need to run safe, organized school transportation.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {objectives.map((obj, i) => {
              const Icon = obj.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
                  <div className={`h-11 w-11 ${obj.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`h-5 w-5 ${obj.color}`} />
                  </div>
                  <h3 className="font-bold text-[#1a3a2f] mb-2">{obj.title}</h3>
                  <p className="text-sm text-[#5a7d6a] leading-relaxed">{obj.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="px-6 lg:px-12 pb-20">
        <div className="max-w-3xl mx-auto bg-[#1a3a2f] rounded-2xl p-10 lg:p-14 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">Ready to try it?</h2>
          <p className="text-emerald-100/60 mb-8 max-w-md mx-auto">
            Sign in to access your dashboard and start managing your school's transportation.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 bg-[#d4a574] text-[#1a3a2f] rounded-xl font-bold hover:bg-[#eac49a] transition-all"
          >
            Go to Login
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[#5a7d6a] text-sm gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-[#1a3a2f] rounded-md flex items-center justify-center">
              <Bus className="text-white h-4 w-4" />
            </div>
            <span className="font-bold text-[#1a3a2f]">STMS</span>
          </div>
          <p>© 2026 School Bus Tracking Management System</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
