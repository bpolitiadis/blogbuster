"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Mood, moodThemes, defaultTheme, ThemeColors } from "@/lib/themes";

interface MoodContextType {
  mood: Mood | null;
  setMood: (mood: Mood | null) => void;
  colors: ThemeColors;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export function MoodProvider({ children }: { children: ReactNode }) {
  const [mood, setMood] = useState<Mood | null>(null);

  const colors = mood ? moodThemes[mood] : defaultTheme;

  return (
    <MoodContext.Provider value={{ mood, setMood, colors }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error("useMood must be used within a MoodProvider");
  }
  return context;
}
