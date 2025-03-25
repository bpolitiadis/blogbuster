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
    primary: "bg-primary dark:bg-primary-dark",
    secondary: "bg-secondary dark:bg-secondary-dark",
    accent: "bg-accent-dark",
    background: "bg-background-dark",
    text: "text-text-dark",
  },
  Romantic: {
    primary: "bg-primary dark:bg-primary-dark",
    secondary: "bg-secondary dark:bg-secondary-dark",
    accent: "bg-accent-romantic",
    background: "bg-background-light dark:bg-background-dark",
    text: "text-text-light dark:text-text-dark",
  },
  "Sci-Fi": {
    primary: "bg-primary dark:bg-primary-dark",
    secondary: "bg-secondary dark:bg-secondary-dark",
    accent: "bg-accent-sciFi",
    background: "bg-background-light dark:bg-background-dark",
    text: "text-text-light dark:text-text-dark",
  },
  Mystery: {
    primary: "bg-primary dark:bg-primary-dark",
    secondary: "bg-secondary dark:bg-secondary-dark",
    accent: "bg-accent-mystery",
    background: "bg-background-light dark:bg-background-dark",
    text: "text-text-light dark:text-text-dark",
  },
  Adventure: {
    primary: "bg-primary dark:bg-primary-dark",
    secondary: "bg-secondary dark:bg-secondary-dark",
    accent: "bg-accent-adventure",
    background: "bg-background-light dark:bg-background-dark",
    text: "text-text-light dark:text-text-dark",
  },
  Fantasy: {
    primary: "bg-primary dark:bg-primary-dark",
    secondary: "bg-secondary dark:bg-secondary-dark",
    accent: "bg-accent-fantasy",
    background: "bg-background-light dark:bg-background-dark",
    text: "text-text-light dark:text-text-dark",
  },
  Horror: {
    primary: "bg-primary dark:bg-primary-dark",
    secondary: "bg-secondary dark:bg-secondary-dark",
    accent: "bg-accent-horror",
    background: "bg-background-light dark:bg-background-dark",
    text: "text-text-light dark:text-text-dark",
  },
  Comedy: {
    primary: "bg-primary dark:bg-primary-dark",
    secondary: "bg-secondary dark:bg-secondary-dark",
    accent: "bg-accent-comedy",
    background: "bg-background-light dark:bg-background-dark",
    text: "text-text-light dark:text-text-dark",
  },
  Drama: {
    primary: "bg-primary dark:bg-primary-dark",
    secondary: "bg-secondary dark:bg-secondary-dark",
    accent: "bg-accent-drama",
    background: "bg-background-light dark:bg-background-dark",
    text: "text-text-light dark:text-text-dark",
  },
  Thriller: {
    primary: "bg-primary dark:bg-primary-dark",
    secondary: "bg-secondary dark:bg-secondary-dark",
    accent: "bg-accent-thriller",
    background: "bg-background-light dark:bg-background-dark",
    text: "text-text-light dark:text-text-dark",
  },
};

export const defaultTheme: ThemeColors = {
  primary: "bg-primary dark:bg-primary-dark",
  secondary: "bg-secondary dark:bg-secondary-dark",
  accent: "bg-accent-dark",
  background: "bg-background-light dark:bg-background-dark",
  text: "text-text-light dark:text-text-dark",
};
