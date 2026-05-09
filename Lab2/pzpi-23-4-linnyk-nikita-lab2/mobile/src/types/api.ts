export interface Language {
  id: number;
  code: string;
  name: string;
}

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  bio: string | null;
  streak: number;
  dailyGoalMinutes: number;
  nativeLanguage: Language | null;
  createdAt: string;
}

export interface UserStats {
  totalPoints: number;
  exercisesCompleted: number;
  correctAnswersRate: number;
  coursesEnrolled: number;
  achievementsCount: number;
  streak: number;
  todayExercises: number;
  dailyGoal: number;
}

export interface UserSettings {
  dailyGoalMinutes: number;
  notificationsEnabled: boolean;
  reminderTime: string | null;
}

export interface Course {
  courseId: number;
  title: string;
  description: string | null;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  language: Language;
}

export interface Enrollment {
  courseId: number;
  status: string;
  progress: number;
  enrolledAt: string;
  completedAt: string | null;
  course: Course;
}

export interface Lesson {
  lessonId: number;
  courseId: number;
  title: string;
  description: string | null;
  sequence: number;
}

export interface LessonProgress {
  lessonId: number;
  title: string;
  sequence: number;
  totalExercises: number;
  completedExercises: number;
  isCompleted: boolean;
  progressPercent: number;
}

export interface CourseProgress {
  courseId: number;
  title: string;
  totalProgress: number;
  lessons: LessonProgress[];
}

export interface Exercise {
  exerciseId: number;
  lessonId: number;
  type: 'reading' | 'listening' | 'writing' | 'speaking' | 'translation';
  question: string;
  points: number | null;
  sequence: number;
  metadata: Record<string, unknown> | null;
}

export interface ExerciseSubmitResult {
  exerciseId: number;
  userId: string;
  isCorrect: boolean;
  earnedPoints: number;
  attemptNumber: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  streak: number;
  totalPoints: number;
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  currentUserRow: LeaderboardEntry | null;
}

export interface Achievement {
  achievementId: number;
  code: string;
  title: string;
  description: string;
  iconUrl: string | null;
  earnedAt: string | null;
}

export interface Message {
  messageId: string;
  conversationId: string;
  senderType: 'user' | 'ai';
  senderId: string | null;
  content: string;
  createdAt: string;
}

export interface Conversation {
  conversationId: string;
  title: string | null;
  isGroup: boolean;
  createdAt: string;
}
