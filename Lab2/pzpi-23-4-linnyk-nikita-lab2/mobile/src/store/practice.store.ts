import { create } from 'zustand';

interface SelectedLesson {
  lessonId: number;
  title: string;
  courseId: number;
  courseTitle: string;
}

interface PracticeState {
  selectedLesson: SelectedLesson | null;
  setLesson: (lesson: SelectedLesson) => void;
  clearLesson: () => void;
}

export const usePracticeStore = create<PracticeState>((set) => ({
  selectedLesson: null,
  setLesson: (lesson) => set({ selectedLesson: lesson }),
  clearLesson: () => set({ selectedLesson: null }),
}));
