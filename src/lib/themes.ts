export type Mood =
  | "Dark"
  | "Romantic"
  | "Sci-Fi"
  | "Mystery"
  | "Adventure"
  | "Fantasy"
  | "Horror"
  | "Comedy"
  | "Drama"
  | "Thriller";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export const moodThemes: Record<Mood, ThemeColors> = {
  Dark: {
    primary: "bg-gray-800 text-white",
    secondary: "bg-gray-700 text-gray-100",
    accent: "bg-purple-600 text-white",
    background: "bg-gray-900",
    text: "text-gray-100",
  },
  Romantic: {
    primary: "bg-pink-600 text-white",
    secondary: "bg-pink-500 text-white",
    accent: "bg-rose-500 text-white",
    background: "bg-pink-50",
    text: "text-gray-800",
  },
  "Sci-Fi": {
    primary: "bg-blue-900 text-white",
    secondary: "bg-blue-800 text-white",
    accent: "bg-cyan-500 text-white",
    background: "bg-slate-900",
    text: "text-blue-100",
  },
  Mystery: {
    primary: "bg-indigo-900 text-white",
    secondary: "bg-indigo-800 text-white",
    accent: "bg-violet-500 text-white",
    background: "bg-slate-800",
    text: "text-indigo-100",
  },
  Adventure: {
    primary: "bg-green-700 text-white",
    secondary: "bg-green-600 text-white",
    accent: "bg-emerald-500 text-white",
    background: "bg-green-50",
    text: "text-gray-800",
  },
  Fantasy: {
    primary: "bg-purple-900 text-white",
    secondary: "bg-purple-800 text-white",
    accent: "bg-fuchsia-500 text-white",
    background: "bg-purple-50",
    text: "text-gray-800",
  },
  Horror: {
    primary: "bg-red-900 text-white",
    secondary: "bg-red-800 text-white",
    accent: "bg-rose-600 text-white",
    background: "bg-red-950",
    text: "text-red-100",
  },
  Comedy: {
    primary: "bg-yellow-500 text-gray-900",
    secondary: "bg-yellow-400 text-gray-900",
    accent: "bg-amber-500 text-white",
    background: "bg-yellow-50",
    text: "text-gray-800",
  },
  Drama: {
    primary: "bg-gray-700 text-white",
    secondary: "bg-gray-600 text-white",
    accent: "bg-gray-500 text-white",
    background: "bg-gray-100",
    text: "text-gray-800",
  },
  Thriller: {
    primary: "bg-slate-900 text-white",
    secondary: "bg-slate-800 text-white",
    accent: "bg-slate-700 text-white",
    background: "bg-slate-950",
    text: "text-slate-100",
  },
};

export const defaultTheme: ThemeColors = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  accent: "bg-accent text-white",
  background: "bg-background",
  text: "text-foreground",
};
