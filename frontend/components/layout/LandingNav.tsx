'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Scissors, LogOut, LayoutGrid } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isAuthenticated, getUser, clearAuth } from '@/lib/auth';

interface LandingNavProps {
  /** Which page is currently active — used to highlight the correct nav link */
  activePage?: 'landing' | 'home' | 'consult' | 'services' | 'team' | 'contact' | 'history' | 'admin';
  /** Optional right-side slot for page-specific actions (profile dropdown, login, etc.) */
  rightSlot?: React.ReactNode;
}

export default function LandingNav({ activePage, rightSlot }: LandingNavProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('Staff');
  const [userName, setUserName] = useState('John Doe');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const auth = isAuthenticated();
    setIsLoggedIn(auth);
    if (auth) {
      const profile = getUser();
      if (profile) {
        setUserName(profile.name || 'John Doe');
        setUserRole(profile.role === 'admin' ? 'admin' : 'barber');
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handleSignOut() {
    clearAuth();
    setIsLoggedIn(false);
    router.replace('/');
  }

  const linkStyle = (page: string) => ({
    color: activePage === page ? '#fff' : 'rgba(255,255,255,0.7)',
    textDecoration: 'none' as const,
    borderBottom: activePage === page ? '1px solid #fff' : 'none',
    paddingBottom: activePage === page ? '2px' : '0',
    fontWeight: activePage === page ? 600 : 400,
  });

  // Default profile dropdown for logged-in users if rightSlot is not provided
  const defaultAuthRightSlot = isLoggedIn ? (
    <div className="nav-profile-menu" onClick={() => setMenuOpen(!menuOpen)}>
      <div className="nav-avatar-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#c59d5f', fontSize: '13px' }}>
        {userName.charAt(0).toUpperCase()}
      </div>
      <span className="nav-profile-name">
        {userName}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transition: 'transform 0.2s', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M1 1l4 4 4-4" />
        </svg>
      </span>

      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="nav-profile-dropdown"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{userName}</div>
              <div style={{ fontSize: '10px', color: '#c59d5f', textTransform: 'capitalize' }}>{userRole}</div>
            </div>
            <button onClick={handleSignOut} className="nav-profile-dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogOut size={13} /> Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  ) : null;

  return (
    <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="landing-nav-container">
        {/* Left: Brand logo + name */}
        <Link href="/" className="landing-nav-left">
          <div className="landing-nav-logo-icon">
            <Scissors size={16} />
          </div>
          <span className="landing-nav-brand-text">AI SALON</span>
        </Link>

        {/* Center: Navigation links — hidden on mobile, shown on desktop */}
        <div className="landing-nav-links">
          {isLoggedIn ? (
             <>
               <Link href="/" style={linkStyle('landing')}>Home</Link>
               <Link href="/consult" style={linkStyle('consult')}>Consult</Link>
               <Link href="/history" style={linkStyle('history')}>History</Link>
               <Link href="/team" style={linkStyle('team')}>Team</Link>
               {userRole === 'admin' && (
                 <Link href="/admin" style={linkStyle('admin')}>Admin</Link>
               )}
             </>
          ) : (
             <>
               <Link href="/" style={linkStyle('landing')}>Home</Link>
               <Link href="/services" style={linkStyle('services')}>Services</Link>
               <Link href="/team" style={linkStyle('team')}>Team</Link>
               <Link href="/contact" style={linkStyle('contact')}>Contact</Link>
             </>
          )}
        </div>

        {/* Right: Custom slot + burger button */}
        <div className="landing-nav-right">
          {rightSlot ? (
            <div className="landing-nav-right-slot">
              {rightSlot}
            </div>
          ) : (
            isLoggedIn ? (
               <div className="landing-nav-right-slot">
                  {defaultAuthRightSlot}
               </div>
            ) : (
               <Link href="/login" className="landing-nav-staff-link">
                 Staff Login
               </Link>
            )
          )}

          <button
            className="landing-burger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="landing-mobile-menu">
          {isLoggedIn ? (
            <>
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="landing-mobile-menu-link">Home</Link>
              <Link href="/consult" onClick={() => setMobileMenuOpen(false)} className="landing-mobile-menu-link">Consult</Link>
              <Link href="/history" onClick={() => setMobileMenuOpen(false)} className="landing-mobile-menu-link">History</Link>
              <Link href="/team" onClick={() => setMobileMenuOpen(false)} className="landing-mobile-menu-link">Team</Link>
              {userRole === 'admin' && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="landing-mobile-menu-link">Admin</Link>
              )}
            </>
          ) : (
            <>
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="landing-mobile-menu-link">Home</Link>
              <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="landing-mobile-menu-link">Services</Link>
              <Link href="/team" onClick={() => setMobileMenuOpen(false)} className="landing-mobile-menu-link">Team</Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="landing-mobile-menu-link">Contact</Link>
            </>
          )}
          {rightSlot || defaultAuthRightSlot ? (
            <div className="landing-mobile-menu-actions" onClick={() => setMobileMenuOpen(false)}>
              {rightSlot || defaultAuthRightSlot}
            </div>
          ) : null}
        </div>
      )}
    </nav>
  );
}
