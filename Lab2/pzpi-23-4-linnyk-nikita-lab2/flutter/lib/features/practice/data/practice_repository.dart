import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/course.dart';
import '../../../core/models/exercise.dart';
import '../../../core/models/lesson.dart';
import '../../../core/network/api_error.dart';
import '../../../core/network/dio_client.dart';

class PracticeRepository {
  final Dio _dio;
  PracticeRepository(this._dio);

  Future<List<Course>> getAllCourses() async {
    try {
      final res = await _dio.get('/courses');
      final list = (res.data['courses'] ?? res.data) as List;
      return list
          .map((e) => Course.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<CourseProgress> getCourseProgress(int courseId) async {
    try {
      final res = await _dio.get('/courses/$courseId/progress');
      return CourseProgress.fromJson(
          res.data['courseProgress'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<void> enroll(int courseId) async {
    try {
      await _dio.post('/courses/enrollments',
          data: {'courseId': courseId});
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<void> unenroll(int courseId) async {
    try {
      await _dio.delete('/courses/enrollments/$courseId');
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<List<Exercise>> getLessonExercises(int lessonId) async {
    try {
      final res = await _dio.get('/lessons/$lessonId/exercises');
      final list = (res.data['exercises'] ?? res.data) as List;
      return list
          .map((e) => Exercise.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<ExerciseSubmitResult> submitExercise(
      int exerciseId, String answer) async {
    try {
      final res = await _dio.post('/exercises/$exerciseId/submit',
          data: {'answer': answer});
      return ExerciseSubmitResult.fromJson(
          res.data['submittedExercise'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }
}

final practiceRepositoryProvider = Provider<PracticeRepository>((ref) {
  return PracticeRepository(ref.read(dioProvider));
});

final allCoursesProvider =
    FutureProvider.autoDispose<List<Course>>((ref) {
  return ref.read(practiceRepositoryProvider).getAllCourses();
});

final courseProgressProvider =
    FutureProvider.autoDispose.family<CourseProgress, int>((ref, courseId) {
  return ref.read(practiceRepositoryProvider).getCourseProgress(courseId);
});

final lessonExercisesProvider =
    FutureProvider.autoDispose.family<List<Exercise>, int>((ref, lessonId) {
  return ref.read(practiceRepositoryProvider).getLessonExercises(lessonId);
});
