'use client';
import Image from 'next/image';
import Link from 'next/link';
import bgImage from '../../Images/bg.jpg';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, updateUserProfile } from '../../lib/api';
import {
  Facebook,
  Twitter,
  Linkedin,
  Dribbble,
  Globe,
  Camera,
  Edit2,
  Save,
  X,
  MapPin,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  Link2,
  Award,
  Heart,
  Share2,
  MoreHorizontal,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Shield,
  Github,
  Instagram,
  Youtube,
  Activity,
  User
} from 'lucide-react';

interface UserData {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  bio?: string;
  photo: string;
  role: string;
  location?: string;
  website?: string;
  joinDate?: string;
  skills?: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState<UserData>({
    _id: '',
    username: '',
    email: '',
    fullName: '',
    phone: '',
    bio: '',
    photo: '',
    role: '',
    location: '',
    website: '',
    skills: []
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse move effect for background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, redirecting to signin");
          router.push('/Authentication/signin');
          return;
        }

        console.log("Fetching user profile...");
        const data = await getUserProfile(token);
        console.log('Fetched user data:', data);

        if (!data) {
          throw new Error("No user data received");
        }

        // Ensure all fields have default values
        const userData: UserData = {
          _id: data._id || '',
          username: data.username || '',
          email: data.email || '',
          fullName: data.fullName || '',
          phone: data.phone || '',
          bio: data.bio || '',
          photo: data.photo || '', // This comes from mapped avatar field
          role: data.role || 'user',
          location: data.location || '',
          website: data.website || '',
          skills: Array.isArray(data.skills) ? data.skills : [],
          joinDate: data.joinDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };

        setUser(userData);
        setEditForm(userData);

        console.log("User state set:", userData);
      } catch (error) {
        console.error("Error fetching user", error);
        setError(error instanceof Error ? error.message : "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Handle profile picture upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);

    try {
      const base64 = await convertToBase64(file);
      setEditForm(prev => ({ ...prev, photo: base64 }));

      if (!isEditing) {
        const token = localStorage.getItem("token");
        if (!token) return;

        const updatedData = { ...editForm, photo: base64 };
        await updateUserProfile(token, updatedData);
        setUser(prev => prev ? { ...prev, photo: base64 } : null);

        // Update localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.avatar = base64;
          localStorage.setItem("user", JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push('/Authentication/signin');
        return;
      }

      const updatedData = {
        ...editForm,
        fullName: editForm.fullName || '',
        phone: editForm.phone || '',
        bio: editForm.bio || '',
        location: editForm.location || '',
        website: editForm.website || '',
        skills: Array.isArray(editForm.skills) ? editForm.skills : []
      };

      console.log("Saving updated profile:", updatedData);

      // Try to update on server
      try {
        const response = await updateUserProfile(token, updatedData);
        console.log('Save response:', response);
      } catch (error) {
        console.error("Server update failed, but will update locally:", error);
      }

      // Update local state
      setUser(updatedData);
      setIsEditing(false);
      setSaveSuccess(true);

      // Update localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const updatedStoredUser = { ...userData, ...updatedData, avatar: updatedData.photo };
        localStorage.setItem("user", JSON.stringify(updatedStoredUser));
      }

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating profile", error);
      alert("Failed to update profile: " + (error as Error).message);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      case 'moderator':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'premium':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  // Get user display name with fallback
  const getUserDisplayName = () => {
    if (isEditing) {
      return editForm.fullName || editForm.username || 'User';
    }
    return user?.fullName || user?.username || 'User';
  };

  // Get user initial with fallback
  const getUserInitial = () => {
    const displayName = getUserDisplayName();
    return displayName ? displayName.charAt(0).toUpperCase() : 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No User Data</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Unable to load user profile. Please sign in again.</p>
          <button
            onClick={() => router.push('/Authentication/signin')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8 relative">

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          className="absolute top-20 -left-20 w-96 h-96 bg-purple-300 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob"
          style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }}
        />
        <div
          className="absolute top-40 -right-20 w-96 h-96 bg-indigo-300 dark:bg-indigo-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"
          style={{ transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)` }}
        />
        <div
          className="absolute -bottom-20 left-20 w-96 h-96 bg-pink-300 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"
          style={{ transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * -0.01}px)` }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/stock-dashboard" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
              Dashboard
            </Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">Profile</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-green-700 dark:text-green-400">Profile updated successfully!</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">

          {/* Cover Image */}
          <div className="relative h-48 md:h-64">
            <Image
              src={bgImage}
              alt="Cover"
              className="w-full h-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/30" />

            {/* Edit/Save Buttons */}
            <div className="absolute bottom-6 right-6 flex gap-3 z-50">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white rounded-lg font-medium flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 shadow-lg transition-all cursor-pointer relative"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all cursor-pointer relative"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        fullName: user.fullName || '',
                        phone: user.phone || '',
                        bio: user.bio || '',
                        photo: user.photo,
                        role: user.role,
                        location: user.location || '',
                        website: user.website || '',
                        skills: user.skills || [],
                        joinDate: user.joinDate || 'January 2026'
                      });
                    }}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all cursor-pointer relative"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Picture */}
          <div className="relative px-6 pb-6">
            <div className="flex items-end -mt-12 mb-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-28 h-28 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-white dark:bg-gray-900">
                  {editForm.photo ? (
                    <img
                      src={editForm.photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Image failed to load");
                        e.currentTarget.style.display = 'none';
                        // Show fallback
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = "w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center";
                          fallback.innerHTML = `<span class="text-3xl font-bold text-white">${getUserInitial()}</span>`;
                          parent.innerHTML = '';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {getUserInitial()}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 disabled:opacity-50"
                >
                  {uploadingPhoto ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="ml-4 flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editForm.fullName || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Full Name"
                      className="w-full max-w-md px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={editForm.username || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Username"
                      className="w-full max-w-md px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {getUserDisplayName()}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getRoleBadgeColor(user.role)}`}>
                        {user.role || 'user'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location, Website, Join Date */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.location || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Location"
                    className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <span className="text-sm">{user.location || 'Add location'}</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Link2 className="w-4 h-4" />
                {isEditing ? (
                  <input
                    type="url"
                    value={editForm.website || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="Website"
                    className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <a
                    href={user.website || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                  >
                    {user.website?.replace('https://', '') || 'Add website'}
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined {user.joinDate || 'January 2026'}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-6">
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">259</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Posts</div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">129K</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">2K</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 mb-6">
              {['about', 'activity', 'projects', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize -mb-px ${activeTab === tab
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {activeTab === 'about' && (
                <div className="space-y-6">
                  {/* Bio */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      About Me
                    </h3>
                    {isEditing ? (
                      <textarea
                        value={editForm.bio || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        placeholder="Write something about yourself..."
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        {user.bio || 'No bio added yet.'}
                      </p>
                    )}
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-500" />
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.skills?.join(', ') || ''}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          }))}
                          placeholder="React, Node.js, TypeScript"
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        user.skills && user.skills.length > 0 ? (
                          user.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 text-sm">No skills added</p>
                        )
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-indigo-500" />
                      Contact
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {isEditing ? (
                          <input
                            type="email"
                            value={editForm.email || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                            className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editForm.phone || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Phone number"
                            className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">{user.phone || 'Not provided'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Recent Activity</h3>
                  <p className="text-gray-500 dark:text-gray-400">Your activity will appear here</p>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Projects</h3>
                  <p className="text-gray-500 dark:text-gray-400">Your projects will be displayed here</p>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates</p>
                    </div>
                    <div className="w-12 h-6 bg-indigo-500 rounded-full relative">
                      <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add extra security</p>
                    </div>
                    <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm transition-colors">
                      Enable
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Connect</h4>
              <div className="flex gap-3">
                {[Facebook, Twitter, Linkedin, Github, Instagram, Youtube].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}























// 'use client';
// import Image from 'next/image';
// import Link from 'next/link';
// import bgImage from '../../Images/bg.jpg';
// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { getUserProfile, updateUserProfile } from '../../lib/api';
// import {
//   Facebook,
//   Twitter,
//   Linkedin,
//   Dribbble,
//   Globe,
//   Camera,
//   Edit2,
//   Save,
//   X,
//   MapPin,
//   Briefcase,
//   Calendar,
//   Mail,
//   Phone,
//   Link2,
//   Award,
//   Heart,
//   Share2,
//   MoreHorizontal,
//   Check,
//   AlertCircle,
//   Loader2,
//   Sparkles,
//   Shield,
//   Github,
//   Instagram,
//   Youtube,
//   Activity
// } from 'lucide-react';

// interface UserData {
//   _id: string;
//   username: string;
//   email: string;
//   fullName?: string;
//   phone?: string;
//   bio?: string;
//   photo: string;
//   role: string;
//   location?: string;
//   website?: string;
//   joinDate?: string;
//   skills?: string[];
// }

// export default function ProfilePage() {
//   const router = useRouter();
//   const [user, setUser] = useState<UserData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [uploadingPhoto, setUploadingPhoto] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [editForm, setEditForm] = useState<UserData>({
//     _id: '',
//     username: '',
//     email: '',
//     fullName: '',
//     phone: '',
//     bio: '',
//     photo: '',
//     role: '',
//     location: '',
//     website: '',
//     skills: []
//   });
//   const [saveSuccess, setSaveSuccess] = useState(false);
//   const [activeTab, setActiveTab] = useState('about');
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

//   // Mouse move effect for background
//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     };
//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
//   }, []);

//   // Fetch user data
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           router.push('/Authentication/signin');
//           return;
//         }
//         const data = await getUserProfile(token);
//         console.log('Fetched user data:', data);

//         setUser(data);
//         setEditForm({
//           _id: data._id || '',
//           username: data.username || '',
//           email: data.email || '',
//           fullName: data.fullName || '',
//           phone: data.phone || '',
//           bio: data.bio || '',
//           photo: data.photo || '',
//           role: data.role || '',
//           location: data.location || '',
//           website: data.website || '',
//           skills: data.skills || [],
//           joinDate: data.joinDate || 'January 2026'
//         });
//       } catch (error) {
//         console.error("Error fetching user", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUser();
//   }, [router]);

//   // Handle profile picture upload
//   const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       alert('Please upload an image file');
//       return;
//     }

//     if (file.size > 1024 * 1024) {
//       alert('File size must be less than 1MB');
//       return;
//     }

//     setUploadingPhoto(true);

//     try {
//       const base64 = await convertToBase64(file);
//       setEditForm(prev => ({ ...prev, photo: base64 }));

//       if (!isEditing) {
//         const token = localStorage.getItem("token");
//         if (!token) return;

//         await updateUserProfile(token, { ...editForm, photo: base64 });
//         setUser(prev => prev ? { ...prev, photo: base64 } : null);
//       }
//     } catch (error) {
//       console.error("Error uploading photo:", error);
//       alert("Failed to upload photo");
//     } finally {
//       setUploadingPhoto(false);
//     }
//   };

//   const convertToBase64 = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result as string);
//       reader.onerror = (error) => reject(error);
//     });
//   };

//   const handleSave = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return;

//       const updatedData = {
//         ...editForm,
//         fullName: editForm.fullName || '',
//         phone: editForm.phone || '',
//         bio: editForm.bio || '',
//         location: editForm.location || '',
//         website: editForm.website || '',
//         skills: editForm.skills || []
//       };

//       const response = await updateUserProfile(token, updatedData);
//       console.log('Save response:', response);

//       setUser(updatedData);
//       setIsEditing(false);
//       setSaveSuccess(true);

//       setTimeout(() => {
//         setSaveSuccess(false);
//       }, 3000);
//     } catch (error) {
//       console.error("Error updating profile", error);
//       alert("Failed to update profile: " + (error as Error).message);
//     }
//   };

//   const getRoleBadgeColor = (role: string) => {
//     switch (role?.toLowerCase()) {
//       case 'admin':
//         return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
//       case 'moderator':
//         return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
//       case 'premium':
//         return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white';
//       default:
//         return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
//         <div className="flex flex-col items-center">
//           <div className="relative">
//             <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
//             </div>
//           </div>
//           <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">Loading Profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h2>
//           <button
//             onClick={() => router.push('/dashboard')}
//             className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
//           >
//             Go to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8 relative">

//       {/* Animated Background Elements - Moved to back */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
//         <div
//           className="absolute top-20 -left-20 w-96 h-96 bg-purple-300 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob"
//           style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }}
//         />
//         <div
//           className="absolute top-40 -right-20 w-96 h-96 bg-indigo-300 dark:bg-indigo-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"
//           style={{ transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)` }}
//         />
//         <div
//           className="absolute -bottom-20 left-20 w-96 h-96 bg-pink-300 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"
//           style={{ transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * -0.01}px)` }}
//         />
//       </div>

//       <div className="relative max-w-7xl mx-auto">
//         {/* Breadcrumb */}
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center gap-2">
//             <Link href="/dashboard" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
//               Dashboard
//             </Link>
//             <span className="text-gray-300 dark:text-gray-600">/</span>
//             <span className="text-indigo-600 dark:text-indigo-400 font-medium">Profile</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
//               <Share2 className="w-5 h-5" />
//             </button>
//             <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
//               <MoreHorizontal className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         {/* Success Message */}
//         {saveSuccess && (
//           <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
//             <Check className="w-5 h-5 text-green-500" />
//             <span className="text-green-700 dark:text-green-400">Profile updated successfully!</span>
//           </div>
//         )}

//         {/* Profile Card */}
//         <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">

//           {/* Cover Image */}
//           <div className="relative h-48 md:h-64">
//             <Image
//               src={bgImage}
//               alt="Cover"
//               className="w-full h-full object-cover"
//               priority
//             />
//             <div className="absolute inset-0 bg-black/30" />

//             {/* Edit/Save Buttons */}
//             {/* Profile Actions */}
//             <div className="absolute bottom-6 right-6 flex gap-3 z-50"> {/* Added z-50 */}
//               {!isEditing ? (
//                 <button
//                   onClick={() => setIsEditing(true)}
//                   className="px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white rounded-lg font-medium flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 shadow-lg transition-all cursor-pointer relative"
//                 >
//                   <Edit2 className="w-4 h-4" />
//                   Edit Profile
//                 </button>
//               ) : (
//                 <>
//                   <button
//                     onClick={handleSave}
//                     className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all cursor-pointer relative"
//                   >
//                     <Save className="w-4 h-4" />
//                     Save
//                   </button>
//                   <button
//                     onClick={() => {
//                       setIsEditing(false);
//                       setEditForm({
//                         _id: user._id,
//                         username: user.username,
//                         email: user.email,
//                         fullName: user.fullName || '',
//                         phone: user.phone || '',
//                         bio: user.bio || '',
//                         photo: user.photo,
//                         role: user.role,
//                         location: user.location || '',
//                         website: user.website || '',
//                         skills: user.skills || [],
//                         joinDate: user.joinDate || 'January 2026'
//                       });
//                     }}
//                     className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all cursor-pointer relative"
//                   >
//                     <X className="w-4 h-4" />
//                     Cancel
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Profile Picture */}
//           <div className="relative px-6 pb-6">
//             <div className="flex items-end -mt-12 mb-4">
//               <div className="relative group">
//                 <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity" />
//                 <div className="relative w-28 h-28 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-white dark:bg-gray-900">
//                   {editForm.photo ? (
//                     <img
//                       src={editForm.photo}
//                       alt="Profile"
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
//                       <span className="text-3xl font-bold text-white">
//                         {user.username.charAt(0).toUpperCase()}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => fileInputRef.current?.click()}
//                   disabled={uploadingPhoto}
//                   className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 disabled:opacity-50"
//                 >
//                   {uploadingPhoto ? (
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   ) : (
//                     <Camera className="w-4 h-4 text-white" />
//                   )}
//                 </button>
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   onChange={handlePhotoUpload}
//                   accept="image/*"
//                   className="hidden"
//                 />
//               </div>
//               <div className="ml-4 flex-1">
//                 {isEditing ? (
//                   <div className="space-y-2">
//                     <input
//                       type="text"
//                       value={editForm.fullName || ''}
//                       onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
//                       placeholder="Full Name"
//                       className="w-full max-w-md px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     />
//                     <input
//                       type="text"
//                       value={editForm.username || ''}
//                       onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
//                       placeholder="Username"
//                       className="w-full max-w-md px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     />
//                   </div>
//                 ) : (
//                   <div>
//                     <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//                       {user.fullName || user.username}
//                     </h1>
//                     <div className="flex items-center gap-2 mt-1">
//                       <Briefcase className="w-4 h-4 text-gray-400" />
//                       <span className="text-gray-600 dark:text-gray-400">{user.role}</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Location, Website, Join Date */}
//             <div className="flex flex-wrap gap-4 mb-6">
//               <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
//                 <MapPin className="w-4 h-4" />
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     value={editForm.location || ''}
//                     onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
//                     placeholder="Location"
//                     className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 ) : (
//                   <span className="text-sm">{user.location || 'Add location'}</span>
//                 )}
//               </div>
//               <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
//                 <Link2 className="w-4 h-4" />
//                 {isEditing ? (
//                   <input
//                     type="url"
//                     value={editForm.website || ''}
//                     onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
//                     placeholder="Website"
//                     className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 ) : (
//                   <a
//                     href={user.website || '#'}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
//                   >
//                     {user.website?.replace('https://', '') || 'Add website'}
//                   </a>
//                 )}
//               </div>
//               <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
//                 <Calendar className="w-4 h-4" />
//                 <span className="text-sm">Joined {user.joinDate || 'January 2026'}</span>
//               </div>
//             </div>

//             {/* Stats */}
//             <div className="flex gap-6 mb-6">
//               <div>
//                 <div className="text-xl font-bold text-gray-900 dark:text-white">259</div>
//                 <div className="text-xs text-gray-500 dark:text-gray-400">Posts</div>
//               </div>
//               <div>
//                 <div className="text-xl font-bold text-gray-900 dark:text-white">129K</div>
//                 <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
//               </div>
//               <div>
//                 <div className="text-xl font-bold text-gray-900 dark:text-white">2K</div>
//                 <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
//               </div>
//             </div>

//             {/* Tabs */}
//             <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 mb-6">
//               {['about', 'activity', 'projects', 'settings'].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`px-4 py-2 text-sm font-medium capitalize -mb-px ${activeTab === tab
//                     ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
//                     : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//                     }`}
//                 >
//                   {tab}
//                 </button>
//               ))}
//             </div>

//             {/* Tab Content */}
//             <div className="min-h-[300px]">
//               {activeTab === 'about' && (
//                 <div className="space-y-6">
//                   {/* Bio */}
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
//                       <Sparkles className="w-5 h-5 text-indigo-500" />
//                       About Me
//                     </h3>
//                     {isEditing ? (
//                       <textarea
//                         value={editForm.bio || ''}
//                         onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
//                         rows={4}
//                         placeholder="Write something about yourself..."
//                         className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                       />
//                     ) : (
//                       <p className="text-gray-600 dark:text-gray-400">
//                         {user.bio || 'No bio added yet.'}
//                       </p>
//                     )}
//                   </div>

//                   {/* Skills */}
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
//                       <Award className="w-5 h-5 text-indigo-500" />
//                       Skills
//                     </h3>
//                     <div className="flex flex-wrap gap-2">
//                       {isEditing ? (
//                         <input
//                           type="text"
//                           value={editForm.skills?.join(', ') || ''}
//                           onChange={(e) => setEditForm(prev => ({
//                             ...prev,
//                             skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
//                           }))}
//                           placeholder="React, Node.js, TypeScript"
//                           className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                         />
//                       ) : (
//                         user.skills && user.skills.length > 0 ? (
//                           user.skills.map((skill, index) => (
//                             <span
//                               key={index}
//                               className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
//                             >
//                               {skill}
//                             </span>
//                           ))
//                         ) : (
//                           <p className="text-gray-500 dark:text-gray-400 text-sm">No skills added</p>
//                         )
//                       )}
//                     </div>
//                   </div>

//                   {/* Contact Info */}
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
//                       <Mail className="w-5 h-5 text-indigo-500" />
//                       Contact
//                     </h3>
//                     <div className="space-y-2">
//                       <div className="flex items-center gap-2">
//                         <Mail className="w-4 h-4 text-gray-400" />
//                         {isEditing ? (
//                           <input
//                             type="email"
//                             value={editForm.email || ''}
//                             onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
//                             className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                           />
//                         ) : (
//                           <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
//                         )}
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Phone className="w-4 h-4 text-gray-400" />
//                         {isEditing ? (
//                           <input
//                             type="tel"
//                             value={editForm.phone || ''}
//                             onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
//                             placeholder="Phone number"
//                             className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                           />
//                         ) : (
//                           <span className="text-gray-600 dark:text-gray-400">{user.phone || 'Not provided'}</span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {activeTab === 'activity' && (
//                 <div className="text-center py-12">
//                   <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Recent Activity</h3>
//                   <p className="text-gray-500 dark:text-gray-400">Your activity will appear here</p>
//                 </div>
//               )}

//               {activeTab === 'projects' && (
//                 <div className="text-center py-12">
//                   <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Projects</h3>
//                   <p className="text-gray-500 dark:text-gray-400">Your projects will be displayed here</p>
//                 </div>
//               )}

//               {activeTab === 'settings' && (
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
//                     <div>
//                       <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates</p>
//                     </div>
//                     <div className="w-12 h-6 bg-indigo-500 rounded-full relative">
//                       <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
//                     <div>
//                       <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">Add extra security</p>
//                     </div>
//                     <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm transition-colors">
//                       Enable
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Social Links */}
//             <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
//               <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Connect</h4>
//               <div className="flex gap-3">
//                 {[Facebook, Twitter, Linkedin, Github, Instagram, Youtube].map((Icon, index) => (
//                   <a
//                     key={index}
//                     href="#"
//                     className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
//                   >
//                     <Icon className="w-4 h-4" />
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes blob {
//           0%, 100% { transform: translate(0px, 0px) scale(1); }
//           33% { transform: translate(30px, -50px) scale(1.1); }
//           66% { transform: translate(-20px, 20px) scale(0.9); }
//         }
//         .animate-blob {
//           animation: blob 7s infinite;
//         }
//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }
//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }
//       `}</style>
//     </div>
//   );
// }