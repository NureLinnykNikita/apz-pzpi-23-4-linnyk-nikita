import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';

class AppShell extends StatelessWidget {
  final StatefulNavigationShell shell;
  const AppShell({super.key, required this.shell});

  static const _tabs = [
    _TabItem(icon: Icons.home_outlined, activeIcon: Icons.home, label: 'Home'),
    _TabItem(
        icon: Icons.book_outlined,
        activeIcon: Icons.book,
        label: 'Practice'),
    _TabItem(
        icon: Icons.leaderboard_outlined,
        activeIcon: Icons.leaderboard,
        label: 'Ranks'),
    _TabItem(
        icon: Icons.person_outline,
        activeIcon: Icons.person,
        label: 'Profile'),
    _TabItem(
        icon: Icons.settings_outlined,
        activeIcon: Icons.settings,
        label: 'Settings'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: shell,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppColors.panelDeep,
          border: Border(top: BorderSide(color: AppColors.border, width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: shell.currentIndex,
          onTap: (i) => shell.goBranch(
            i,
            initialLocation: i == shell.currentIndex,
          ),
          items: _tabs
              .asMap()
              .entries
              .map((e) => BottomNavigationBarItem(
                    icon: Icon(e.value.icon),
                    activeIcon: Icon(e.value.activeIcon,
                        color: AppColors.accent),
                    label: e.value.label,
                  ))
              .toList(),
          selectedLabelStyle: AppTextStyles.xs
              .copyWith(fontWeight: FontWeight.w600, color: AppColors.accent),
          unselectedLabelStyle:
              AppTextStyles.xs.copyWith(color: AppColors.muted),
        ),
      ),
    );
  }
}

class _TabItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  const _TabItem(
      {required this.icon,
      required this.activeIcon,
      required this.label});
}
