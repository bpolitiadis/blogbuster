import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("ProtectedRoute: Auth state changed", {
      isLoading,
      isAuthenticated,
      pathname,
      currentTime: new Date().toISOString(),
    });

    // Only redirect if we're not already on the login page and not on a 404 page
    if (
      !isLoading &&
      !isAuthenticated &&
      pathname !== "/login" &&
      !pathname.startsWith("/_not-found")
    ) {
      console.log(
        "ProtectedRoute: User not authenticated, redirecting to login"
      );
      // Use replace instead of push to prevent back button from returning to protected route
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    console.log("ProtectedRoute: Loading state");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated");
    return null;
  }

  console.log("ProtectedRoute: Authenticated, rendering children");
  return <>{children}</>;
}
