'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Users, Loader2 } from 'lucide-react';
import styles from './MagicWand.module.css';

interface MagicWandProps {
    description: string;
    onEnhance: (newDesc: string) => void;
}

export default function MagicWand({ description, onEnhance }: MagicWandProps) {
    const [isEnhancing, setIsEnhancing] = useState(false);

    const enhanceDescription = async () => {
        if (!description) return;
        setIsEnhancing(true);

        // Simulate AI Latency
        setTimeout(() => {
            const enhanced = `✨ Executive Summary:\n${description}\n\n🚀 Business Impact:\nThis initiative directly addresses core efficiency metrics by leveraging advanced automation, reducing manual overhead by ~30%.\n\n🎯 Key Deliverables:\n- Automated compliance checks\n- Real-time reporting dashboard\n- Seamless API integration`;
            onEnhance(enhanced);
            setIsEnhancing(false);
        }, 1500);
    };

    return (
        <button
            type="button"
            className={styles.magicBtn}
            onClick={enhanceDescription}
            disabled={isEnhancing || !description}
            title="Polish with AI"
        >
            {isEnhancing ? (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <Loader2 size={16} />
                </motion.div>
            ) : (
                <div className="flex items-center gap-2">
                    <Wand2 size={16} />
                    <span className={styles.text}>Pitch Perfect</span>
                </div>
            )}
        </button>
    );
}
