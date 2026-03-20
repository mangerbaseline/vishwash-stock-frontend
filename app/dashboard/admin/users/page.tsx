"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
    Pencil, Save, X, Trash2, User, Mail, Shield, Hash,
    Phone, MapPin, Globe, Calendar, Clock, Key, Camera,
    AlertCircle, CheckCircle, Info, Lock, Eye, EyeOff,
    Github, Linkedin, Twitter, Facebook, Instagram,
    Users
} from 'lucide-react';

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    fullName?: string;
    phone?: string;
    bio?: string;
    photo?: string;
    location?: string;
    website?: string;
    createdAt?: string;
    lastActive?: string;
    emailVerified?: boolean;
    isActive?: boolean;
    social?: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        facebook?: string;
        instagram?: string;
    };
}

// PROFILE EDIT MODAL COMPONENT
interface ProfileEditModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedUser: Partial<User>) => Promise<void>;
    currentUserRole: string;
    currentUserId?: string;
}

const ProfileEditModal = ({ user, isOpen, onClose, onSave, currentUserRole, currentUserId }: ProfileEditModalProps) => {
    const [formData, setFormData] = useState<Partial<User>>({});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'social' | 'security'>('basic');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isEditingSelf = user?._id === currentUserId;
    // Initialize form data when modal opens
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                role: user.role || 'user',
                fullName: user.fullName || '',
                phone: user.phone || '',
                bio: user.bio || '',
                location: user.location || '',
                website: user.website || '',
                photo: user.photo || '',
                social: {
                    github: user.social?.github || '',
                    linkedin: user.social?.linkedin || '',
                    twitter: user.social?.twitter || '',
                    facebook: user.social?.facebook || '',
                    instagram: user.social?.instagram || '',
                }
            });
            setPreviewImage(user.photo || null);
            setErrors({});
        }
    }, [user]);

    if (!isOpen) return null;

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle social media input changes
    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            social: {
                ...prev.social,
                [name]: value
            }
        }));
    };

    // Handle profile picture upload
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, photo: 'Please upload an image file' }));
            return;
        }

        // Validate file size (max 1MB)
        if (file.size > 1024 * 1024) {
            setErrors(prev => ({ ...prev, photo: 'File size must be less than 1MB' }));
            return;
        }

        try {
            // Convert to Base64
            const base64 = await convertToBase64(file);
            setPreviewImage(base64);
            setFormData(prev => ({ ...prev, photo: base64 }));
            setErrors(prev => ({ ...prev, photo: '' }));
        } catch (error) {
            setErrors(prev => ({ ...prev, photo: 'Failed to upload image' }));
        }
    };

    // Convert file to Base64
    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    // Validate form before submission
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.username?.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (formData.username.length > 30) {
            newErrors.username = 'Username cannot exceed 30 characters';
        }

        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!formData.email.includes('@')) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (formData.phone && !/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (formData.website && !formData.website.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
            newErrors.website = 'Please enter a valid URL';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error: any) {
            setErrors({ submit: error.message || 'Failed to update user' });
        } finally {
            setLoading(false);
        }
    };

    // Role options based on current user's role
    const roleOptions = [
        { value: 'user', label: 'User', color: 'bg-green-100 text-green-800' },
        { value: 'moderator', label: 'Moderator', color: 'bg-purple-100 text-purple-800' },
        { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800' }
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">

                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-purple-600/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Edit User Profile
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    ID: <span className="font-mono">{user?._id}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="px-6 pt-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex space-x-4 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('basic')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'basic'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                            >
                                Basic Info
                            </button>
                            <button
                                onClick={() => setActiveTab('contact')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'contact'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                            >
                                Contact Details
                            </button>
                            <button
                                onClick={() => setActiveTab('social')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'social'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                            >
                                Social Links
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'security'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                            >
                                Security & Status
                            </button>
                        </div>
                    </div>

                    {/* Form Body - Scrollable */}
                    <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">

                        {/* Profile Picture Section - Shown in all tabs */}
                        <div className="mb-6 flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                                    {previewImage ? (
                                        <img
                                            src={previewImage}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-3xl font-bold text-white">
                                                {user?.username?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-2 bg-indigo-500 hover:bg-indigo-600 rounded-full text-white shadow-lg transition-all group-hover:scale-110"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handlePhotoUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {formData.fullName || formData.username}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formData.email}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Click the camera icon to change profile picture
                                </p>
                                {errors.photo && (
                                    <p className="text-xs text-red-500 mt-1">{errors.photo}</p>
                                )}
                            </div>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'basic' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Username <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username || ''}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.username
                                                    ? 'border-red-500 focus:ring-red-200'
                                                    : 'border-gray-300 focus:ring-indigo-500'
                                                    } dark:bg-gray-800 dark:border-gray-700`}
                                                placeholder="Enter username"
                                                maxLength={30}
                                            />
                                        </div>
                                        {errors.username && (
                                            <p className="text-xs text-red-500 mt-1">{errors.username}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formData.username?.length || 0}/30 characters
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName || ''}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email || ''}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.email
                                                    ? 'border-red-500 focus:ring-red-200'
                                                    : 'border-gray-300 focus:ring-indigo-500'
                                                    } dark:bg-gray-800 dark:border-gray-700`}
                                                placeholder="Enter email"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Role
                                        </label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <select
                                                name="role"
                                                value={formData.role || 'user'}
                                                onChange={handleInputChange}
                                                disabled={currentUserRole !== 'admin' || isEditingSelf}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
                                            >
                                                {roleOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {currentUserRole !== 'admin' && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Only admins can change roles
                                            </p>
                                        )}
                                        {isEditingSelf && ( // Use isEditingSelf
                                            <p className="text-xs text-gray-400 mt-1">
                                                You cannot change your own role
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Bio
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio || ''}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
                                            placeholder="Write something about the user..."
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formData.bio?.length || 0}/500 characters
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'contact' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone || ''}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.phone
                                                    ? 'border-red-500 focus:ring-red-200'
                                                    : 'border-gray-300 focus:ring-indigo-500'
                                                    } dark:bg-gray-800 dark:border-gray-700`}
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Location
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location || ''}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Website
                                        </label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="url"
                                                name="website"
                                                value={formData.website || ''}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.website
                                                    ? 'border-red-500 focus:ring-red-200'
                                                    : 'border-gray-300 focus:ring-indigo-500'
                                                    } dark:bg-gray-800 dark:border-gray-700`}
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                        {errors.website && (
                                            <p className="text-xs text-red-500 mt-1">{errors.website}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'social' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            GitHub
                                        </label>
                                        <div className="relative">
                                            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="github"
                                                value={formData.social?.github || ''}
                                                onChange={handleSocialChange}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
                                                placeholder="https://github.com/username"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            LinkedIn
                                        </label>
                                        <div className="relative">
                                            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="linkedin"
                                                value={formData.social?.linkedin || ''}
                                                onChange={handleSocialChange}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
                                                placeholder="https://linkedin.com/in/username"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Twitter
                                        </label>
                                        <div className="relative">
                                            <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="twitter"
                                                value={formData.social?.twitter || ''}
                                                onChange={handleSocialChange}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
                                                placeholder="https://twitter.com/username"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Facebook
                                        </label>
                                        <div className="relative">
                                            <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="facebook"
                                                value={formData.social?.facebook || ''}
                                                onChange={handleSocialChange}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
                                                placeholder="https://facebook.com/username"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Instagram
                                        </label>
                                        <div className="relative">
                                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="instagram"
                                                value={formData.social?.instagram || ''}
                                                onChange={handleSocialChange}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
                                                placeholder="https://instagram.com/username"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Account Created
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {user?.createdAt ? new Date(user?.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Last Active
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {user?.lastActive ? new Date(user?.lastActive).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Email Verification
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user?.emailVerified
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {user?.emailVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Key className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Account Status
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user?.isActive !== false
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user?.isActive !== false ? 'Active' : 'Disabled'}
                                            </span>
                                            {currentUserRole === 'admin' && !isEditingSelf && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Are you sure you want to ${user?.isActive !== false ? 'disable' : 'enable'} this account?`)) {
                                                            // Toggle account status
                                                            onSave({ isActive: user?.isActive === false });
                                                        }
                                                    }}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 ml-2"
                                                >
                                                    Toggle Status
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-red-600">{errors.submit}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// MAIN ADMIN USER LIST COMPONENT
export default function AdminUserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for profile edit modal
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Get auth state from Redux
    const authState = useSelector((state: any) => state.auth);
    const token = authState?.token;
    const currentUser = authState?.user;

    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // Check if current user is admin
    useEffect(() => {
        if (!currentUser) return;

        // More robust role check handling potential wrapping or capitalization
        const userRole = currentUser.role || (currentUser.user && currentUser.user.role);

        if (!userRole || userRole.toLowerCase() !== 'admin') {
            console.log('🚫 Access denied. Role found:', userRole);
            setError("Access denied. Admin privileges required.");
            setLoading(false); // Make sure to stop loading
            router.push("/dashboard/stock-dashboard");
        }
    }, [currentUser, router]);

    // Fetch users from backend
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            let authToken = token;
            if (!authToken) {
                authToken = localStorage.getItem('token');
            }

            if (!authToken) {
                setError("No authentication token found. Please login.");
                setLoading(false);
                router.push("/Authentication/signin");
                return;
            }

            const res = await axios.get(`${API_URL}/api/users/all`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
            });

            if (res.data && res.data.users) {
                setUsers(res.data.users);
            } else if (Array.isArray(res.data)) {
                setUsers(res.data);
            }
        } catch (err: any) {
            console.error("Error fetching users:", err);
            setError(err.response?.data?.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    // Function to open edit modal
    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    // Function to save user updates
    const saveUserUpdates = async (updatedData: Partial<User>) => {
        if (!selectedUser) return;

        try {
            let authToken = token;
            if (!authToken) {
                authToken = localStorage.getItem('token');
            }

            console.log('Sending update request for user:', selectedUser._id);
            console.log('Update data:', updatedData);

            const res = await axios.put(
                `${API_URL}/api/users/${selectedUser._id}`,
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (res.status === 200) {
                // Update users list
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user._id === selectedUser._id
                            ? { ...user, ...updatedData }
                            : user
                    )
                );

                setSuccessMessage(`User ${updatedData.username || selectedUser.username} updated successfully!`);

                // Auto-hide success message
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (err: any) {
            console.error("Error updating user:", err);
            throw new Error(err.response?.data?.message || "Failed to update user");
        }
    };

    // Fetch users when component mounts
    useEffect(() => {
        if (!currentUser) {
            // Give it some time to load from Redux/Storage
            const timer = setTimeout(() => {
                if (loading) setLoading(false);
            }, 5000); // 5 sec fallback
            return () => clearTimeout(timer);
        }

        // Same robust role check as above
        const userRole = currentUser.role || (currentUser.user && currentUser.user.role);

        if (userRole && userRole.toLowerCase() === 'admin') {
            fetchUsers();
        } else {
            console.log('🚫 Skipping fetchUsers, not an admin:', userRole);
            setLoading(false); // Make sure to stop loading if not authorized
        }
    }, [currentUser]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-950">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <span className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold animate-pulse tracking-widest uppercase text-xs">Loading users...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-8 rounded-3xl text-center shadow-xl">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Access Restricted</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">{error}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={fetchUsers}
                            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/stock-dashboard')}
                            className="px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">All Users</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5 flex items-center gap-2">
                        Logged in as: <span className="font-semibold text-gray-700 dark:text-gray-300">{currentUser?.username}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${currentUser?.role === 'admin'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                            }`}>
                            {currentUser?.role}
                        </span>
                    </p>
                </div>
                <div className="px-4 py-2 bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    Total: <span className="text-gray-900 dark:text-white font-bold">{users.length}</span> user{users.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 text-green-700 dark:text-green-400 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="p-1 px-1.5 bg-green-100 dark:bg-green-800/30 rounded-full">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{successMessage}</span>
                    </div>
                    <button
                        onClick={() => setSuccessMessage(null)}
                        className="text-green-500 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {users.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="mx-auto w-16 h-16 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No users found in database.</p>
                </div>
            ) : (
                <div className="overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {users.map((user) => (
                                <tr
                                    key={user._id}
                                    className={`group transition-all duration-200 ${user._id !== currentUser?._id
                                        ? 'hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 cursor-pointer'
                                        : 'bg-gray-50/30 dark:bg-gray-800/20'
                                        }`}
                                    onClick={() => {
                                        if (user._id !== currentUser?._id) {
                                            openEditModal(user);
                                        }
                                    }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-11 w-11 relative">
                                                {user.photo ? (
                                                    <img
                                                        className="h-11 w-11 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                                                        src={user.photo}
                                                        alt={user.username}
                                                    />
                                                ) : (
                                                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white border-2 border-white dark:border-gray-800 shadow-sm">
                                                        <span className="font-bold text-sm">
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                {user.isActive !== false && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" title="Online" />
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {user.fullName || user.username}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                    @{user.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                {user.email}
                                            </div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5 mt-1">
                                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                {user.phone || 'No phone'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wider ${user.role === 'admin'
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            : user.role === 'moderator'
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="flex items-center">
                                                <span className={`h-2 w-2 rounded-full ${user.isActive !== false ? 'bg-green-500' : 'bg-red-500'} mr-2 shadow-[0_0_8px_rgba(34,197,94,0.4)]`}></span>
                                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    {user.isActive !== false ? 'Active' : 'Disabled'}
                                                </span>
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-tight flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEditModal(user);
                                            }}
                                            disabled={user._id === currentUser?._id}
                                            className={`inline-flex items-center px-4 py-2 rounded-xl font-bold transition-all duration-200 ${user._id === currentUser?._id
                                                ? 'text-gray-300 dark:text-gray-700 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50'
                                                : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 shadow-sm hover:shadow-indigo-500/30'
                                                }`}
                                        >
                                            <Pencil className="w-4 h-4 mr-2" />
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Profile Edit Modal */}
            <ProfileEditModal
                user={selectedUser!}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                }}
                onSave={saveUserUpdates}
                currentUserRole={currentUser?.role || 'user'}
                currentUserId={currentUser?._id}
            />
        </div>
    );
}