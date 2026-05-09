import { apiClient } from './client';
import { Exercise, ExerciseSubmitResult } from '../types/api';

export const getLessonExercises = async (lessonId: number) => {
  const { data } = await apiClient.get<{ exercises: Exercise[] }>(
    `/lessons/${lessonId}/exercises`
  );
  return data.exercises;
};

export const submitExercise = async (exerciseId: number, userAnswer: string) => {
  const { data } = await apiClient.post<{ submittedExercise: ExerciseSubmitResult }>(
    `/exercises/${exerciseId}/submit`,
    { answer: userAnswer }
  );
  return data.submittedExercise;
};
