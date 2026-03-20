// app/components/markets/Subtle3DCharts.tsx

'use client';

import React, { useEffect, useRef, useCallback } from 'react';

interface LinePoint {
    x: number;
    y: number;
    z: number;
    originalY: number;
}

interface ChartLine {
    points: LinePoint[];
    color: string;
    offset: number;
    speed: number;
}

interface Subtle3DChartsProps {
    className?: string;
}

export default function Subtle3DCharts({ className = '' }: Subtle3DChartsProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const linesRef = useRef<ChartLine[]>([]);
    const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
    const animationRef = useRef<number>();
    const timeRef = useRef<number>(0);
    const rotationRef = useRef({ x: 0.1, y: 0.1 });

    // Very subtle colors with low opacity
    const colors = [
        'rgba(99, 102, 241, 0.15)',  // indigo
        'rgba(16, 185, 129, 0.15)',  // green
        'rgba(245, 158, 11, 0.15)',  // orange
        'rgba(139, 92, 246, 0.15)',  // purple
        'rgba(236, 72, 153, 0.15)',  // pink
        'rgba(6, 182, 212, 0.15)',   // cyan
    ];

    const initLines = useCallback((width: number, height: number) => {
        const lines: ChartLine[] = [];
        const lineCount = 4; // Reduced number of lines
        const spacing = width / (lineCount + 1);
        
        for (let i = 0; i < lineCount; i++) {
            const points: LinePoint[] = [];
            const baseX = spacing * (i + 1);
            const amplitude = height * 0.1;
            const pointsPerLine = 30;
            
            for (let j = 0; j < pointsPerLine; j++) {
                const progress = j / (pointsPerLine - 1);
                const x = baseX + (progress - 0.5) * width * 0.4;
                const y = height * 0.4 + Math.sin(progress * Math.PI * 3) * amplitude;
                const z = (progress - 0.5) * width * 0.2;
                
                points.push({
                    x,
                    y,
                    z,
                    originalY: y
                });
            }
            
            lines.push({
                points,
                color: colors[i % colors.length],
                offset: Math.random() * Math.PI * 2,
                speed: 0.3 + Math.random() * 0.5
            });
        }
        
        linesRef.current = lines;
    }, [colors]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        // Very subtle mouse influence
        mouseRef.current.targetX = (x * 2 - 1) * 0.3;
        mouseRef.current.targetY = (y * 2 - 1) * 0.2;
    }, []);

    const project3D = (x: number, y: number, z: number, rotationX: number, rotationY: number) => {
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);

        let x1 = x * cosY - z * sinY;
        let z1 = x * sinY + z * cosY;
        let y1 = y;

        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;

        const distance = 1000;
        const scale = distance / (distance + z2);
        
        return {
            x: x1 * scale,
            y: y2 * scale,
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
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.02;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.02;

        // Very subtle rotation based on mouse
        rotationRef.current.x = 0.1 + mouseRef.current.y * 0.2;
        rotationRef.current.y = 0.1 + mouseRef.current.x * 0.2;

        // Clear with very light fade (almost no trail)
        ctx.clearRect(0, 0, width, height);

        // Transform to center of canvas
        ctx.save();
        ctx.translate(width / 2, height / 2);

        // Update and draw lines
        linesRef.current.forEach((line) => {
            // Update points with very subtle wave motion
            line.points.forEach((point, pointIndex) => {
                const progress = pointIndex / 30;
                const wave = Math.sin(timeRef.current * line.speed + progress * 8 + line.offset) * 5;
                point.y = point.originalY + wave;
            });

            // Draw line
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = line.color;
            
            for (let i = 0; i < line.points.length; i++) {
                const point = line.points[i];
                
                const projected = project3D(
                    point.x - width/2,
                    point.y - height/2,
                    point.z,
                    rotationRef.current.x,
                    rotationRef.current.y
                );

                if (i === 0) {
                    ctx.moveTo(projected.x, projected.y);
                } else {
                    ctx.lineTo(projected.x, projected.y);
                }
            }
            
            ctx.stroke();

            // Draw very subtle points
            ctx.fillStyle = line.color;
            line.points.forEach((point, i) => {
                if (i % 8 === 0) {
                    const projected = project3D(
                        point.x - width/2,
                        point.y - height/2,
                        point.z,
                        rotationRef.current.x,
                        rotationRef.current.y
                    );
                    
                    ctx.beginPath();
                    ctx.arc(projected.x, projected.y, 1.5 * projected.scale, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        });

        // Draw very subtle connecting lines
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < linesRef.current.length - 1; i++) {
            const line1 = linesRef.current[i];
            const line2 = linesRef.current[i + 1];
            
            for (let j = 0; j < line1.points.length; j += 5) {
                const point1 = line1.points[j];
                const point2 = line2.points[j];
                
                if (point1 && point2) {
                    const proj1 = project3D(
                        point1.x - width/2,
                        point1.y - height/2,
                        point1.z,
                        rotationRef.current.x,
                        rotationRef.current.y
                    );
                    
                    const proj2 = project3D(
                        point2.x - width/2,
                        point2.y - height/2,
                        point2.z,
                        rotationRef.current.x,
                        rotationRef.current.y
                    );
                    
                    ctx.beginPath();
                    ctx.moveTo(proj1.x, proj1.y);
                    ctx.lineTo(proj2.x, proj2.y);
                    ctx.strokeStyle = `rgba(156, 163, 175, 0.1)`;
                    ctx.stroke();
                }
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
            
            initLines(width, height);
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
    }, [initLines, animate, handleMouseMove]);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none ${className}`}
            style={{ 
                width: '100%', 
                height: '100%',
                display: 'block',
                opacity: 0.4, // Overall opacity reduced
                zIndex: 0 // Ensure it's behind everything
            }}
        />
    );
}