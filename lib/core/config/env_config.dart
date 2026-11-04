import 'package:flutter_dotenv/flutter_dotenv.dart';

class EnvConfig {
  static String get(String key, {String fallback = ''}) {
    if (!dotenv.isInitialized) {
      return fallback;
    }
    return dotenv.env[key] ?? fallback;
  }
}
