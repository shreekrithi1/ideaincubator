'use client';

import Link from 'next/link';
import { Layers, BarChart, Settings, Activity, LogOut, Lightbulb, Target } from 'lucide-react';
import UserSwitcher from './UserSwitcher';
import styles from './Navigation.module.css';
import ThemeToggle from './ThemeToggle';

export default function Navigation({ currentUser }: { currentUser?: any }) {
    const role = currentUser?.role || 'INNOVATOR';

    const handleLogout = async () => {
        // Clear cookie by making a request to logout endpoint
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login';
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <Lightbulb size={28} className={styles.logoIcon} />
                    <span className={styles.logoText}>Idea Incubator</span>
                    <span className={styles.demoBadge}>DEMO</span>
                </div>

                <nav className={styles.nav}>
                    <Link href="/" className={styles.link}>
                        <Layers size={18} />
                        <span>Ideas</span>
                    </Link>
                    <Link href="/goals" className={styles.link}>
                        <Target size={18} />
                        <span>Goals</span>
                    </Link>
                    {(role === 'MODERATOR' || role === 'ADMIN') && (
                        <Link href="/moderator" className={styles.link}>
                            <BarChart size={18} />
                            <span>Moderation</span>
                        </Link>
                    )}
                    {(role === 'EXECUTIVE' || role === 'ADMIN') && (
                        <Link href="/boardroom" className={styles.link}>
                            <Activity size={18} />
                            <span>Boardroom</span>
                        </Link>
                    )}
                    {role === 'ADMIN' && (
                        <Link href="/admin" className={styles.link}>
                            <Settings size={18} />
                            <span>Admin</span>
                        </Link>
                    )}
                </nav>

                <div className={styles.profile}>
                    <ThemeToggle />
                    <UserSwitcher />
                    <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
}
