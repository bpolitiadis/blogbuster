"use client";

import { useAuth } from "@/features/auth/AuthContext";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl py-12">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <Avatar
                fallback={user?.username}
                size="lg"
                className="border-4 border-white shadow-md"
              />
              <div>
                <h1 className="text-3xl font-bold">{user?.username}</h1>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <h2 className="mb-4 font-semibold">Experience Points</h2>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">{user?.xp || 0}</div>
                  <div className="text-gray-500">XP</div>
                </div>
                <div className="mt-4">
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${Math.min(
                          (((user?.xp || 0) % 100) / 100) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {100 - ((user?.xp || 0) % 100)} XP until next level
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h2 className="mb-4 font-semibold">Badges</h2>
                {user?.badges && user.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.badges.map((badge) => (
                      <Badge key={badge} variant="secondary">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    You haven't earned any badges yet. Start posting and
                    commenting to earn badges!
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 font-semibold">Account Settings</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-500">
                      Receive emails about new comments on your posts
                    </p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                    <span className="absolute h-4 w-4 translate-x-1 rounded-full bg-white transition"></span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">Profile Visibility</h3>
                    <p className="text-sm text-gray-500">
                      Make your profile visible to other users
                    </p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                    <span className="absolute h-4 w-4 translate-x-6 rounded-full bg-white transition"></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={handleLogout}
                isLoading={isLoading}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
