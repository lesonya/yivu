import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:yivu/core/config/env_config.dart';

class GeminiTutorService {
  String get _apiKey => EnvConfig.get('GEMINI_API_KEY', fallback: EnvConfig.get('OPENAI_API_KEY'));
  String get _model => EnvConfig.get('GEMINI_MODEL', fallback: 'gemini-1.5-flash');

  /// Age-adaptive mistake explanation powered by Google Gemini
  Future<String> explainMistake({
    required String division,
    required String gradeKey,
    required String subjectName,
    required String questionPrompt,
    required String selectedOption,
    required String correctOption,
  }) async {
    if (_apiKey.isEmpty || _apiKey.startsWith('your_gemini')) {
      return "Tip: Add your free Gemini API key to .env to unlock Yivu AI Tutor explanations!";
    }

    final isStandard = division.toLowerCase() == 'standard';

    final systemInstruction = isStandard
        ? '''
You are "Yivu", a joyful, warm animated mascot tutor for a primary school learner ($gradeKey) in Botswana.
Subject: $subjectName.
Rules:
- Speak warmly and simply like a cartoon mentor.
- Use fun animal analogies or real-world examples from Botswana.
- Maximum 2-3 sentences.
- End with a cheerful encouragement!
'''
        : '''
You are "Yivu", an encouraging academic coach for a junior secondary student ($gradeKey) in Botswana.
Subject: $subjectName.
Rules:
- Give a concise, structured explanation of the core concept.
- Highlight the exact reason why the selected option was mistaken.
- Keep the response strictly under 90 words.
''';

    final userPrompt = '''
Question: $questionPrompt
The student chose: "$selectedOption"
The correct answer is: "$correctOption"

Explain kindly why "$correctOption" is correct and resolve the misconception.
''';

    try {
      final url = Uri.parse(
        'https://generativelanguage.googleapis.com/v1beta/models/$_model:generateContent?key=$_apiKey',
      );

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'system_instruction': {
            'parts': [
              {'text': systemInstruction}
            ]
          },
          'contents': [
            {
              'parts': [
                {'text': userPrompt}
              ]
            }
          ],
          'generationConfig': {
            'temperature': 0.7,
            'maxOutputTokens': 250,
          }
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        final text = data['candidates'][0]['content']['parts'][0]['text'];
        return text.toString().trim();
      } else {
        debugPrint("Gemini Tutor error: ${response.statusCode} - ${response.body}");
        return "Yivu is resting! Try again in a moment (${response.statusCode}).";
      }
    } catch (e) {
      return "Could not connect to Gemini AI Tutor. Check your internet connection!";
    }
  }
}

