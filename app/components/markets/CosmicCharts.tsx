// app/components/markets/CosmicCharts.tsx

'use client';

import React, { useEffect, useRef, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    z: number;
    size: number;
    color: string;
    speed: number;
    phase: number;
    trail: { x: number; y: number; z: number }[];
}

interface WaveLine {
    points: { x: number; y: number; z: number; originalY: number }[];
    color: string;
    phase: number;
    speed: number;
}

interface CosmicChartsProps {
    className?: string;
}

export default function CosmicCharts({ className = '' }: CosmicChartsProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const wavesRef = useRef<WaveLine[]>([]);
    const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, radius: 150 });
    const animationRef = useRef<number>();
    const timeRef = useRef<number>(0);

    // Iridescent color palette
    const colors = [
        'rgba(147, 51, 234, 0.25)',   // Purple
        'rgba(59, 130, 246, 0.25)',   // Blue
        'rgba(236, 72, 153, 0.25)',   // Pink
        'rgba(16, 185, 129, 0.25)',   // Green
        'rgba(245, 158, 11, 0.25)',   // Orange
        'rgba(139, 92, 246, 0.25)',   // Violet
        'rgba(6, 182, 212, 0.25)',    // Cyan
        'rgba(244, 63, 94, 0.25)',    // Rose
    ];

    const initScene = useCallback((width: number, height: number) => {
        // Initialize floating particles
        const particles: Particle[] = [];
        const particleCount = 60;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: (Math.random() - 0.5) * width * 1.5,
                y: (Math.random() - 0.5) * height * 1.5,
                z: (Math.random() - 0.5) * 500,
                size: Math.random() * 3 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: 0.2 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2,
                trail: []
            });
        }
        particlesRef.current = particles;

        // Initialize wave lines
        const waves: WaveLine[] = [];
        const waveCount = 5;
        
        for (let i = 0; i < waveCount; i++) {
            const points: { x: number; y: number; z: number; originalY: number }[] = [];
            const pointCount = 40;
            const spacing = width / (pointCount - 1);
            const amplitude = height * 0.2;
            
            for (let j = 0; j < pointCount; j++) {
                const progress = j / (pointCount - 1);
                const x = (progress - 0.5) * width * 1.2;
                const y = Math.sin(progress * Math.PI * 4) * amplitude;
                const z = (i - (waveCount-1)/2) * 60;
                
                points.push({
                    x,
                    y,
                    z,
                    originalY: y
                });
            }
            
            waves.push({
                points,
                color: colors[i % colors.length],
                phase: Math.random() * Math.PI * 2,
                speed: 0.3 + Math.random() * 0.4
            });
        }
        wavesRef.current = waves;
    }, [colors]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        mouseRef.current.targetX = (x * 2 - 1) * 0.8;
        mouseRef.current.targetY = (y * 2 - 1) * 0.6;
    }, []);

    const project3D = (x: number, y: number, z: number, rotX: number, rotY: number) => {
        // Rotation matrices
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);

        // Rotate Y
        let x1 = x * cosY - z * sinY;
        let z1 = x * sinY + z * cosY;
        let y1 = y;

        // Rotate X
        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;

        // Perspective
        const distance = 1000;
        const scale = distance / (distance + z2);
        
        return {
            x: x1 * scale,
            y: y2 * scale,
            z: z2,
            scale
        };
    };

    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        timeRef.current += 0.005;

        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        // Smooth mouse movement
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.03;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.03;

        // Rotation based on mouse
        const rotX = 0.2 + mouseRef.current.y * 0.4;
        const rotY = 0.3 + mouseRef.current.x * 0.4;

        // Clear with trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(width / 2, height / 2);

        // Draw connection web between particles
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 0.5;

        for (let i = 0; i < particlesRef.current.length; i++) {
            for (let j = i + 1; j < particlesRef.current.length; j++) {
                const p1 = particlesRef.current[i];
                const p2 = particlesRef.current[j];
                
                const proj1 = project3D(p1.x, p1.y, p1.z, rotX, rotY);
                const proj2 = project3D(p2.x, p2.y, p2.z, rotX, rotY);
                
                const dx = proj1.x - proj2.x;
                const dy = proj1.y - proj2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(proj1.x, proj1.y);
                    ctx.lineTo(proj2.x, proj2.y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - dist/100)})`;
                    ctx.stroke();
                }
            }
        }

        // Update and draw wave lines
        wavesRef.current.forEach((wave) => {
            // Update wave points with complex motion
            wave.points.forEach((point, index) => {
                const progress = index / (wave.points.length - 1);
                const wave1 = Math.sin(timeRef.current * wave.speed * 2 + progress * 10 + wave.phase) * 15;
                const wave2 = Math.cos(timeRef.current * wave.speed + progress * 15 + wave.phase * 2) * 10;
                const wave3 = Math.sin(timeRef.current * 0.5 + progress * 5) * 8;
                
                point.y = point.originalY + wave1 + wave2 + wave3;
            });

            // Draw wave line
            ctx.beginPath();
            ctx.lineWidth = 1.5;
            
            // Create gradient along the wave
            const gradient = ctx.createLinearGradient(-width/2, 0, width/2, 0);
            gradient.addColorStop(0, wave.color);
            gradient.addColorStop(0.5, wave.color.replace('0.25', '0.4'));
            gradient.addColorStop(1, wave.color);
            
            ctx.strokeStyle = gradient;

            for (let i = 0; i < wave.points.length; i++) {
                const point = wave.points[i];
                const proj = project3D(point.x, point.y, point.z, rotX, rotY);
                
                if (i === 0) {
                    ctx.moveTo(proj.x, proj.y);
                } else {
                    ctx.lineTo(proj.x, proj.y);
                }
            }
            ctx.stroke();

            // Draw glowing points on waves
            wave.points.forEach((point, i) => {
                if (i % 3 === 0) {
                    const proj = project3D(point.x, point.y, point.z, rotX, rotY);
                    
                    ctx.beginPath();
                    ctx.arc(proj.x, proj.y, 2 * proj.scale, 0, Math.PI * 2);
                    
                    const gradient = ctx.createRadialGradient(
                        proj.x - 2, proj.y - 2, 0,
                        proj.x, proj.y, 8 * proj.scale
                    );
                    gradient.addColorStop(0, wave.color.replace('0.25', '0.8'));
                    gradient.addColorStop(0.5, wave.color);
                    gradient.addColorStop(1, 'rgba(0,0,0,0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.fill();
                }
            });
        });

        // Update and draw floating particles
        particlesRef.current.forEach((particle) => {
            // Complex particle motion
            particle.x += Math.sin(timeRef.current * particle.speed + particle.phase) * 0.3;
            particle.y += Math.cos(timeRef.current * particle.speed * 0.7 + particle.phase) * 0.3;
            particle.z += Math.sin(timeRef.current * 0.5 + particle.phase) * 0.2;

            // Keep particles in bounds
            if (Math.abs(particle.x) > width) particle.x *= -0.9;
            if (Math.abs(particle.y) > height) particle.y *= -0.9;
            if (Math.abs(particle.z) > 300) particle.z *= -0.9;

            const proj = project3D(particle.x, particle.y, particle.z, rotX, rotY);
            
            // Draw particle with glow
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, particle.size * proj.scale * 2, 0, Math.PI * 2);
            
            const gradient = ctx.createRadialGradient(
                proj.x - 2, proj.y - 2, 0,
                proj.x, proj.y, particle.size * proj.scale * 4
            );
            gradient.addColorStop(0, particle.color.replace('0.25', '0.6'));
            gradient.addColorStop(0.6, particle.color);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw particle trail
            particle.trail.push({ x: particle.x, y: particle.y, z: particle.z });
            if (particle.trail.length > 10) particle.trail.shift();

            for (let i = 0; i < particle.trail.length - 1; i++) {
                const t1 = particle.trail[i];
                const t2 = particle.trail[i + 1];
                
                const proj1 = project3D(t1.x, t1.y, t1.z, rotX, rotY);
                const proj2 = project3D(t2.x, t2.y, t2.z, rotX, rotY);
                
                ctx.beginPath();
                ctx.moveTo(proj1.x, proj1.y);
                ctx.lineTo(proj2.x, proj2.y);
                ctx.strokeStyle = particle.color.replace('0.25', `${0.1 * (i / particle.trail.length)}`);
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        });

        // Draw subtle grid in background
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 0.5;

        for (let i = -3; i <= 3; i++) {
            for (let j = -3; j <= 3; j++) {
                const x = i * 100;
                const z = j * 100;
                
                const proj1 = project3D(x - 50, 0, z, rotX, rotY);
                const proj2 = project3D(x + 50, 0, z, rotX, rotY);
                const proj3 = project3D(x, 0, z - 50, rotX, rotY);
                const proj4 = project3D(x, 0, z + 50, rotX, rotY);
                
                ctx.beginPath();
                ctx.moveTo(proj1.x, proj1.y);
                ctx.lineTo(proj2.x, proj2.y);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(proj3.x, proj3.y);
                ctx.lineTo(proj4.x, proj4.y);
                ctx.stroke();
            }
        }

        ctx.restore();

        animationRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const { width, height } = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
            }
            
            initScene(width, height);
        };

        resizeCanvas();

        let resizeTimeout: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 100);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(resizeTimeout);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [initScene, animate, handleMouseMove]);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none ${className}`}
            style={{ 
                width: '100%', 
                height: '100%',
                display: 'block',
                opacity: 0.6,
                zIndex: 0
            }}
        />
    );
}