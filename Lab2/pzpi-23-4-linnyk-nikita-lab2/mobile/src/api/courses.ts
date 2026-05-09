import axios from 'axios';
import Constants from 'expo-constants';
import { apiClient } from './client';
import { Course, CourseProgress, Enrollment, Language, Lesson } from '../types/api';

const BASE_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  'http://10.0.2.2:5000/api';

export const getAllCourses = async () => {
  const { data } = await apiClient.get<{ courses: Course[] }>('/courses');
  return data.courses;
};

export const getAllLanguages = async () => {
  const { data } = await axios.get<{ languages: Language[] }>(`${BASE_URL}/languages`);
  return data.languages;
};

export const enrollInCourse = async (courseId: number) => {
  const { data } = await apiClient.post('/courses/enrollments', { courseId });
  return data;
};

export const getCourseProgress = async (courseId: number) => {
  const { data } = await apiClient.get<{ courseProgress: CourseProgress }>(
    `/courses/${courseId}/progress`
  );
  return data.courseProgress;
};

export const unenrollFromCourse = async (courseId: number) => {
  await apiClient.delete(`/courses/enrollments/${courseId}`);
};

export const getCourseLessons = async (courseId: number) => {
  const { data } = await apiClient.get<{ lessons: Lesson[] }>(
    `/courses/${courseId}/lessons`
  );
  return data.lessons;
};

export const getMyEnrollments = async () => {
  const { data } = await apiClient.get<{ enrollments: Enrollment[] }>('/users/me/enrollments');
  return data.enrollments;
};
