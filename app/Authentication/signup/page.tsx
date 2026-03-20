'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { signup } from '../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight,
  Sparkles, Shield, Zap, CheckCircle, AlertCircle,
  Loader2, Star, Heart, Briefcase, Github, Chrome,
  ChevronRight, Award, ThumbsUp
} from 'lucide-react';
import { ToastContainer, useToast } from '../../components/ui/toast';
import clsx from 'clsx'; // Install: npm install clsx

interface EmailStatus {
  sent: boolean;
  message: string;
  timestamp?: string;
  error?: string;
  details?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  // Combine related states into objects to reduce re-renders
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  });

  const [uiState, setUiState] = useState({
    loading: false,
    error: "",
    successDemo: false,
    acceptedTerms: false,
    focusedField: null as string | null,
    showPassword: false,
    showConfirmPassword: false
  });

  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [showEmailDetails, setShowEmailDetails] = useState(false);

  // Debounced password strength calculation
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');

  // Optimized password strength checker with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!formData.password) {
        setPasswordStrength(0);
        setPasswordFeedback('');
        return;
      }

      let strength = 0;
      const feedback = [];

      if (formData.password.length >= 8) strength += 25;
      else feedback.push('at least 8 characters');

      if (/[A-Z]/.test(formData.password)) strength += 25;
      else feedback.push('uppercase letter');

      if (/[0-9]/.test(formData.password)) strength += 25;
      else feedback.push('number');

      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;
      else feedback.push('special character');

      setPasswordStrength(strength);

      if (strength < 50) {
        setPasswordFeedback(`Add ${feedback.join(', ')}`);
      } else if (strength < 75) {
        setPasswordFeedback('Good password');
      } else {
        setPasswordFeedback('Strong password!');
      }
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timer);
  }, [formData.password]);

  // Memoized validation function
  const validateForm = useCallback(() => {
    if (!formData.phone || formData.phone.length < 10) {
      return "Please enter a valid phone number";
    }
    if (!formData.username.trim()) {
      return "Username is required";
    }
    if (formData.username.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      return "Please enter a valid email";
    }
    if (!formData.password || formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    if (!uiState.acceptedTerms) {
      return "Please accept the terms and conditions";
    }
    return null;
  }, [formData, uiState.acceptedTerms]);

  // Optimized form handler
  const handleSignup = async () => {
    const formError = validateForm();
    if (formError) {
      setUiState(prev => ({ ...prev, error: formError }));
      addToast(formError, 'error');
      return;
    }

    setUiState(prev => ({ ...prev, loading: true, error: "" }));
    setEmailStatus(null);

    try {
      const res = await signup({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone
      });

      if (res.success) {
        setUiState(prev => ({ ...prev, successDemo: true }));
        addToast('✅ Account created successfully!', 'success');

        const emailResult = {
          sent: true,
          message: `Welcome email sent to ${formData.email}`,
          timestamp: new Date().toLocaleString(),
          details: 'The email has been delivered to your inbox.'
        };

        setEmailStatus(emailResult);
        addToast(`📧 ${emailResult.message}`, 'email_sent');

        setTimeout(() => {
          router.push("/Authentication/signin?registered=1");
        }, 2000); // Reduced from 4000ms to 2000ms
      } else {
        setUiState(prev => ({ ...prev, error: res.message || "Signup failed" }));
        addToast(res.message || "Signup failed", 'error');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      const errorMsg = err.message || "Signup failed";
      setUiState(prev => ({ ...prev, error: errorMsg }));
      addToast(errorMsg, 'error');

      setEmailStatus({
        sent: false,
        message: 'Failed to send welcome email',
        error: err.emailError || 'Email service unavailable',
        timestamp: new Date().toLocaleString(),
        details: 'There was a problem sending the welcome email.'
      });
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  };

  // Memoized helper functions
  const getStrengthColor = useCallback(() => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  }, [passwordStrength]);

  const getStrengthText = useCallback(() => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  }, [passwordStrength]);

  // Handle input changes efficiently
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4 overflow-hidden relative">

      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Rest of your JSX with updated event handlers */}
      <div className="relative w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-start">

        {/* Left Side - Brand Showcase */}
        <div className="hidden lg:block space-y-8 p-8 sticky top-8">
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Join our community</p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="space-y-4 animate-fade-in-up animation-delay-200">
            <h2 className="text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Create Account
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start your journey with our enterprise dashboard solution.
            </p>
          </div>

          {/* Benefits Cards */}
          <div className="space-y-4 pt-6 animate-fade-in-up animation-delay-400">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Why join us?
            </h3>

            {[
              { icon: Shield, title: "Enterprise Security", desc: "Bank-grade encryption & protection", color: "from-indigo-500 to-indigo-600" },
              { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed & performance", color: "from-purple-500 to-purple-600" },
              { icon: Award, title: "24/7 Support", desc: "Dedicated support team", color: "from-pink-500 to-pink-600" },
              { icon: Briefcase, title: "Free Trial", desc: "14 days free, no credit card", color: "from-blue-500 to-blue-600" },
            ].map((benefit, i) => (
              <div key={i} className="group flex items-start gap-4 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${benefit.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{benefit.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{benefit.desc}</p>
                </div>
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
                "The best decision we made this year. Our productivity increased by 200%."
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold">SA</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">ABC</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">MERN Stack Developer</p>
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500">128</span>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Right Side - Sign Up Form */}
        <div className="relative">
          {uiState.successDemo && (
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl z-20 flex flex-col items-center justify-center animate-scale-up">
              {/* Success animation content */}
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 animate-bounce-in">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Welcome Aboard!</h3>
              <p className="text-white/90">Account created successfully</p>
              <p className="text-white/80 text-sm mt-2">Redirecting to sign in...</p>
            </div>
          )}

          {/* Form Card */}
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">

            {/* Form Header */}
            <div className="relative px-8 pt-8 pb-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <Link href="/Authentication/signin">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Create Account
                    </h2>
                  </Link>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }} className="p-8 space-y-5">

              {/* Error Message */}
              {uiState.error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{uiState.error}</p>
                  </div>
                </div>
              )}

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className={clsx(
                    "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                    uiState.focusedField === 'phone' ? "text-indigo-500" : "text-gray-400"
                  )} />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onFocus={() => setUiState(prev => ({ ...prev, focusedField: 'phone' }))}
                    onBlur={() => setUiState(prev => ({ ...prev, focusedField: null }))}
                    className={clsx(
                      "w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border-2 rounded-xl",
                      "text-gray-900 dark:text-white placeholder-gray-400",
                      "transition-colors duration-200 outline-none",
                      uiState.focusedField === 'phone'
                        ? "border-indigo-500"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    )}
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className={clsx(
                    "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                    uiState.focusedField === 'username' ? "text-indigo-500" : "text-gray-400"
                  )} />
                  <input
                    type="text"
                    name="username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleInputChange}
                    onFocus={() => setUiState(prev => ({ ...prev, focusedField: 'username' }))}
                    onBlur={() => setUiState(prev => ({ ...prev, focusedField: null }))}
                    className={clsx(
                      "w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border-2 rounded-xl",
                      "text-gray-900 dark:text-white placeholder-gray-400",
                      "transition-colors duration-200 outline-none",
                      uiState.focusedField === 'username'
                        ? "border-indigo-500"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    )}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className={clsx(
                    "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                    uiState.focusedField === 'email' ? "text-indigo-500" : "text-gray-400"
                  )} />
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setUiState(prev => ({ ...prev, focusedField: 'email' }))}
                    onBlur={() => setUiState(prev => ({ ...prev, focusedField: null }))}
                    className={clsx(
                      "w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border-2 rounded-xl",
                      "text-gray-900 dark:text-white placeholder-gray-400",
                      "transition-colors duration-200 outline-none",
                      uiState.focusedField === 'email'
                        ? "border-indigo-500"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    )}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className={clsx(
                    "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                    uiState.focusedField === 'password' ? "text-indigo-500" : "text-gray-400"
                  )} />
                  <input
                    type={uiState.showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setUiState(prev => ({ ...prev, focusedField: 'password' }))}
                    onBlur={() => setUiState(prev => ({ ...prev, focusedField: null }))}
                    className={clsx(
                      "w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-900/50 border-2 rounded-xl",
                      "text-gray-900 dark:text-white placeholder-gray-400",
                      "transition-colors duration-200 outline-none",
                      uiState.focusedField === 'password'
                        ? "border-indigo-500"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    )}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setUiState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {uiState.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      <div className={`h-1.5 flex-1 rounded-full ${passwordStrength >= 25 ? getStrengthColor() : 'bg-gray-200'}`} />
                      <div className={`h-1.5 flex-1 rounded-full ${passwordStrength >= 50 ? getStrengthColor() : 'bg-gray-200'}`} />
                      <div className={`h-1.5 flex-1 rounded-full ${passwordStrength >= 75 ? getStrengthColor() : 'bg-gray-200'}`} />
                      <div className={`h-1.5 flex-1 rounded-full ${passwordStrength >= 100 ? getStrengthColor() : 'bg-gray-200'}`} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{passwordFeedback}</p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className={clsx(
                    "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                    uiState.focusedField === 'confirmPassword' ? "text-indigo-500" : "text-gray-400"
                  )} />
                  <input
                    type={uiState.showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={() => setUiState(prev => ({ ...prev, focusedField: 'confirmPassword' }))}
                    onBlur={() => setUiState(prev => ({ ...prev, focusedField: null }))}
                    className={clsx(
                      "w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-900/50 border-2 rounded-xl",
                      "text-gray-900 dark:text-white placeholder-gray-400",
                      "transition-colors duration-200 outline-none",
                      uiState.focusedField === 'confirmPassword'
                        ? "border-indigo-500"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    )}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setUiState(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {uiState.showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={uiState.acceptedTerms}
                  onChange={(e) => setUiState(prev => ({ ...prev, acceptedTerms: e.target.checked }))}
                  className="w-5 h-5 mt-0.5 text-indigo-500 border-2 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <Link href="/terms" className="text-indigo-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-indigo-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uiState.loading || !uiState.acceptedTerms}
                className={clsx(
                  "w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold",
                  "transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                )}
              >
                {uiState.loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create Account
                    <ChevronRight className="w-5 h-5" />
                  </span>
                )}
              </button>

              {/* Sign In Link */}
              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/Authentication/signin" className="text-indigo-600 hover:underline font-medium">
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}