'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, LayoutGrid, Loader2, Plus } from 'lucide-react';

import { getUser, isAuthenticated, clearAuth } from '@/lib/auth';
import LandingNav from '@/components/layout/LandingNav';

const INITIAL_TEAM = [
  { id: 1, name: 'Marcus', role: 'Master Barber', img: '/service1.png' },
  { id: 2, name: 'Julian', role: 'Color Specialist', img: '/service2.png' },
  { id: 3, name: 'David', role: 'Style Director', img: '/service3.png' }
];

export default function TeamPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userName, setUserName] = useState('John Doe');
  const [userRole, setUserRole] = useState('Staff');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const auth = isAuthenticated();
    setIsAuth(auth);
    setCheckingAuth(false);

    if (auth) {
      const profile = getUser();
      if (profile) {
        setUserName(profile.name || 'John Doe');
        setUserRole(profile.role === 'admin' ? 'Owner' : 'Barber');
      }
    }
  }, []);

  function handleSignOut() {
    clearAuth();
    setIsAuth(false);
    router.replace('/');
  }



  if (checkingAuth) {
    return (
      <div className="home-page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Loader2 size={32} className="spin" color="#c59d5f" />
      </div>
    );
  }

  return (
    <div className="home-page-shell">
      <div className="home-bg-overlay" />
      <div className="home-gradient-overlay" />

      {/* Shared Navbar */}
      <LandingNav activePage="team" />

      {/* Main Container */}
      <main className="home-main" style={{ zIndex: 10, paddingBottom: isAuth ? '90px' : '40px' }}>
        <section style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px', paddingTop: '100px' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: '#c59d5f', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '12px', fontWeight: 600 }}>Professionals</span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, marginTop: '8px', color: '#ffffff' }}>
              Our Team
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '540px', margin: '12px auto 0', fontSize: '14px', lineHeight: 1.6 }}>
              Meet the master barbers who combine timeless techniques with cutting-edge AI technology to perfect your style.
            </p>
          </div>

          {/* Admin Tools (Only if user is Owner/Admin) */}
          {isAuth && userRole === 'Owner' && (
             <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                <button className="home-btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '13px' }}>
                   <Plus size={16} /> Add Team Member
                </button>
             </div>
          )}

          {/* Team Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {INITIAL_TEAM.map((member, i) => (
              <motion.div 
                key={member.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                style={{ 
                   background: 'rgba(255,255,255,0.02)', 
                   border: '1px solid rgba(255,255,255,0.05)', 
                   borderRadius: '16px', 
                   overflow: 'hidden', 
                   textAlign: 'center',
                   backdropFilter: 'blur(10px)'
                }} 
              >
                <div style={{ height: '300px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                   <img src={member.img} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                   <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
                   
                   <div style={{ position: 'absolute', bottom: '24px', left: '0', right: '0' }}>
                     <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '4px', color: '#ffffff' }}>{member.name}</h3>
                     <p style={{ color: '#c59d5f', fontSize: '13px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{member.role}</p>
                   </div>
                </div>
                
                {isAuth && userRole === 'Owner' && (
                  <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                     <button style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                     <button style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

        </section>
      </main>


    </div>
  );
}
