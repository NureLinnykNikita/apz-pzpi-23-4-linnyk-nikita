import { api } from './client';
import type {
  UserProfile, UserStats, UserSettings, Course, Enrollment,
  Lesson, Exercise, ExerciseSubmitResult, Achievement, UserAchievement,
  LeaderboardEntry, Conversation, Message, Language,
  AdminUser, AdminStats, PaginatedResponse, Role, CEFRLevel, ExercisePeriod
} from '../types';

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; user: UserProfile }>('/login', { email, password }),
  register: (username: string, email: string, password: string) =>
    api.post<{ accessToken: string; user: UserProfile }>('/register', { username, email, password }),
  logout: () => api.post('/logout'),
  requestReset: (email: string) => api.post('/password-reset/request', { email }),
  verifyReset: (email: string, code: string) =>
    api.post<{ resetToken: string }>('/password-reset/verify', { email, code }),
  confirmReset: (resetToken: string, newPassword: string) =>
    api.post('/password-reset/confirm', { resetToken, newPassword }),
};

// Users
export const usersApi = {
  getMe: () => api.get<{ user: UserProfile }>('/users/me'),
  updateMe: (data: Partial<Pick<UserProfile, 'username' | 'email' | 'bio' | 'nativeLanguageId'>>) =>
    api.patch<{ user: UserProfile }>('/users/me', data),
  getMyStats: () => api.get<{ userStats: UserStats }>('/users/me/stats'),
  getMyEnrollments: () => api.get<{ enrollments: Enrollment[] }>('/users/me/enrollments'),
  getMySettings: () => api.get<{ settings: UserSettings }>('/users/me/settings'),
  updateMySettings: (data: Partial<UserSettings>) => api.patch<{ settings: UserSettings }>('/users/me/settings', data),
  completeOnboarding: (data: { nativeLanguageId: number; dailyGoalExercises?: number }) =>
    api.patch<{ user: UserProfile }>('/users/me/onboarding', data),
  getUserAchievements: (userId: string) =>
    api.get<{ userAchievements: UserAchievement[] }>(`/users/${userId}/achievements`),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/users/me/password', { currentPassword, newPassword }),
  deleteMe: () => api.delete('/users/me'),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ url: string }>('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Courses
export const coursesApi = {
  getAll: () => api.get<{ courses: Course[] }>('/courses'),
  create: (data: { title: string; description?: string; level: CEFRLevel; targetLanguageId: number }) =>
    api.post<Course>('/courses', data),
  update: (courseId: number, data: Partial<{ title: string; description: string; level: CEFRLevel }>) =>
    api.patch<Course>(`/courses/${courseId}`, data),
  delete: (courseId: number) => api.delete(`/courses/${courseId}`),
  enroll: (courseId: number) => api.post('/courses/enrollments', { courseId }),
  unenroll: (courseId: number) => api.delete(`/courses/enrollments/${courseId}`),
  getProgress: (courseId: number) =>
    api.get<{ progress: number; completedLessons: number; totalLessons: number }>(
      `/courses/${courseId}/progress`
    ),
  getLessons: (courseId: number) => api.get<{ lessons: Lesson[] }>(`/courses/${courseId}/lessons`),
};

// Lessons
export const lessonsApi = {
  create: (data: { courseId: number; title: string; description?: string; sequence: number }) =>
    api.post<Lesson>('/lessons', data),
  update: (lessonId: number, data: Partial<{ title: string; description: string; sequence: number }>) =>
    api.patch<Lesson>(`/lessons/${lessonId}`, data),
  delete: (lessonId: number) => api.delete(`/lessons/${lessonId}`),
  getExercises: (lessonId: number) => api.get<{ exercises: Exercise[] }>(`/lessons/${lessonId}/exercises`),
};

// Exercises
export const exercisesApi = {
  create: (data: {
    lessonId: number; type: string; question: string;
    correctAnswer: string; points?: number; sequence?: number; mediaUrl?: string;
  }) => api.post<Exercise>('/exercises', data),
  update: (exerciseId: number, data: Partial<Exercise>) =>
    api.patch<Exercise>(`/exercises/${exerciseId}`, data),
  delete: (exerciseId: number) => api.delete(`/exercises/${exerciseId}`),
  submit: (exerciseId: number, userAnswer: string) =>
    api.post<{ submittedExercise: ExerciseSubmitResult }>(`/exercises/${exerciseId}/submit`, { answer: userAnswer }),
};

// Languages
export const languagesApi = {
  getAll: () => api.get<{ languages: Language[] }>('/languages'),
  create: (data: { code: string; name: string }) => api.post<Language>('/languages', data),
  update: (id: number, data: Partial<{ code: string; name: string }>) =>
    api.patch<Language>(`/languages/${id}`, data),
  delete: (id: number) => api.delete(`/languages/${id}`),
};

// Achievements
export const achievementsApi = {
  getAll: () => api.get<{ achievements: Achievement[] }>('/achievements'),
  create: (data: {
    code: string; title: string; description: string;
    category: string; conditionType: string; conditionValue: number;
  }) => api.post<Achievement>('/achievements', data),
  update: (id: number, data: Partial<Achievement>) => api.patch<Achievement>(`/achievements/${id}`, data),
  delete: (id: number) => api.delete(`/achievements/${id}`),
  grant: (userId: string, achievementId: number) =>
    api.post(`/users/${userId}/achievements/${achievementId}`),
};

// Leaderboard
export const leaderboardApi = {
  get: (params: { period: ExercisePeriod; languageId?: number; limit?: number }) =>
    api.get<{ entries: LeaderboardEntry[]; currentUserRow: LeaderboardEntry | null }>('/leaderboard', { params }),
};

// Chat
export const chatApi = {
  createConversation: (data: { title?: string; participantIds?: string[] }) =>
    api.post<Conversation>('/conversations', data),
  getMessages: (conversationId: string, params?: { limit?: number; before?: string }) =>
    api.get<{ messages: Message[] }>(`/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId: string, content: string) =>
    api.post<Message>(`/conversations/${conversationId}/messages`, { content }),
  deleteMessage: (conversationId: string, messageId: string) =>
    api.delete(`/conversations/${conversationId}/messages/${messageId}`),
};

// Admin
export const adminApi = {
  getUsers: (params: { search?: string; role?: Role; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<AdminUser>>('/admin/users', { params }),
  updateUser: (userId: string, data: { role: Role }) =>
    api.patch(`/admin/users/${userId}`, data),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  getStats: () => api.get<AdminStats>('/admin/stats'),
  exportData: () => api.get('/admin/export', { responseType: 'blob' }),
  importData: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/admin/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
