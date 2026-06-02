import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTextStyles {
  AppTextStyles._();

  static TextStyle get _base =>
      GoogleFonts.plusJakartaSans(color: AppColors.text);

  static TextStyle get xs => _base.copyWith(fontSize: 10, height: 1.4);
  static TextStyle get sm => _base.copyWith(fontSize: 12, height: 1.5);
  static TextStyle get md => _base.copyWith(fontSize: 14, height: 1.5);
  static TextStyle get lg => _base.copyWith(fontSize: 16, height: 1.5);
  static TextStyle get xl => _base.copyWith(fontSize: 20, height: 1.4);
  static TextStyle get xxl => _base.copyWith(fontSize: 24, height: 1.3);
  static TextStyle get xxxl => _base.copyWith(fontSize: 32, height: 1.2);

  // Semantic variants
  static TextStyle get heading1 =>
      xxxl.copyWith(fontWeight: FontWeight.w800);
  static TextStyle get heading2 =>
      xxl.copyWith(fontWeight: FontWeight.w700);
  static TextStyle get heading3 =>
      xl.copyWith(fontWeight: FontWeight.w700);
  static TextStyle get heading4 =>
      lg.copyWith(fontWeight: FontWeight.w600);

  static TextStyle get bodyLg => lg.copyWith(fontWeight: FontWeight.w400);
  static TextStyle get bodyMd => md.copyWith(fontWeight: FontWeight.w400);
  static TextStyle get bodySm => sm.copyWith(fontWeight: FontWeight.w400);

  static TextStyle get labelLg =>
      lg.copyWith(fontWeight: FontWeight.w600, letterSpacing: 0.2);
  static TextStyle get labelMd =>
      md.copyWith(fontWeight: FontWeight.w600, letterSpacing: 0.2);
  static TextStyle get labelSm =>
      sm.copyWith(fontWeight: FontWeight.w600, letterSpacing: 0.3);
  static TextStyle get labelXs =>
      xs.copyWith(fontWeight: FontWeight.w700, letterSpacing: 0.5);

  static TextStyle get muted => md.copyWith(color: AppColors.muted);
  static TextStyle get mutedSm => sm.copyWith(color: AppColors.muted);
}
