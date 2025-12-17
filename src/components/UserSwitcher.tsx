'use client';

import { useState, useEffect } from 'react';
import { User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { getCurrentUser, getAllUsers, loginUser } from '@/app/auth-actions';
import styles from './UserSwitcher.module.css';

export default function UserSwitcher() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        async function load() {
            const [u, all] = await Promise.all([getCurrentUser(), getAllUsers()]);
            setCurrentUser(u);
            setUsers(all);

            // Auto-login first user if none
            if (!u && all.length > 0) {
                await loginUser(all[0].id);
                setCurrentUser(all[0]);
            }
        }
        load();
    }, []);

    const handleSwitch = async (userId: string) => {
        await loginUser(userId);
        const u = users.find(x => x.id === userId);
        setCurrentUser(u);
        setIsOpen(false);
        window.location.reload(); // Hard reload to refresh all server data/permissions
    };

    if (!currentUser) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            <button className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
                <img src={currentUser.avatarUrl || ''} alt="" className={styles.avatar} />
                <div className={styles.info}>
                    <span className={styles.name}>{currentUser.name}</span>
                    <span className={styles.role}>{currentUser.role.toLowerCase()}</span>
                </div>
                <ChevronDown size={14} />
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.label}>Test Roles</div>
                    <div className={styles.rolesGrid}>
                        {[
                            { id: 'user-emp-001', label: 'Employee', icon: '👤' },
                            { id: 'user-mod-001', label: 'Moderator', icon: '🛡️' },
                            { id: 'user-exec-001', label: 'Executive', icon: '💼' },
                            { id: 'user-admin-001', label: 'Admin', icon: '⚡' },
                        ].map(role => {
                            const user = users.find(u => u.id === role.id);
                            if (!user) return null;
                            return (
                                <button
                                    key={role.id}
                                    className={`${styles.roleBtn} ${user.id === currentUser.id ? styles.active : ''}`}
                                    onClick={() => handleSwitch(user.id)}
                                >
                                    <span>{role.icon}</span>
                                    <span>{role.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className={styles.label}>All Users</div>
                    {users.map(u => (
                        <button
                            key={u.id}
                            className={`${styles.userItem} ${u.id === currentUser.id ? styles.active : ''}`}
                            onClick={() => handleSwitch(u.id)}
                        >
                            <img src={u.avatarUrl || ''} className={styles.miniAvatar} />
                            <div className="flex-1 text-left">
                                <div className={styles.itemName}>{u.name}</div>
                                <div className={styles.itemRole}>{u.role}</div>
                            </div>
                            {u.id === currentUser.id && <div className={styles.dot} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
