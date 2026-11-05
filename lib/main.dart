import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'core/theme/app_theme.dart';
import 'features/splash/presentation/splash_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables (.env with OpenAI API keys)
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    debugPrint("Note: .env file not found or empty. Using defaults.");
  }

  // Force landscape orientation on Android TV & Tablets
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);

  runApp(const YivuApp());
}

class YivuApp extends StatelessWidget {
  const YivuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Yivu',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTabletTheme,
      darkTheme: AppTheme.darkTVTheme,
      themeMode: ThemeMode.dark, // Default to high-contrast Dark Navy (#0F172A)
      home: const SplashScreen(),
    );
  }
}

