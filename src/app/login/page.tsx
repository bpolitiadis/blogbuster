"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/features/auth/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted");

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Attempting login...");
      await login(formData.email, formData.password);
      console.log("Login successful, waiting for auth state to update...");

      // Add a small delay to ensure auth state is updated
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("Login successful, attempting redirect...");
      // Use replace instead of push to prevent back button from returning to login
      router.replace("/");

      // Add a fallback redirect in case the first one fails
      setTimeout(() => {
        console.log("Fallback redirect attempt...");
        router.replace("/");
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        submit: error instanceof Error ? error.message : "Login failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          success={Boolean(formData.email && !errors.email)}
          required
        />

        <PasswordInput
          label="Password"
          value={formData.password}
          onChange={(value) => setFormData({ ...formData, password: value })}
          error={errors.password}
          success={Boolean(formData.password && !errors.password)}
          required
        />

        {errors.submit && (
          <div className="text-sm text-red-500 dark:text-red-400">
            {errors.submit}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary-dark dark:text-primary-dark dark:hover:text-primary"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign in
        </Button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary hover:text-primary-dark dark:text-primary-dark dark:hover:text-primary"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
