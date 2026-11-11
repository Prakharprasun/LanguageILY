export type Course = {
  id: number;
  language_code: string;
  title: string;
  flag_src: string;
  speech_locale?: string;
  unit_count?: number;
};

export type WeekActivityDay = {
  date: string;
  active: boolean;
};

export type UserSettings = {
  sound_effects: boolean;
  animations: boolean;
  motivational_messages: boolean;
  listening_exercises: boolean;
};

export type UserSummary = {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
  created_at: string;
  course: Course | null;
  hearts: number;
  max_hearts: number;
  next_heart_at: string | null;
  gems: number;
  streak: number;
  longest_streak: number;
  streak_freezes: number;
  extended_today: boolean;
  week_activity: WeekActivityDay[];
  total_xp: number;
  today_xp: number;
  daily_goal_xp: number;
  daily_goal_options: Record<string, number>;
  settings: UserSettings;
  today: string;
  now: string;
};

export type SkillNode = {
  id: number;
  title: string;
  icon: string;
  position: number;
  state: "completed" | "active" | "locked";
  lessons_total: number;
  lessons_completed: number;
  next_lesson_id: number | null;
  next_lesson_xp: number | null;
  lesson_ids: number[];
};

export type UnitNode = {
  id: number;
  position: number;
  section: number;
  title: string;
  description: string;
  color: string;
  state: "completed" | "active" | "locked";
  skills: SkillNode[];
};

export type LearningPath = {
  course: {
    id: number;
    title: string;
    language_code?: string;
    flag_src: string;
    speech_locale?: string;
  };
  units: UnitNode[];
  active_skill_id: number | null;
  active_lesson_id: number | null;
};

export type Guidebook = {
  unit: {
    id: number;
    title: string;
    description: string;
    color: string;
    position: number;
  };
  sections: {
    skill: string;
    phrases: { term: string; translation: string; audio_src: string | null }[];
  }[];
};

export type ExerciseType =
  | "MULTIPLE_CHOICE"
  | "TRANSLATE"
  | "MATCH_PAIRS"
  | "FILL_BLANK"
  | "TYPE_ANSWER";

export type ExerciseOption = {
  id: number;
  text: string;
  image_src?: string | null;
  audio_src?: string | null;
};

export type ExerciseHint = {
  text: string;
  hint: string | null;
};

export type Exercise = {
  id: number;
  type: ExerciseType;
  prompt: string;
  prompt_lang: "target" | "source";
  translation?: string | null;
  hints: ExerciseHint[];
  options: ExerciseOption[];
  tiles: { id: number; text: string }[];
  pairs: {
    left: { id: number; text: string; audio_src?: string | null }[];
    right: { id: number; text: string }[];
  } | null;
};

export type SessionStartPayload = {
  session: {
    id: number;
    mode: "lesson" | "practice";
    lesson_id: number | null;
    lesson_position: number | null;
    skill_id: number | null;
    skill_title: string;
    unit_color: string;
    course_title?: string;
  };
  exercises: Exercise[];
  hearts: number;
  max_hearts: number;
  speech_locale: string;
};

export type AnswerResponse = {
  correct: boolean;
  note: string | null;
  solution: string;
  hearts: number;
  session_status: "active" | "completed" | "failed";
};

export type SessionCompleteResponse = {
  xp_earned: number;
  base_xp: number;
  bonus_xp: number;
  mistakes: number;
  accuracy: number;
  duration_seconds: number;
  streak: number;
  streak_extended: boolean;
  hearts: number;
  today_xp: number;
  daily_goal_xp: number;
  daily_goal_reached_now: boolean;
  week_activity: WeekActivityDay[];
  skill_completed: boolean;
  achievements_unlocked: {
    family: string;
    title: string;
    level: number;
    description: string;
    color: string;
  }[];
  quests_completed: { title: string; gem_reward: number }[];
  gems: number;
};

export type LeaderboardEntry = {
  rank: number;
  user_id: number;
  display_name: string;
  username: string;
  avatar_color: string;
  xp: number;
  zone: "promotion" | "safe" | "demotion";
  is_current_user: boolean;
};

export type LeaderboardData = {
  league: string;
  week_start: string;
  days_left: number;
  promotion_spots: number;
  demotion_spots: number;
  entries: LeaderboardEntry[];
};

export type QuestItem = {
  code: string;
  title: string;
  metric: string;
  progress: number;
  target: number;
  gem_reward: number;
  completed: boolean;
  rewarded: boolean;
};

export type ShopItem = {
  id: "refill_hearts" | "streak_freeze";
  section: string;
  title: string;
  description: string;
  cost: number;
  available: boolean;
  status: string | null;
};

export type ShopCatalog = {
  gems: number;
  items: ShopItem[];
};

export type AchievementCard = {
  family: string;
  title: string;
  description: string;
  color: string;
  level: number;
  max_level: number;
  progress: number;
  target: number;
  completed: boolean;
};

export type UserProfile = {
  id: number;
  display_name: string;
  username: string;
  avatar_color: string;
  created_at: string;
  courses: { title: string; flag_src: string }[];
  stats: {
    streak: number;
    longest_streak: number;
    total_xp: number;
    league: string;
    league_rank: number;
    lessons_completed: number;
    perfect_lessons: number;
    skills_completed: number;
    words_learned: number;
  };
  achievements: AchievementCard[];
  weekly_xp: { date: string; xp: number }[];
};

export type UserListItem = {
  id: number;
  display_name: string;
  username: string;
  avatar_color: string;
};

function getStoredUserId(): string {
  if (typeof window === "undefined") return "1";
  return window.localStorage.getItem("duolingo_user_id") || "1";
}

export function setStoredUserId(id: number): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("duolingo_user_id", String(id));
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-User-Id": getStoredUserId(),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(path, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let code = "error";
    try {
      const errBody = await res.json();
      if (errBody?.error) {
        message = errBody.error.message || message;
        code = errBody.error.code || code;
      } else if (errBody?.detail) {
        message =
          typeof errBody.detail === "string"
            ? errBody.detail
            : JSON.stringify(errBody.detail);
      }
    } catch {
      // ignore json parse error
    }
    const err = new Error(message) as Error & { code?: string; status?: number };
    err.code = code;
    err.status = res.status;
    throw err;
  }

  return res.json() as Promise<T>;
}

export function speakText(text: string, locale = "es-ES") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  } catch {
    // ignore speech errors
  }
}

