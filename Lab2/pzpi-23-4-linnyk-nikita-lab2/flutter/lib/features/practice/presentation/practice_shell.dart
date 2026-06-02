import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import 'dialog/ai_dialog_screen.dart';
import 'flashcards/flashcards_screen.dart';
import 'quiz/quiz_screen.dart';

class PracticeShell extends StatelessWidget {
  const PracticeShell({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: Text('Practice', style: AppTextStyles.heading4),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Flashcards'),
              Tab(text: 'Quiz'),
              Tab(text: 'AI Dialog'),
            ],
            labelStyle: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
            unselectedLabelStyle:
                TextStyle(fontWeight: FontWeight.w400, fontSize: 13),
            indicatorWeight: 2,
            dividerColor: AppColors.border,
          ),
        ),
        body: const TabBarView(
          children: [
            FlashcardsScreen(),
            QuizScreen(),
            AiDialogScreen(),
          ],
        ),
      ),
    );
  }
}
