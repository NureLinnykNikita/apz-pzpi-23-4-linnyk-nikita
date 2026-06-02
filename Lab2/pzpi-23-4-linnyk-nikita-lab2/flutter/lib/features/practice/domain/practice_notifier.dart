import 'package:flutter_riverpod/flutter_riverpod.dart';

class SelectedLesson {
  final int lessonId;
  final String title;
  final int courseId;
  final String courseTitle;

  const SelectedLesson({
    required this.lessonId,
    required this.title,
    required this.courseId,
    required this.courseTitle,
  });
}

class PracticeNotifier extends Notifier<SelectedLesson?> {
  @override
  SelectedLesson? build() => null;

  void setLesson(SelectedLesson lesson) => state = lesson;
  void clearLesson() => state = null;
}

final practiceNotifierProvider =
    NotifierProvider<PracticeNotifier, SelectedLesson?>(PracticeNotifier.new);
