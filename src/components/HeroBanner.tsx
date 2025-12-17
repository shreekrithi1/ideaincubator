'use client';

import Image from 'next/image';
import styles from './HeroBanner.module.css';

export default function HeroBanner() {
    return (
        <div className={styles.bannerContainer}>
            <Image
                src="/hero-banner.jpg"
                alt="Global Idea Incubator: Where History's Giants Inspire Tomorrow's Pioneers"
                width={1920}
                height={600}
                className={styles.bannerImage}
                priority
                quality={95}
            />
        </div>
    );
}
