'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
    x: number;
    y: number;
    z: number;
    color: string;
}

interface StarfieldProps {
    speed?: number;
    starCount?: number;
    minDepth?: number;
    maxDepth?: number;
}

export default function Starfield({
    speed = 4, // Warp speed!
    starCount = 1000,
    minDepth = 1,
    maxDepth = 1000,
}: StarfieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<Star[]>([]);
    const requestRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;

        // Vibrant colors for the stars
        const colors = [
            '#ffffff', // White
            '#ffe9c4', // Warm white
            '#d4fbff', // Cool white
            '#ff4081', // Pink
            '#00e676', // Green
            '#2979ff', // Blue
            '#ffab00', // Amber
            '#ea80fc', // Purple
            '#00bcd4', // Cyan
        ];

        const initStars = () => {
            starsRef.current = [];
            for (let i = 0; i < starCount; i++) {
                starsRef.current.push({
                    x: (Math.random() - 0.5) * width * 2, // Spread wider than screen
                    y: (Math.random() - 0.5) * height * 2,
                    z: Math.random() * (maxDepth - minDepth) + minDepth,
                    color: colors[Math.floor(Math.random() * colors.length)],
                });
            }
        };

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            initStars();
        };

        window.addEventListener('resize', resize);
        resize();

        const animate = () => {
            // Clear with a slight fade for a trail effect, or opaque for crisp stars
            // Let's go with a semi-transparent black for a subtle trail
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;

            starsRef.current.forEach((star) => {
                // Move star closer
                star.z -= speed;

                // Reset if it passes the viewer
                if (star.z <= 0) {
                    star.z = maxDepth;
                    star.x = (Math.random() - 0.5) * width * 2;
                    star.y = (Math.random() - 0.5) * height * 2;
                    star.color = colors[Math.floor(Math.random() * colors.length)];
                }

                // Project 3D position to 2D
                const k = 128.0 / star.z; // Field of view equivalent
                const px = star.x * k + cx;
                const py = star.y * k + cy;

                // Draw star
                if (px >= 0 && px <= width && py >= 0 && py <= height) {
                    const size = (1 - star.z / maxDepth) * 3.5; // Stars get bigger as they get closer
                    const opacity = (1 - star.z / maxDepth);

                    ctx.beginPath();
                    ctx.arc(px, py, Math.max(0.1, size), 0, Math.PI * 2);
                    ctx.fillStyle = star.color;
                    // Add a glow effect
                    ctx.shadowBlur = size * 2;
                    ctx.shadowColor = star.color;
                    ctx.globalAlpha = opacity;
                    ctx.fill();
                    ctx.globalAlpha = 1.0;
                    ctx.shadowBlur = 0;
                }
            });

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(requestRef.current);
        };
    }, [maxDepth, minDepth, speed, starCount]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none', // Allow clicks to pass through
            }}
        />
    );
}
