import { useMemo } from "react";
import { Mood, moodThemes, defaultTheme, ThemeColors } from "@/lib/themes";

export function useTheme(mood?: Mood): ThemeColors {
  return useMemo(() => {
    if (!mood) return defaultTheme;
    return moodThemes[mood];
  }, [mood]);
}
