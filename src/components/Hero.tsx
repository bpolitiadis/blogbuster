import { Button } from "./ui/Button";
import Link from "next/link";
import { useMood } from "@/contexts/MoodContext";

export function Hero() {
  const { mood } = useMood();

  // Dynamic gradient classes based on mood
  const gradientClasses = {
    default: "from-primary to-secondary",
    Dark: "from-accent-dark to-gray-800",
    Romantic: "from-accent-romantic to-accent-sciFi",
    "Sci-Fi": "from-accent-sciFi to-accent-mystery",
    Mystery: "from-accent-mystery to-accent-adventure",
    Adventure: "from-accent-adventure to-accent-fantasy",
    Fantasy: "from-accent-fantasy to-accent-horror",
    Horror: "from-accent-horror to-accent-comedy",
    Comedy: "from-accent-comedy to-accent-drama",
    Drama: "from-accent-drama to-accent-thriller",
    Thriller: "from-accent-thriller to-accent-romantic",
  };

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r ${
        gradientClasses[mood || "default"]
      } py-24 transition-all duration-500`}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Welcome to BlogBuster
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
            Share your thoughts, engage in debates, and connect with other
            writers in a dynamic blogging platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              asChild
              className="bg-surface-light hover:bg-surface-light/90 text-text-light dark:bg-surface-dark dark:hover:bg-surface-dark/90 dark:text-text-dark"
            >
              <Link href="/create">Create Your First Post</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-white text-white hover:bg-white/10"
            >
              <Link href="/posts">Explore Posts</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
