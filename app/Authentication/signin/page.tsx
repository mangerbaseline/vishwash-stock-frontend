"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signin, googleSignIn } from "../../lib/api";
import Link from "next/link";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles,
  Shield, Zap, Chrome, Github, Twitter,
  Loader2, CheckCircle, AlertCircle,
  Briefcase, Star, Heart, Key
} from 'lucide-react';
import clsx from 'clsx';

function SigninContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [success, setSuccess] = useState(false);

  // Handle OAuth callback (Google redirects back here with auth code)
  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(errorParam === 'auth_failed' ? 'Google sign-in failed. Please try again.' : 'Google sign-in was cancelled.');
      return;
    }

    if (code) {
      setGoogleLoading(true);
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      fetch(`${BASE_URL}/api/auth/google/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.token) {
            document.cookie = `auth-token=${data.token}; path=/; max-age=86400; secure; samesite=lax`;
            localStorage.setItem("token", data.token);
            if (data.user) {
              localStorage.setItem("user", JSON.stringify(data.user));
            }
            // Remove code from URL without reload
            window.history.replaceState({}, '', '/Authentication/signin');
            setSuccess(true);
            setTimeout(() => {
              router.replace("/dashboard/stock-dashboard");
            }, 1500);
          } else {
            setError(data.message || 'Google sign-in failed');
          }
        })
        .catch(err => {
          setError(err.message || 'Google sign-in failed');
        })
        .finally(() => {
          setGoogleLoading(false);
        });
    }
  }, [searchParams, router]);

  // Mouse move effect for background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${BASE_URL}/api/auth/google/url`);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to get Google sign-in URL');
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google sign-in');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const data = await signin(email, password);

      if (data.token) {
        document.cookie = `auth-token=${data.token}; path=/; max-age=86400; secure; samesite=lax`;
        localStorage.setItem("token", data.token);

        // Store user data if available
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        if (rememberMe) {
          localStorage.setItem("rememberEmail", email);
        }

        // Show success animation before redirect
        setSuccess(true);
        setTimeout(() => {
          // The redirect will be handled by the layout/component based on role
          router.replace("/dashboard/stock-dashboard");
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Signin failed");
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email
  useEffect(() => {
    const remembered = localStorage.getItem("rememberEmail");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4 relative">

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
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

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-indigo-500/20 dark:bg-indigo-400/20 rounded-full animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">

        {/* Left Side - Brand Showcase */}
        <div className="hidden lg:block space-y-8 p-8">
          {/* Animated Logo */}
          <div className="flex items-center gap-3 animate-fade-in-up">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-2xl opacity-50 animate-pulse" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-3xl font-bold text-white animate-bounce-subtle">V</span>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                ABC
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enterprise Dashboard</p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="space-y-4 animate-fade-in-up animation-delay-200">
            <h2 className="text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Welcome Back!
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Your centralized command center for analytics, users, and business insights.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4 pt-6 animate-fade-in-up animation-delay-400">
            {[
              { icon: Shield, title: "Secure", desc: "Bank-grade encryption", color: "from-indigo-500 to-indigo-600" },
              { icon: Zap, title: "Fast", desc: "Lightning performance", color: "from-purple-500 to-purple-600" },
              { icon: Sparkles, title: "Smart", desc: "AI-powered insights", color: "from-pink-500 to-pink-600" },
              { icon: Briefcase, title: "Enterprise", desc: "Scalable solution", color: "from-blue-500 to-blue-600" },
            ].map((feature, i) => (
              <div key={i} className="group relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`} />
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="pt-8 animate-fade-in-up animation-delay-600">
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="absolute -top-3 left-6">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full p-1.5">
                  <Star className="w-4 h-4 text-white fill-current" />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                "The most comprehensive dashboard I've ever used. Transformed how we handle data."
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold">VS</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">ABC Stock</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enterprise Solution</p>
                </div>
                <Heart className="w-4 h-4 text-red-500 ml-auto animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="relative">
          {/* Success Animation Overlay */}
          {success && (
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl z-20 flex flex-col items-center justify-center animate-scale-up">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 animate-bounce-in">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Welcome Back!</h3>
              <p className="text-white/90">Redirecting to your dashboard...</p>
              <div className="mt-8 flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden group">

            {/* Animated Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

            {/* Header */}
            <div className="relative px-8 pt-8 pb-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Sign In
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Welcome back! Please enter your credentials
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-6 transition-transform duration-300">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden group z-10">
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {error && (
                  <div className="relative bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-slide-down">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                    <div className="absolute bottom-0 left-0 h-0.5 bg-red-500 animate-shrink" style={{ width: '100%' }} />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className={clsx(
                      "absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-0 transition-opacity duration-300",
                      emailFocused && "opacity-20"
                    )} />
                    <div className="relative flex items-center">
                      <Mail className={clsx(
                        "absolute left-4 w-5 h-5 transition-all duration-300",
                        emailFocused ? "text-indigo-500 scale-110" : "text-gray-400"
                      )} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        placeholder="Enter your email"
                        className={clsx(
                          "w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border-2 rounded-xl",
                          "text-gray-900 dark:text-white placeholder-gray-400",
                          "transition-all duration-300 outline-none",
                          emailFocused
                            ? "border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.02]"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Password
                  </label>
                  <div className="relative group">
                    <div className={clsx(
                      "absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-0 transition-opacity duration-300",
                      passwordFocused && "opacity-20"
                    )} />
                    <div className="relative flex items-center">
                      <Lock className={clsx(
                        "absolute left-4 w-5 h-5 transition-all duration-300",
                        passwordFocused ? "text-indigo-500 scale-110" : "text-gray-400"
                      )} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        placeholder="Enter your password"
                        className={clsx(
                          "w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-900/50 border-2 rounded-xl",
                          "text-gray-900 dark:text-white placeholder-gray-400",
                          "transition-all duration-300 outline-none",
                          passwordFocused
                            ? "border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.02]"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500 focus:ring-offset-0 transition-all duration-300 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-indigo-500 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/Authentication/forgot-password"
                    onClick={() => console.log('✅ Link clicked!', new Date().toISOString())}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-all duration-300 hover:scale-105 inline-block"
                  >
                    <span>Forgot password?</span>
                  </Link>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={clsx(
                    "relative w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold",
                    "transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/30",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                    "overflow-hidden group"
                  )}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>

                {/* Social Login - Optional: You can keep or remove based on your requirements */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Chrome, label: 'Google', color: 'from-orange-500 to-red-500' },
                    { icon: Github, label: 'GitHub', color: 'from-gray-700 to-gray-900' },
                    { icon: Twitter, label: 'Twitter', color: 'from-blue-400 to-blue-500' },
                  ].map((provider, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={provider.label === 'Google' ? handleGoogleSignIn : undefined}
                      disabled={provider.label === 'Google' ? googleLoading : false}
                      className={clsx(
                        "relative py-3 px-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700",
                        "hover:border-indigo-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group",
                        "overflow-hidden",
                        provider.label === 'Google' && googleLoading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${provider.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                      {provider.label === 'Google' && googleLoading ? (
                        <Loader2 className="w-5 h-5 mx-auto text-gray-700 dark:text-gray-300 animate-spin" />
                      ) : (
                        <provider.icon className="w-5 h-5 mx-auto text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform" />
                      )}
                      <span className="sr-only">{provider.label}</span>
                    </button>
                  ))}
                </div>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    href="/Authentication/signup"
                    className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-all duration-300 group"
                  >
                    <span>Sign up for free</span>
                    <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS Animations */}
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
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease infinite;
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink {
          animation: shrink 3s linear forwards;
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-up {
          animation: scale-up 0.3s ease-out forwards;
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-3xl font-bold text-white">V</span>
          </div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <SigninContent />
    </Suspense>
  );
}

