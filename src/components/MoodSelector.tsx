"use client";

import { Mood } from "@/lib/themes";
import { useMood } from "@/contexts/MoodContext";
import { Badge } from "./ui/Badge";

const moods: Mood[] = [
  "Dark",
  "Romantic",
  "Sci-Fi",
  "Mystery",
  "Adventure",
  "Fantasy",
  "Horror",
  "Comedy",
  "Drama",
  "Thriller",
];

interface MoodSelectorProps {
  className?: string;
  onSelect?: (mood: Mood | null) => void;
  showClear?: boolean;
}

export function MoodSelector({
  className = "",
  onSelect,
  showClear = true,
}: MoodSelectorProps) {
  const { mood, setMood, colors } = useMood();

  const handleSelect = (selectedMood: Mood) => {
    const newMood = mood === selectedMood ? null : selectedMood;
    setMood(newMood);
    onSelect?.(newMood);
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {showClear && mood && (
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => handleSelect(mood)}
        >
          Clear
        </Badge>
      )}
      {moods.map((m) => (
        <Badge
          key={m}
          variant={mood === m ? "default" : "outline"}
          className={`cursor-pointer ${
            mood === m
              ? `${colors.accent} text-white`
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          onClick={() => handleSelect(m)}
        >
          {m}
        </Badge>
      ))}
    </div>
  );
}
