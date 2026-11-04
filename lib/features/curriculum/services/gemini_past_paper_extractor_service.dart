import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class GeminiPastPaperExtractorService {
  final String _apiKey = dotenv.env['GEMINI_API_KEY'] ?? dotenv.env['OPENAI_API_KEY'] ?? '';
  final String _model = dotenv.env['GEMINI_MODEL'] ?? 'gemini-1.5-flash';

  /// Extracts individual MCQs, options [A,B,C,D], correct index, and explanations
  /// directly using Google Gemini's native JSON output mode.
  Future<List<Map<String, dynamic>>> extractQuestionsFromPaperText({
    required String division,
    required String gradeKey,
    required String subjectName,
    required String term,
    required String rawExamText,
  }) async {
    if (_apiKey.isEmpty || _apiKey.startsWith('your_gemini')) {
      throw Exception("Gemini API Key is missing. Add GEMINI_API_KEY to your .env file!");
    }

    final systemInstruction = '''
You are an expert curriculum test digitizer for the Botswana education system ($division division, $gradeKey, $term).
Subject: $subjectName.

TASK:
Analyze the provided past paper / exam text.
Extract every question individually.
Format the output as a strict JSON object with a single key "questions" containing a list of question objects:
- "prompt": The question text.
- "options": An array of exactly 4 choices [A, B, C, D].
- "correct_index": The zero-based integer index of the correct option (0 for A, 1 for B, 2 for C, 3 for D).
- "explanation": An age-appropriate explanation clarifying why the correct answer is right.
''';

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
              {'text': 'Exam Content to Digitise:\n$rawExamText'}
            ]
          }
        ],
        'generationConfig': {
          'responseMimeType': 'application/json',
          'temperature': 0.1, // Near-deterministic for question extraction
        }
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(utf8.decode(response.bodyBytes));
      final text = data['candidates'][0]['content']['parts'][0]['text'];
      final parsed = jsonDecode(text) as Map<String, dynamic>;
      final list = parsed['questions'] as List<dynamic>? ?? [];
      return list.map((e) => Map<String, dynamic>.from(e)).toList();
    } else {
      throw Exception("Gemini extraction error (${response.statusCode}): ${response.body}");
    }
  }
}
