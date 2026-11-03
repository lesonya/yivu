import 'package:flutter/material.dart';

class AppTheme {
  // Brand colors from /resources/img/branding.png
  static const Color cobaltBlue = Color(0xFF2563EB);
  static const Color tealAccent = Color(0xFF14B8A6);
  static const Color darkNavy = Color(0xFF0F172A);
  static const Color surfaceNavy = Color(0xFF1E293B);
  static const Color lightBackground = Color(0xFFF8FAFC);
  
  // Gamification Palette
  static const Color goldStar = Color(0xFFFBBF24);
  static const Color xpPurple = Color(0xFF8B5CF6);
  static const Color successGreen = Color(0xFF10B981);
  static const Color errorCoral = Color(0xFFEF4444);

  static ThemeData get darkTVTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: darkNavy,
      primaryColor: cobaltBlue,
      colorScheme: const ColorScheme.dark(
        primary: cobaltBlue,
        secondary: tealAccent,
        surface: surfaceNavy,
      ),
      fontFamily: 'Nunito',
      cardTheme: CardTheme(
        color: surfaceNavy,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
      ),
    );
  }

  static ThemeData get lightTabletTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: lightBackground,
      primaryColor: cobaltBlue,
      colorScheme: const ColorScheme.light(
        primary: cobaltBlue,
        secondary: tealAccent,
        surface: Colors.white,
      ),
      fontFamily: 'Nunito',
      cardTheme: CardTheme(
        color: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
      ),
    );
  }
}

