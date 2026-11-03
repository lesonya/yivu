import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ChatGPTService {
  final String _apiKey = dotenv.env['OPENAI_API_KEY'] ?? '';
  final String _model = dotenv.env['OPENAI_MODEL'] ?? 'gpt-4o-mini';
  final String _baseUrl = dotenv.env['OPENAI_BASE_URL'] ?? 'https://api.openai.com/v1';

  /// Generates age-appropriate explanation for quiz review
  Future<String> explainMistake({
    required String division,
    required String gradeKey,
    required String subjectName,
    required String questionPrompt,
    required String selectedOption,
    required String correctOption,
  }) async {
    if (_apiKey.isEmpty || _apiKey.startsWith('sk-proj-your')) {
      return "Tip: Set your OpenAI API key in .env to unlock AI Tutor explanations!";
    }

    final isStandard = division.toLowerCase() == 'standard';

    final systemPrompt = isStandard
        ? '''
You are "Yivu", an energetic, warm, and friendly animated mascot tutor for a primary school pupil ($gradeKey) in Botswana.
Subject: $subjectName.
Rules:
- Speak simply, like a kind cartoon mentor.
- Use fun animal analogies or everyday examples.
- Keep the response short (maximum 2 to 3 sentences).
- End with an encouraging cheer!
'''
        : '''
You are "Yivu", an encouraging academic mentor for a junior secondary student ($gradeKey) in Botswana.
Subject: $subjectName.
Rules:
- Give a concise, structured breakdown of the core concept.
- Clearly state why the student's chosen answer was incorrect, without being condescending.
- Keep the response under 100 words.
''';

    final userPrompt = '''
Question: $questionPrompt
The student chose: "$selectedOption"
The correct answer is: "$correctOption"

Provide an age-appropriate explanation for why the correct answer is right and clarify the misconception.
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
            {'role': 'user', 'content': userPrompt},
          ],
          'temperature': 0.7,
          'max_tokens': 200,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        return data['choices'][0]['message']['content'].toString().trim();
      } else {
        return "Yivu is taking a quick nap! Please try again in a moment. (${response.statusCode})";
      }
    } catch (e) {
      return "Could not connect to AI Tutor. Check your internet connection!";
    }
  }
}

