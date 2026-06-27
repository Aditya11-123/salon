'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, BellRing, X, Trash2, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import styles from './AdminNotification.module.css';

export default function AdminNotificationWrapper() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showCenter, setShowCenter] = useState(false);
  const [toastMessage, setToastMessage] = useState<any | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (!pathname?.startsWith('/admin')) return;

    // 1. Fetch initial notifications from Backend API
    api.notifications.list().then(loadedNotes => {
      setNotifications(loadedNotes);

      const hasUnread = loadedNotes.some(n => !n.isRead);
      
      if (hasUnread) {
        setShowPopup(true);
      }
    }).catch(console.error);

    // 2. Subscribe to Supabase Realtime for new notifications
    const salonUser = localStorage.getItem('salon_user');
    const salonId = salonUser ? JSON.parse(salonUser).salonId : null;

    const channel = supabase
      .channel('public:Notification')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Notification',
          filter: salonId ? `salonId=eq.${salonId}` : undefined,
        },
        (payload) => {
          const newNote = payload.new;
          setNotifications(prev => [newNote, ...prev]);
          
          if (!newNote.isRead) {
            setToastMessage(newNote);
            setTimeout(() => setToastMessage(null), 5000);
          }
        }
      )
      .subscribe();

    // Global mock function for easy testing
    (window as any).simulateNewNotification = () => {
      api.notifications.create({
        salonId: salonId || 'TEST_SALON_ID',
        type: 'APPOINTMENT',
        title: 'New Online Booking',
        message: 'A new client just booked a Balayage service.'
      }).catch(console.error);
    };

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pathname]);

  if (!isClient || !pathname?.startsWith('/admin')) {
    return null;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleDismissPopup = () => {
    setShowPopup(false);
    localStorage.setItem('admin_popup_shown', 'true');
  };

  const handleOpenCenter = () => {
    setShowCenter(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.notifications.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      await api.notifications.markAsRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Toast Notification for incoming messages */}
      {toastMessage && (
        <div className={styles.toastNotification} onClick={handleOpenCenter}>
          <div className={styles.toastIcon}>
            <BellRing size={16} />
          </div>
          <div className={styles.toastContent}>
            <p className={styles.toastTitle}>{toastMessage.title}</p>
            <p className={styles.toastText}>{toastMessage.message}</p>
          </div>
          <button className={styles.toastClose} onClick={(e) => { e.stopPropagation(); setToastMessage(null); }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Floating Widget */}
      <div className={styles.widgetContainer}>
        <button 
          className={`${styles.widgetButton} ${unreadCount > 0 ? styles.animateBounce : ''}`}
          onClick={handleOpenCenter}
          aria-label="Notifications"
        >
          {unreadCount > 0 ? <BellRing size={24} /> : <Bell size={24} />}
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
      </div>

      {/* Welcome Popup Modal */}
      {showPopup && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p style={{ color: 'var(--white)', fontSize: '18px', marginBottom: '24px' }}>
              You have {unreadCount} new notifications
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleDismissPopup}>
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Slide-over Notification Center */}
      {showCenter && (
        <>
          <div className={styles.slideOverOverlay} onClick={() => setShowCenter(false)} />
          <div className={styles.slideOverPanel}>
            <div className={styles.slideOverHeader}>
              <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)' }}>Notification Center</h2>
              <button className={styles.closeButton} onClick={() => setShowCenter(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.notificationList}>
              {notifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <Bell size={48} opacity={0.2} />
                  <p>No notifications right now.</p>
                </div>
              ) : (
                notifications.map(note => (
                  <div 
                    key={note.id} 
                    className={`${styles.notificationItem} ${!note.isRead ? styles.unread : ''}`}
                    onMouseEnter={() => !note.isRead && markAsRead(note.id)}
                  >
                    <div className={styles.notificationIcon}>
                      <Info size={20} />
                    </div>
                    <div className={styles.notificationContent}>
                      <h4 className={styles.notificationTitle}>{note.title}</h4>
                      <p className={styles.notificationMessage}>{note.message}</p>
                      <p className={styles.notificationTime}>
                        {note.createdAt ? new Date(note.createdAt).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                    <button 
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note.id);
                      }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
