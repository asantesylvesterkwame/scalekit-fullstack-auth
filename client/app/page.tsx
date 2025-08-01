"use client";

import { useState, useEffect } from "react";
import { Shield, LogIn, Users, Zap, ArrowRight, Loader2 } from "lucide-react";
import AuthService from "@/services/auth.service";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      AuthService.authenticate();
    } catch (error) {
      console.error("Authentication failed:", error);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="flex justify-center">
        <div className="w-full max-w-7xl px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-400" />
              <h1 className="font-bold text-2xl text-white">MyCompany</h1>
            </div>
            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-400 disabled:to-blue-500 px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex justify-center pt-20">
        <div className="w-full max-w-6xl px-6 text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Enterprise Authentication
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Made Simple
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Secure, scalable, and seamless authentication powered by ScaleKit.
              Connect your enterprise identity providers with just a few clicks.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16 mb-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Enterprise Security
              </h3>
              <p className="text-slate-300">
                Built-in compliance with SOC 2, GDPR, and enterprise security
                standards.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                SSO Integration
              </h3>
              <p className="text-slate-300">
                Connect with popular identity providers like Okta, Azure AD, and
                Google Workspace.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Quick Setup
              </h3>
              <p className="text-slate-300">
                Get up and running in minutes with our developer-friendly APIs
                and SDKs.
              </p>
            </div>
          </div>

          <button
            onClick={handleGetStarted}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-400 disabled:to-blue-500 px-12 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-2xl hover:shadow-blue-500/30 flex items-center space-x-3 mx-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authenticating with ScaleKit...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Try Authentication Demo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
