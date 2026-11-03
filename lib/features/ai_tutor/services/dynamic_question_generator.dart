import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class DynamicQuestionGenerator {
  final String _apiKey = dotenv.env['OPENAI_API_KEY'] ?? '';
  final String _model = dotenv.env['OPENAI_MODEL'] ?? 'gpt-4o-mini';
  final String _baseUrl = dotenv.env['OPENAI_BASE_URL'] ?? 'https://api.openai.com/v1';

  /// Generates 3-5 syllabus-aligned multiple-choice questions from raw notes
  Future<List<Map<String, dynamic>>> generateQuestionsFromNotes({
    required String division,
    required String gradeKey,
    required String subjectName,
    required String notesContent,
    int count = 3,
  }) async {
    if (_apiKey.isEmpty || _apiKey.startsWith('sk-proj-your')) {
      return [];
    }

    final systemPrompt = '''
You are an expert curriculum test author for the Botswana education system ($division division, $gradeKey).
Subject: $subjectName.

TASK:
Generate exactly $count multiple-choice questions based ONLY on the provided study notes.
Return ONLY valid JSON matching this schema with no markdown backticks, no markdown fence, and no prose:
{
  "questions": [
    {
      "prompt": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Brief explanation why the answer is correct."
    }
  ]
}
''';

    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/chat/completions'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_apiKey',
        },
        body: jsonEncode({
          'model': _model,
          'messages': [
            {'role': 'system', 'content': systemPrompt},
            {'role': 'user', 'content': 'Study Notes:\n$notesContent'},
          ],
          'temperature': 0.5,
          'response_format': {'type': 'json_object'},
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        final rawJson = data['choices'][0]['message']['content'];
        final parsed = jsonDecode(rawJson) as Map<String, dynamic>;
        return List<Map<String, dynamic>>.from(parsed['questions'] ?? []);
      }
    } catch (e) {
      // Fallback on empty list
    }
    return [];
  }
}
