"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import AuthService from "@/services/auth.service";

export default function CallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Check for errors in URL params
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      const code = searchParams.get("code");

      if (errorParam) {
        setError(errorDescription || errorParam);
        setStatus("error");
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      // If no errors, the backend should have handled the authentication
      // and set the session. Redirect to dashboard.
      await AuthService.authCallback(code, error, errorDescription);
      setStatus("success");
      router.push("/dashboard");
    } catch (err) {
      console.error("Callback handling failed:", err);
      setError("Authentication failed");
      setStatus("error");
      setTimeout(() => router.push("/"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full mx-4">
        {status === "loading" && (
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Authentication
            </h2>
            <p className="text-gray-600">
              Please wait while we complete your sign-in...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Successful!
            </h2>
            <p className="text-gray-600">Redirecting to your dashboard...</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-4">
              {error || "An error occurred during authentication"}
            </p>
            <p className="text-sm text-gray-500">Redirecting to home page...</p>
          </div>
        )}
      </div>
    </div>
  );
}
