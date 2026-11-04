import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class PastPaperExtractorService {
  final String _apiKey = dotenv.env['OPENAI_API_KEY'] ?? '';
  final String _model = dotenv.env['OPENAI_MODEL'] ?? 'gpt-4o-mini';
  final String _baseUrl = dotenv.env['OPENAI_BASE_URL'] ?? 'https://api.openai.com/v1';

  /// Takes unstructured raw exam or past paper text and extracts individual
  /// questions, options (A,B,C,D), correct answer index, and explanations.
  Future<List<Map<String, dynamic>>> extractQuestionsFromPaperText({
    required String division,
    required String gradeKey,
    required String subjectName,
    required String term,
    required String rawExamText,
  }) async {
    if (_apiKey.isEmpty || _apiKey.startsWith('sk-proj-your')) {
      throw Exception("OpenAI API Key is missing or invalid in your .env configuration.");
    }

    final systemPrompt = '''
You are an expert curriculum digitization engine for the Botswana education system ($division division, $gradeKey, $term).
Subject: $subjectName.

TASK:
Analyze the provided past paper / exam text.
Extract each question individually, identifying:
1. "prompt": The question text.
2. "options": An array of exactly 4 choices [A, B, C, D].
3. "correct_index": The zero-based index of the correct choice (0 for A, 1 for B, 2 for C, 3 for D). If not explicitly marked in an answer key, infer the definitively correct syllabus answer.
4. "explanation": A clear, educational explanation for why this answer is correct, matching the age level of $gradeKey pupils.

Return ONLY a valid JSON object matching this schema with NO markdown fences, NO backticks, and NO prose:
{
  "questions": [
    {
      "prompt": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Why this answer is correct..."
    }
  ]
}
''';

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
          {'role': 'user', 'content': 'Raw Exam Text:\n$rawExamText'},
        ],
        'temperature': 0.2, // Low temperature for high extraction fidelity
        'response_format': {'type': 'json_object'},
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(utf8.decode(response.bodyBytes));
      final rawJson = data['choices'][0]['message']['content'];
      final parsed = jsonDecode(rawJson) as Map<String, dynamic>;
      final list = parsed['questions'] as List<dynamic>? ?? [];
      return list.map((e) => Map<String, dynamic>.from(e)).toList();
    } else {
      throw Exception("AI Extraction failed with status code: ${response.statusCode}");
    }
  }
}

