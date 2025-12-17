'use client';

import React from 'react';
import { saveJiraConfig } from '@/app/jira-actions';
import {
    Users, Activity, Clock, TrendingUp,
    Calendar, MoreVertical, LayoutDashboard,
    Globe, Zap, Filter, Settings
} from 'lucide-react';
import { DashboardMetrics } from '@/lib/metrics';
import styles from './MetricsDashboard.module.css';

/* Simple SVG Line Chart Component */
const SparkLine = ({ data, color = "#3b82f6", height = 60 }: { data: number[], color?: string, height?: number }) => {
    const max = Math.max(...data, 1);
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (val / max) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: `${height}px`, overflow: 'visible' }}>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
                vectorEffect="non-scaling-stroke"
            />
            {/* Fill area */}
            <defs>
                <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <polygon
                fill={`url(#grad-${color})`}
                stroke="none"
                points={`0,100 ${points} 100,100`}
            />
        </svg>
    );
};

export default function MetricsDashboard({ metrics, jiraConfig }: { metrics: DashboardMetrics, jiraConfig?: any }) {
    const [activeUsers, setActiveUsers] = React.useState(42);
    const [realtimeBars, setRealtimeBars] = React.useState([20, 35, 40, 50, 45, 60, 30, 45, 55, 40]);
    const [currentView, setCurrentView] = React.useState('dashboard');

    // Simulate Live Data Updates
    React.useEffect(() => {
        const interval = setInterval(() => {
            // Fluctuate active users
            setActiveUsers(prev => {
                const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
                return Math.max(10, prev + change);
            });

            // Shift graph
            setRealtimeBars(prev => {
                const newBar = Math.floor(Math.random() * 60) + 20;
                return [...prev.slice(1), newBar];
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    if (!metrics) return null;

    // Simulate trend data from dailySubmissions or mock
    const trendData = metrics.dailySubmissions?.map(d => d.count) || [4, 6, 3, 8, 5, 9, 7];
    const engagementTrend = [12, 19, 15, 25, 22, 30, 28]; // Mock engagement

    const renderContent = () => {
        if (currentView === 'settings') {
            return (
                <div className={styles.fullPageCard}>
                    <h2>Integration Settings</h2>
                    <div className={styles.settingsGrid}>
                        <form action={saveJiraConfig} className={styles.configForm}>
                            <h3>Jira Cloud Integration</h3>
                            <div className={styles.formGroup}>
                                <label>Jira Instance URL</label>
                                <input name="url" type="url" placeholder="https://your-domain.atlassian.net" defaultValue={jiraConfig?.url} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Project Key</label>
                                <input name="projectKey" type="text" placeholder="PROJ" defaultValue={jiraConfig?.projectKey} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email Address</label>
                                <input name="email" type="email" placeholder="your-email@company.com" defaultValue={jiraConfig?.email} required />
                                <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                                    Your JIRA account email address
                                </small>
                            </div>
                            <div className={styles.formGroup}>
                                <label>API Token</label>
                                <input name="apiToken" type="password" placeholder="••••••••••••" defaultValue={jiraConfig?.apiToken} required />
                                <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                                    Generate from <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', textDecoration: 'underline' }}>Atlassian Account Settings</a>
                                </small>
                            </div>
                            <button type="submit" className={styles.saveBtn}>Save Configuration</button>
                        </form>
                    </div>
                </div>
            );
        }

        if (currentView === 'realtime') {
            return (
                <div className={styles.fullPageCard}>
                    <div className={styles.realtimeHeaderLarge}>
                        <div className={styles.livePulse}>
                            <div className={styles.pulseRing} />
                            <div className={styles.pulseDot} />
                        </div>
                        <h2>Realtime Overview</h2>
                    </div>
                    <div className={styles.realtimeBigStats}>
                        <div className={styles.statBox}>
                            <div className={styles.label}>Users Right Now</div>
                            <div className={styles.bigNumber}>{activeUsers}</div>
                            <div className={styles.subLabel}>Users per minute</div>
                        </div>
                        <div className={styles.deviceBreakdown}>
                            <h4>Device Breakdown</h4>
                            <div className={styles.barRow}><span style={{ width: '60px' }}>Desktop</span> <div className={styles.bar} style={{ width: '65%' }}></div> 65%</div>
                            <div className={styles.barRow}><span style={{ width: '60px' }}>Mobile</span> <div className={styles.bar} style={{ width: '32%' }}></div> 32%</div>
                            <div className={styles.barRow}><span style={{ width: '60px' }}>Tablet</span> <div className={styles.bar} style={{ width: '3%' }}></div> 3%</div>
                        </div>
                    </div>
                    <div className={styles.mapPlaceholder}>
                        <Globe size={48} className="text-gray-300" />
                        <span>Interactive User Map Loading...</span>
                    </div>
                </div>
            );
        }

        if (currentView === 'audiences') {
            return (
                <div className={styles.fullPageCard}>
                    <h2>Audience Segments</h2>
                    <div className={styles.audienceGrid}>
                        <div className={styles.audienceCard}>
                            <h3>Innovators</h3>
                            <div className={styles.audienceStat}>1,240 Users</div>
                            <div className={styles.audienceDesc}>Users with {'>'} 1 submission</div>
                        </div>
                        <div className={styles.audienceCard}>
                            <h3>Voters</h3>
                            <div className={styles.audienceStat}>8,402 Users</div>
                            <div className={styles.audienceDesc}>Active engagement in voting</div>
                        </div>
                        <div className={styles.audienceCard}>
                            <h3>Execs</h3>
                            <div className={styles.audienceStat}>15 Users</div>
                            <div className={styles.audienceDesc}>Boardroom access level</div>
                        </div>
                    </div>
                </div>
            );
        }

        if (currentView === 'conversions') {
            const totalVisitors = metrics.totalIdeas * 10;
            const submissions = metrics.totalIdeas;
            const modApproved = metrics.totalIdeas > 0 ? Math.floor(metrics.totalIdeas * 0.65) : 0;
            const execApproved = Math.floor(modApproved * 0.6);
            const inDev = Math.floor(execApproved * 0.7);

            return (
                <div className={styles.fullPageCard}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '0.5rem' }}>Conversion Funnel Analysis</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            Track how ideas progress through each stage of the innovation pipeline
                        </p>
                    </div>

                    <div className={styles.funnelContainer}>
                        <div className={styles.funnelStep}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div className={styles.funnelLabel}>
                                        <Users size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Total Visitors
                                    </div>
                                    <div className={styles.funnelValue}>{totalVisitors.toLocaleString()}</div>
                                    <div className={styles.funnelBar} style={{ width: '100%', background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)' }} />
                                </div>
                                <div style={{
                                    background: 'rgba(79, 70, 229, 0.1)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#a5b4fc'
                                }}>
                                    100%
                                </div>
                            </div>
                        </div>

                        <div className={styles.funnelStep}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div className={styles.funnelLabel}>
                                        <TrendingUp size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Idea Submissions
                                    </div>
                                    <div className={styles.funnelValue}>{submissions.toLocaleString()}</div>
                                    <div className={styles.funnelBar} style={{ width: '75%', background: 'linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)' }} />
                                    <div className={styles.conversionRate}>
                                        {((submissions / totalVisitors) * 100).toFixed(1)}% submitted an idea
                                    </div>
                                </div>
                                <div style={{
                                    background: 'rgba(124, 58, 237, 0.1)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#c084fc'
                                }}>
                                    75%
                                </div>
                            </div>
                        </div>

                        <div className={styles.funnelStep}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div className={styles.funnelLabel}>
                                        <Filter size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Moderation Approved
                                    </div>
                                    <div className={styles.funnelValue}>{modApproved.toLocaleString()}</div>
                                    <div className={styles.funnelBar} style={{ width: '50%', background: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)' }} />
                                    <div className={styles.conversionRate}>
                                        {((modApproved / submissions) * 100).toFixed(1)}% passed moderation
                                    </div>
                                </div>
                                <div style={{
                                    background: 'rgba(168, 85, 247, 0.1)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#e9d5ff'
                                }}>
                                    {((modApproved / totalVisitors) * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>

                        <div className={styles.funnelStep}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div className={styles.funnelLabel}>
                                        <Zap size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Executive Approved
                                    </div>
                                    <div className={styles.funnelValue}>{execApproved.toLocaleString()}</div>
                                    <div className={styles.funnelBar} style={{ width: '30%', background: 'linear-gradient(90deg, #c084fc 0%, #e9d5ff 100%)' }} />
                                    <div className={styles.conversionRate}>
                                        {((execApproved / modApproved) * 100).toFixed(1)}% executive approval
                                    </div>
                                </div>
                                <div style={{
                                    background: 'rgba(192, 132, 252, 0.1)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#f3e8ff'
                                }}>
                                    {((execApproved / totalVisitors) * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>

                        <div className={styles.funnelStep}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div className={styles.funnelLabel}>
                                        <Activity size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        In Development
                                    </div>
                                    <div className={styles.funnelValue}>{inDev.toLocaleString()}</div>
                                    <div className={styles.funnelBar} style={{ width: '20%', background: 'linear-gradient(90deg, #e9d5ff 0%, #faf5ff 100%)' }} />
                                    <div className={styles.conversionRate}>
                                        {((inDev / execApproved) * 100).toFixed(1)}% moved to development
                                    </div>
                                </div>
                                <div style={{
                                    background: 'rgba(233, 213, 255, 0.1)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#faf5ff'
                                }}>
                                    {((inDev / totalVisitors) * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        background: 'rgba(79, 70, 229, 0.05)',
                        borderRadius: '12px',
                        border: '1px solid rgba(79, 70, 229, 0.1)'
                    }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-main)' }}>
                            Key Insights
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Overall Conversion</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4f46e5' }}>
                                    {((inDev / totalVisitors) * 100).toFixed(2)}%
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Drop-off Rate</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
                                    {(100 - ((inDev / totalVisitors) * 100)).toFixed(2)}%
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Success Rate</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                                    {((inDev / submissions) * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Default dashboard view

        // Default Dashboard View
        return (
            <div className={styles.dashboardGrid}>

                {/* REAL-TIME CARD (The 'Blue' Card in GA) */}
                <div className={styles.realtimeCard} onClick={() => setCurrentView('realtime')} style={{ cursor: 'pointer' }}>
                    <div className={styles.realtimeHeader}>
                        <h3>Users in last 30 minutes</h3>
                        <div className={styles.livePulse}>
                            <div className={styles.pulseRing} />
                            <div className={styles.pulseDot} />
                        </div>
                    </div>
                    <div className={styles.bigNumber}>{activeUsers}</div>
                    <div className={styles.realtimeGraph}>
                        {/* Bar chart simulation */}
                        {realtimeBars.map((h, i) => (
                            <div key={i} className={styles.rtBar} style={{ height: `${h}%` }} />
                        ))}
                    </div>
                    <div className={styles.topActiveTitle}>TOP ACTIVE PAGES</div>
                    <div className={styles.pageRow}>
                        <span>/dashboard/submit</span>
                        <span className={styles.pageCount}>12</span>
                    </div>
                    <div className={styles.pageRow}>
                        <span>/moderator/queue</span>
                        <span className={styles.pageCount}>8</span>
                    </div>
                    <div className={styles.realtimeFooter}>
                        <span>View Realtime</span>
                        <div className={styles.arrowRight} />
                    </div>
                </div>

                {/* KEY METRICS CARDS */}
                <div className={styles.mainMetrics}>
                    <div className={styles.metricCard}>
                        <div className={styles.metricHead}>
                            <span>Active Users</span>
                            <div className={styles.trendUp}>+5.2%</div>
                        </div>
                        <div className={styles.metricValue}>{metrics.activeUsers7Days}</div>
                        <SparkLine data={trendData} color="#1a73e8" />
                    </div>

                    <div className={styles.metricCard}>
                        <div className={styles.metricHead}>
                            <span>Engagement</span>
                            <div className={styles.trendUp}>+12%</div>
                        </div>
                        <div className={styles.metricValue}>{metrics.totalVotes} <span className={styles.unit}>events</span></div>
                        <SparkLine data={engagementTrend} color="#e37400" />
                    </div>

                    <div className={styles.metricCard}>
                        <div className={styles.metricHead}>
                            <span>Conversion</span>
                            <div className={styles.trendDown}>-1.4%</div>
                        </div>
                        <div className={styles.metricValue}>{metrics.approvalRate}% <span className={styles.unit}>rate</span></div>
                        <SparkLine data={[80, 75, 78, 72, 74, 76, metrics.approvalRate]} color="#188038" />
                    </div>
                </div>

                {/* BIG CHARTS SECTION */}
                <div className={styles.chartSection}>
                    {/* User Retention / Funnel */}
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <h3>Innovation Funnel Retention</h3>
                            <MoreVertical size={16} color="#5f6368" />
                        </div>
                        <div className={styles.funnelChart}>
                            {[
                                { label: 'Submitted', val: metrics.funnel?.submitted || 0, color: '#1a73e8' },
                                { label: 'Moderated', val: metrics.funnel?.moderated || 0, color: '#4285f4' },
                                { label: 'Approved', val: metrics.funnel?.approved || 0, color: '#8ab4f8' },
                                { label: 'Launched', val: metrics.funnel?.launched || 0, color: '#aecbfa' }
                            ].map((step, i) => (
                                <div key={i} className={styles.fRow}>
                                    <div className={styles.fLabel}>{step.label}</div>
                                    <div className={styles.fBarTrack}>
                                        <div
                                            className={styles.fBar}
                                            style={{ width: metrics.funnel?.submitted ? `${(step.val / metrics.funnel.submitted) * 100}%` : '0%', background: step.color }}
                                        />
                                    </div>
                                    <div className={styles.fVal}>{step.val}</div>
                                    <div className={styles.fPerc}>{metrics.funnel?.submitted ? Math.round((step.val / metrics.funnel.submitted) * 100) : 0}%</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Performers */}
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <h3>Top Innovators by Engagement</h3>
                            <div className={styles.filterBtn}>
                                <Filter size={14} /> Users
                            </div>
                        </div>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Ideas</th>
                                    <th>% Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.topContributors.slice(0, 5).map((u, i) => (
                                    <tr key={i}>
                                        <td className={styles.userCell}>
                                            <div className={styles.avatarLetter} style={{ background: ['#aa00ff', '#1a73e8', '#e37400'][i % 3] }}>{u.initial}</div>
                                            {u.name}
                                        </td>
                                        <td>{u.count}</td>
                                        <td>
                                            <div className={styles.miniBar}>
                                                <div style={{ width: `${(u.count / metrics.totalIdeas) * 100}%` }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.firebaseShell}>
            {/* Left Navigation (Simulated) */}
            <aside className={styles.sidebar}>
                <div className={currentView === 'dashboard' ? styles.navItemActive : styles.navItem} onClick={() => setCurrentView('dashboard')}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </div>
                <div className={currentView === 'realtime' ? styles.navItemActive : styles.navItem} onClick={() => setCurrentView('realtime')}>
                    <Zap size={20} />
                    <span>Realtime</span>
                </div>
                <div className={currentView === 'audiences' ? styles.navItemActive : styles.navItem} onClick={() => setCurrentView('audiences')}>
                    <Users size={20} />
                    <span>Audiences</span>
                </div>
                <div className={currentView === 'attribution' ? styles.navItemActive : styles.navItem} onClick={() => setCurrentView('attribution')}>
                    <Globe size={20} />
                    <span>Attribution</span>
                </div>
                <div className={styles.divider} />
                <div className={styles.navSection}>Events</div>
                <div className={currentView === 'conversions' ? styles.navItemActive : styles.navItem} onClick={() => setCurrentView('conversions')}>
                    <Activity size={18} />
                    <span>Conversions</span>
                </div>
                <div className={styles.divider} />
                <div className={styles.navSection}>Admin</div>
                <div className={currentView === 'settings' ? styles.navItemActive : styles.navItem} onClick={() => setCurrentView('settings')}>
                    <Settings size={18} />
                    <span>Integrations</span>
                </div>
            </aside>

            {/* Main Content */}
            <div className={styles.content}>
                {/* Header */}
                <header className={styles.topBar}>
                    <div>
                        <h2 className={styles.viewTitle}>Innovation Overview</h2>
                        <div className={styles.breadcrumb}>Project "Empower-Innovate" • Production</div>
                    </div>
                    <div className={styles.datePicker}>
                        <Calendar size={16} />
                        <span>Last 7 days</span>
                        <div className={styles.arrowDown} />
                    </div>
                </header>

                {renderContent()}
            </div>
        </div>
    );
}
