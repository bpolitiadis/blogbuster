"use client";

import { useState } from "react";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  xp: number;
  level: number;
  badges: string[];
}

interface Activity {
  id: string;
  type: "post" | "comment" | "debate";
  title: string;
  description: string;
  timestamp: string;
}

interface ProfileDashboardProps {
  user: User;
  activities: Activity[];
  onUpdateProfile: (data: { bio?: string }) => Promise<void>;
}

export function ProfileDashboard({
  user,
  activities,
  onUpdateProfile,
}: ProfileDashboardProps) {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState(user.bio || "");

  const handleUpdateBio = async () => {
    await onUpdateProfile({ bio });
    setIsEditingBio(false);
  };

  const xpForNextLevel = user.level * 100;
  const xpProgress = (user.xp % 100) / 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* User Info Card */}
      <div className="rounded-xl bg-surface-light dark:bg-surface-dark shadow-xl p-6 mb-8">
        <div className="flex items-start gap-6">
          <Avatar fallback={user.username} size="lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
              {user.username}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Level {user.level}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user.xp} / {xpForNextLevel} XP
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-primary dark:bg-primary-dark"
                />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </h3>
              {isEditingBio ? (
                <div className="space-y-2">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateBio}>Save</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBio(user.bio || "");
                        setIsEditingBio(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <p className="text-gray-600 dark:text-gray-400">
                    {user.bio || "No bio yet"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingBio(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.badges.map((badge) => (
                  <Badge key={badge} variant="secondary">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <Disclosure defaultOpen>
        {({ open }) => (
          <div className="rounded-xl bg-surface-light dark:bg-surface-dark shadow-xl p-6 mb-8">
            <Disclosure.Button className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring focus-visible:ring-primary">
              <h2 className="text-xl font-semibold">Settings</h2>
              {open ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </Disclosure.Button>

            <Disclosure.Panel className="mt-4 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </h3>
                <ThemeToggle />
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accessibility
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      High contrast mode
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Reduced motion
                    </span>
                  </label>
                </div>
              </div>
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>

      {/* Activity Feed */}
      <div className="rounded-xl bg-surface-light dark:bg-surface-dark shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-8 pb-6 last:pb-0"
            >
              <div className="absolute left-0 top-0 h-full w-px bg-gray-200 dark:bg-gray-700" />
              <div className="absolute left-0 top-0 h-4 w-4 rounded-full bg-primary dark:bg-primary-dark" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-medium text-text-light dark:text-text-dark">
                  {activity.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
