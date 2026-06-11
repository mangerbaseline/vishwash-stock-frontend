// frontend/app/components/threejs/MarketGlobe.tsx
'use client';

import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    OrbitControls,
    Sphere,
    Html,
    Float,
    Text
} from '@react-three/drei';
import * as THREE from 'three';

// Types
interface MarketIndex {
    name: string;
    value: number;
    change: number;
    volume: number;
}

export interface MarketRegion {
    id: string;
    name: string;
    lat: number;
    lng: number;
    sentiment: number;
    volume: number;
    indices: MarketIndex[];
}

// Convert lat/lng to 3D coordinates
const latLngToVector3 = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = lng * Math.PI / 180;
    return new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
};

// Particle System Component
const VolumeParticles = ({
    regions,
    radius
}: {
    regions: MarketRegion[],
    radius: number
}) => {
    const particlesRef = useRef<THREE.Group>(null);
    const [particles, setParticles] = useState<JSX.Element[]>([]);

    useEffect(() => {
        const newParticles: JSX.Element[] = [];
        for (let i = 0; i < regions.length; i++) {
            for (let j = i + 1; j < regions.length; j++) {
                const volume = (regions[i].volume + regions[j].volume) / 2;
                const particleCount = Math.min(Math.floor(volume / 2000), 50);

                for (let k = 0; k < particleCount; k++) {
                    const start = latLngToVector3(regions[i].lat, regions[i].lng, radius);
                    const end = latLngToVector3(regions[j].lat, regions[j].lng, radius);
                    const t = Math.random();
                    const position = start.clone().lerp(end, t);

                    newParticles.push(
                        <mesh key={`${i}-${j}-${k}`} position={[position.x, position.y, position.z]}>
                            <sphereGeometry args={[0.008, 6, 6]} />
                            <meshStandardMaterial
                                color={Math.random() > 0.5 ? '#4caf50' : '#ff5252'}
                                emissive={Math.random() > 0.5 ? '#4caf50' : '#ff5252'}
                                emissiveIntensity={0.3}
                            />
                        </mesh>
                    );
                }
            }
        }
        setParticles(newParticles);
    }, [regions, radius]);

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y += 0.0005;
        }
    });

    return <group ref={particlesRef}>{particles}</group>;
};

// Region Marker Component
const RegionMarker = ({
    region,
    radius,
    onClick
}: {
    region: MarketRegion,
    radius: number,
    onClick: (region: MarketRegion) => void
}) => {
    const [hovered, setHovered] = useState(false);
    const position = latLngToVector3(region.lat, region.lng, radius + 0.05);

    const getColor = () => {
        if (region.sentiment > 0.3) return '#4caf50';
        if (region.sentiment > 0) return '#8bc34a';
        if (region.sentiment > -0.3) return '#ff9800';
        return '#ff5252';
    };

    const markerScale = 0.05 + Math.min(region.volume / 10000, 0.15);

    return (
        <group position={position}>
            <mesh
                onClick={() => onClick(region)}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[markerScale, 32, 32]} />
                <meshStandardMaterial
                    color={getColor()}
                    emissive={getColor()}
                    emissiveIntensity={hovered ? 0.8 : 0.2}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {hovered && (
                <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
                    <mesh>
                        <sphereGeometry args={[markerScale * 1.5, 32, 32]} />
                        <meshStandardMaterial
                            color={getColor()}
                            transparent
                            opacity={0.3}
                        />
                    </mesh>
                </Float>
            )}

            <Html distanceFactor={10}>
                <div className="bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs whitespace-nowrap border border-gray-600 pointer-events-none">
                    {region.name}
                    <span className="ml-1" style={{ color: getColor() }}>
                        {region.sentiment > 0 ? '▲' : '▼'} {Math.abs(region.sentiment * 100).toFixed(0)}%
                    </span>
                </div>
            </Html>
        </group>
    );
};

// Stars Background
const Stars = () => {
    const starsRef = useRef<THREE.Points>(null);
    const [starPositions] = useState(() => {
        const positions = [];
        for (let i = 0; i < 2000; i++) {
            positions.push((Math.random() - 0.5) * 1000);
            positions.push((Math.random() - 0.5) * 600);
            positions.push((Math.random() - 0.5) * 300 - 100);
        }
        return new Float32Array(positions);
    });

    return (
        <points ref={starsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
            </bufferGeometry>
            <pointsMaterial color="white" size={0.2} transparent opacity={0.6} />
        </points>
    );
};

// Main Globe Component
const Globe = ({
    regions,
    onRegionClick
}: {
    regions: MarketRegion[],
    onRegionClick: (region: MarketRegion) => void
}) => {
    const globeRef = useRef<THREE.Mesh>(null);
    const radius = 2;

    useFrame(() => {
        if (globeRef.current) {
            globeRef.current.rotation.y += 0.0005;
        }
    });

    return (
        <>
            <Sphere ref={globeRef} args={[radius, 64, 64]}>
                <meshStandardMaterial
                    color="#1a1a2e"
                    metalness={0.4}
                    roughness={0.6}
                    emissive="#0a0a1a"
                    emissiveIntensity={0.2}
                />
            </Sphere>

            {/* Grid lines for better visual */}
            <Sphere args={[radius + 0.01, 64, 64]}>
                <meshBasicMaterial
                    color="#3a3a5e"
                    wireframe
                    transparent
                    opacity={0.1}
                />
            </Sphere>

            {regions.map(region => (
                <RegionMarker
                    key={region.id}
                    region={region}
                    radius={radius}
                    onClick={onRegionClick}
                />
            ))}

            <VolumeParticles regions={regions} radius={radius} />
            <Stars />
        </>
    );
};

// Main Export Component
export const MarketGlobe = () => {
    const [selectedRegion, setSelectedRegion] = useState<MarketRegion | null>(null);
    const [regions, setRegions] = useState<MarketRegion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch market data
    const fetchMarketData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/market/sentiment');
            if (!response.ok) throw new Error('Failed to fetch market data');
            const data = await response.json();
            setRegions(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching market data:', err);
            setError('Failed to load market data');
        } finally {
            setLoading(false);
        }
    }, []);

    // Poll for real-time updates
    useEffect(() => {
        fetchMarketData();

        // Poll for updates every 10 seconds
        const interval = setInterval(async () => {
            try {
                const response = await fetch('/api/market/ws?lastUpdate=' + Date.now());
                if (response.ok) {
                    const updates = await response.json();
                    if (updates.updates && updates.updates.length > 0) {
                        setRegions(prevRegions => {
                            const newRegions = [...prevRegions];
                            updates.updates.forEach((update: any) => {
                                const regionIndex = newRegions.findIndex(r => r.id === update.regionId);
                                if (regionIndex !== -1) {
                                    newRegions[regionIndex] = {
                                        ...newRegions[regionIndex],
                                        sentiment: update.sentiment,
                                        volume: update.volume
                                    };
                                }
                            });
                            return newRegions;
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching updates:', err);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [fetchMarketData]);

    const handleRegionClick = (region: MarketRegion) => {
        setSelectedRegion(region);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-white text-xl">Loading market data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <div className="text-center">
                    <p className="text-red-500 text-xl mb-4">{error}</p>
                    <button
                        onClick={fetchMarketData}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden">
            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-4">
                <h1 className="text-white text-2xl font-bold">Global Market Sentiment</h1>
                <p className="text-gray-300 text-sm mt-1">Interactive 3D Visualization | Real-time Data</p>
            </div>

            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-green-500">●</span>
                    <span className="text-white ml-1 text-sm">Bullish</span>
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-orange-500">●</span>
                    <span className="text-white ml-1 text-sm">Neutral</span>
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-red-500">●</span>
                    <span className="text-white ml-1 text-sm">Bearish</span>
                </div>
            </div>

            <Canvas
                camera={{ position: [0, 0, 8], fov: 45 }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <directionalLight position={[5, 3, 5]} intensity={0.5} />

                <Suspense fallback={null}>
                    <Globe regions={regions} onRegionClick={handleRegionClick} />
                </Suspense>

                <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    zoomSpeed={0.8}
                    rotateSpeed={0.8}
                    minDistance={4}
                    maxDistance={12}
                />
            </Canvas>

            {/* Region Details Modal */}
            {selectedRegion && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 w-96">
                    <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-white text-xl font-bold">{selectedRegion.name}</h2>
                            <button
                                onClick={() => setSelectedRegion(null)}
                                className="text-gray-400 hover:text-white text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Market Sentiment</span>
                                <span className={selectedRegion.sentiment > 0 ? 'text-green-500' : 'text-red-500'}>
                                    {selectedRegion.sentiment > 0 ? 'Bullish' : 'Bearish'}
                                    ({Math.abs(selectedRegion.sentiment * 100).toFixed(0)}%)
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Trading Volume</span>
                                <span className="text-white">{selectedRegion.volume.toLocaleString()}M</span>
                            </div>

                            <div className="border-t border-gray-700 my-3"></div>

                            <div>
                                <h3 className="text-white font-semibold mb-2">Major Indices</h3>
                                {selectedRegion.indices.map((index, i) => (
                                    <div key={i} className="flex justify-between items-center mb-2">
                                        <span className="text-gray-300 text-sm">{index.name}</span>
                                        <div className="text-right">
                                            <span className="text-white text-sm">{index.value.toLocaleString()}</span>
                                            <span className={`ml-2 text-sm ${index.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {index.change >= 0 ? '+' : ''}{index.change}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-300">
                <div>🖱️ Drag to rotate | Scroll to zoom</div>
                <div className="mt-1">✨ Particles show trading volume between regions</div>
                <div className="mt-1">🔄 Data updates every 10 seconds</div>
            </div>
        </div>
    );
};