"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  LogOut,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AuthService, { User } from "@/services/auth.service";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      setIsLoading(true);
      const authResponse = await AuthService.checkAuth();

      if (authResponse.authenticated && authResponse.user) {
        setUser(authResponse.user);
        console.log("Dashboard loaded for user:", authResponse.user.email);
      } else {
        console.log("User not authenticated, redirecting to home...");
        router.push("/");
      }
    } catch (error) {
      console.error("Dashboard authentication check failed:", error);
      setError("Failed to verify authentication. Redirecting to home...");
      setTimeout(() => router.push("/"), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await AuthService.logout();
      // AuthService.logout() handles the redirect
    } catch (error) {
      console.error("Logout failed:", error);
      // Force redirect even if logout fails
      window.location.href = "/";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <div className="flex items-center space-x-3 text-red-700">
            <AlertCircle className="w-6 h-6" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            Please authenticate to access the dashboard.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="font-bold text-2xl text-gray-900">
                MyCompany Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-blue-200"
                  />
                )}
                <div className="text-right">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">
                    {user.organization || user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-300" />
            <h2 className="text-3xl font-bold">
              Welcome back, {user.name.split(" ")[0]}! 🎉
            </h2>
          </div>
          <p className="text-green-100 text-lg">
            You've successfully authenticated using ScaleKit. Your session is
            secure and managed.
          </p>
        </div>

        {/* User Info Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">
              Profile Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-medium text-gray-900 text-sm">{user.id}</p>
              </div>
              {user.emailVerified !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Email Verified</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.emailVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.emailVerified ? "Verified" : "Pending"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Organization</h3>
            <div className="space-y-3">
              {user.organization && (
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium text-gray-900">
                    {user.organization}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Authentication Provider</p>
                <p className="font-medium text-gray-900">ScaleKit SSO</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Session Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active & Secure
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">
              Security Features
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">
                  Token-based Authentication
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">Encrypted Session</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">
                  Auto Token Refresh
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-2">
            🎯 Authentication Demo Complete!
          </h3>
          <p className="text-blue-700">
            This demonstrates a complete ScaleKit authentication flow with
            proper token management, automatic refresh, and secure session
            handling. The user data shown here was retrieved from your ScaleKit
            identity provider after successful authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
