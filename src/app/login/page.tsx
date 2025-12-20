'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Shield, Briefcase, Zap, Lightbulb, ArrowRight } from 'lucide-react';
import styles from './page.module.css';
import { loginUser } from '@/app/auth-actions';
import Starfield from '@/components/Starfield';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleTestLogin = async (userId: string) => {
        setLoading(true);
        await loginUser(userId);
        window.location.href = '/';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // For now, redirect to test login - in production, validate credentials
        setLoading(true);
        // Simulate login - you can add real authentication here
        await loginUser('user-emp-001');
        window.location.href = '/';
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.leftPanel}>
                <div className={styles.brandingSection}>
                    <div className={styles.heroContent}>
                        <div className={styles.iconWrapper}>
                            <Lightbulb size={48} className={styles.heroIcon} />
                        </div>
                        <h1 className={styles.heroTitle}>Idea Incubator</h1>
                        <span className={styles.demoBadge}>DEMO</span>
                        <p className={styles.heroSubtitle}>
                            Transform innovative concepts into reality. Where history's giants inspire tomorrow's pioneers.
                        </p>
                    </div>

                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>✨</div>
                            <div>
                                <div className={styles.featureTitle}>Submit Ideas</div>
                                <div className={styles.featureDesc}>Share your innovative concepts</div>
                            </div>
                        </div>
                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>🚀</div>
                            <div>
                                <div className={styles.featureTitle}>Collaborate</div>
                                <div className={styles.featureDesc}>Work with peers and experts</div>
                            </div>
                        </div>
                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>🎯</div>
                            <div>
                                <div className={styles.featureTitle}>Track Progress</div>
                                <div className={styles.featureDesc}>Watch ideas come to life</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.rightPanel}>
                <Starfield />
                <div className={styles.authCard}>
                    <div className={styles.authHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Shield className="text-red-500" size={24} color="#ef4444" />
                            <h2 className={styles.authTitle} style={{ marginBottom: 0 }}>Member Only Access</h2>
                        </div>
                        <p className={styles.authSubtitle}>
                            <span style={{ color: '#ef4444', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>HARD STOP.</span>
                            Authorized for Pragna & Athena.
                        </p>
                    </div>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Email or Username</label>
                            <input
                                type="text"
                                placeholder="Enter your email"
                                className={styles.input}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className={styles.input}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                            <ArrowRight size={18} />
                        </button>
                    </form>

                    <div className={styles.divider}>
                        <span>Or use a test account</span>
                    </div>

                    <div className={styles.testRoles}>
                        <button
                            className={`${styles.roleBtn} ${styles.roleEmployee}`}
                            onClick={() => handleTestLogin('user-emp-001')}
                            disabled={loading}
                        >
                            <User size={20} />
                            <div className={styles.roleInfo}>
                                <span className={styles.roleName}>Employee</span>
                                <span className={styles.roleDesc}>Submit & vote on ideas</span>
                            </div>
                        </button>
                        <button
                            className={`${styles.roleBtn} ${styles.roleModerator}`}
                            onClick={() => handleTestLogin('user-mod-001')}
                            disabled={loading}
                        >
                            <Shield size={20} />
                            <div className={styles.roleInfo}>
                                <span className={styles.roleName}>Moderator</span>
                                <span className={styles.roleDesc}>Review submissions</span>
                            </div>
                        </button>
                        <button
                            className={`${styles.roleBtn} ${styles.roleExecutive}`}
                            onClick={() => handleTestLogin('user-exec-001')}
                            disabled={loading}
                        >
                            <Briefcase size={20} />
                            <div className={styles.roleInfo}>
                                <span className={styles.roleName}>Executive</span>
                                <span className={styles.roleDesc}>Approve initiatives</span>
                            </div>
                        </button>
                        <button
                            className={`${styles.roleBtn} ${styles.roleAdmin}`}
                            onClick={() => handleTestLogin('user-admin-001')}
                            disabled={loading}
                        >
                            <Zap size={20} />
                            <div className={styles.roleInfo}>
                                <span className={styles.roleName}>Admin</span>
                                <span className={styles.roleDesc}>Full system access</span>
                            </div>
                        </button>
                    </div>

                    <div className={styles.footer}>
                        <p>Don't have an account? <Link href="/register" className={styles.link}>Register here</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
