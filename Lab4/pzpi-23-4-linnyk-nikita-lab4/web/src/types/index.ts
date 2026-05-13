export type Role = 'user' | 'admin' | 'contentManager' | 'moderator';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type ExerciseType = 'reading' | 'listening' | 'writing' | 'speaking' | 'translation';
export type ExercisePeriod = 'week' | 'month' | 'all';
export type EnrollmentStatus = 'active' | 'completed' | 'canceled';

export interface Language {
  id: number;
  code: string;
  name: string;
}

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  bio: string | null;
  streak: number;
  dailyGoalExercises: number;
  nativeLanguageId: number | null;
  nativeLanguage: Language | null;
  notificationsEnabled: boolean;
  reminderTime: string | null;
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
  dailyGoalExercises: number;
  notificationsEnabled: boolean;
  reminderTime: string | null;
  timezone: string;
}

export interface Course {
  courseId: number;
  title: string;
  description: string | null;
  level: CEFRLevel;
  language: Language;
}

export interface Enrollment {
  courseId: number;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
  completedAt: string | null;
  lastLessonId: number | null;
  course: Course;
}

export interface Lesson {
  lessonId: number;
  courseId: number;
  title: string;
  description: string | null;
  sequence: number;
  createdAt: string;
}

export interface Exercise {
  exerciseId: number;
  lessonId: number;
  type: ExerciseType;
  question: string;
  correctAnswer: string;
  mediaUrl: string | null;
  points: number | null;
  sequence: number;
  metadata: Record<string, unknown> | null;
}

export interface ExerciseSubmitResult {
  isCorrect: boolean;
  earnedPoints: number;
  correctAnswer: string;
}

export interface Achievement {
  achievementId: number;
  code: string;
  title: string;
  description: string;
  category: string;
  iconUrl: string | null;
  conditionType: string;
  conditionValue: number;
}

export interface UserAchievement {
  achievement: Achievement;
  earnedAt: string;
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

export interface Conversation {
  conversationId: string;
  title: string | null;
  isGroup: boolean;
  createdAt: string;
  participants?: UserProfile[];
}

export interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'ai';
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: Pick<UserProfile, 'userId' | 'username' | 'avatarUrl'>;
}

export interface AdminUser {
  userId: string;
  username: string;
  email: string;
  role: Role;
  streak: number;
  createdAt: string;
}

export interface AdminStats {
  usersCount: number;
  coursesCount: number;
  exercisesToday: number;
  messagesTotal: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
