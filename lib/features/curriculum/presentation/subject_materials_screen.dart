import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/dpad_focusable.dart';
import '../../quiz/presentation/quiz_runner_screen.dart';

class SubjectMaterialsScreen extends StatefulWidget {
  final Map<String, dynamic> activeChild;
  final Map<String, dynamic> subject;
  final String division;

  const SubjectMaterialsScreen({
    super.key,
    required this.activeChild,
    required this.subject,
    required this.division,
  });

  @override
  State<SubjectMaterialsScreen> createState() => _SubjectMaterialsScreenState();
}

class _SubjectMaterialsScreenState extends State<SubjectMaterialsScreen> {
  List<Map<String, dynamic>> _materials = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadMaterials();
  }

  Future<void> _loadMaterials() async {
    try {
      final rawData = await rootBundle.loadString('assets/data/seed_materials.json');
      final parsed = json.decode(rawData) as Map<String, dynamic>;
      final list = parsed['seed_materials'] as List<dynamic>;

      final subjectId = widget.subject['id'];

      // Filter matching current subject (or supply curriculum fallback cards)
      final filtered = list
          .where((m) => m['subject_id'] == subjectId)
          .map((m) => Map<String, dynamic>.from(m))
          .toList();

      // If no pre-compiled sample matches this specific subject yet, generate dynamic topic practice decks
      if (filtered.isEmpty) {
        final topics = (widget.subject['topics'] as List<dynamic>? ?? ['General Revision']);
        for (int i = 0; i < topics.length; i++) {
          filtered.add({
            'id': 'topic_${widget.subject['id']}_$i',
            'grade_key': widget.activeChild['grade_key'] ?? 'std_4',
            'subject_id': subjectId,
            'title': "${topics[i]} — Topic Notes & Practice",
            'type': i % 2 == 0 ? 'NOTES_WITH_MCQ' : 'PAST_PAPER_SAMPLE',
            'reading_content': "Comprehensive revision notes for ${topics[i]} covering core curriculum principles.",
            'questions': [
              {
                'id': 'gen_q1_$i',
                'prompt': "What is the primary rule or principle when studying ${topics[i]}?",
                'options': [
                  "Understand foundational definitions first",
                  "Ignore the syllabus guidance",
                  "Only guess without reading",
                  "Skip straight to the final exam"
                ],
                'correct_index': 0,
                'explanation': "Mastering foundational concepts and syllabus terminology ensures thorough comprehension in ${widget.subject['name']}."
              },
              {
                'id': 'gen_q2_$i',
                'prompt': "Which learning approach yields the highest mastery in this topic?",
                'options': [
                  "Passive memorization",
                  "Active recall and multiple-choice practice",
                  "Reading once without revision",
                  "Skipping practice questions"
                ],
                'correct_index': 1,
                'explanation': "Active recall and testing yourself regularly strengthens long-term memory."
              }
            ]
          });
        }
      }

      setState(() {
        _materials = filtered;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint("Error loading materials: $e");
      setState(() => _isLoading = false);
    }
  }

  void _openNotesViewer(Map<String, dynamic> material) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: AppTheme.surfaceNavy,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Row(
            children: [
              const Icon(Icons.menu_book_rounded, color: AppTheme.tealAccent, size: 26),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  material['title'] ?? 'Study Notes',
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          content: SizedBox(
            width: 600,
            child: SingleChildScrollView(
              child: Text(
                material['reading_content'] ?? 'No text provided.',
                style: const TextStyle(color: Colors.white70, fontSize: 15, height: 1.5),
              ),
            ),
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.tealAccent,
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: () => Navigator.of(context).pop(),
              child: const Text("Done Reading", style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  void _startQuiz(Map<String, dynamic> material) {
    final questions = List<Map<String, dynamic>>.from(material['questions'] ?? []);

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => QuizRunnerScreen(
          gradeKey: widget.activeChild['grade_key'] ?? 'std_4',
          division: widget.division,
          subjectName: widget.subject['name'],
          materialTitle: material['title'] ?? widget.subject['name'],
          questions: questions,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorHex = widget.subject['accent_color'] as String? ?? '#2563EB';
    final accentColor = Color(int.parse(colorHex.replaceAll('#', '0xFF')));

    return Scaffold(
      backgroundColor: AppTheme.darkNavy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: accentColor.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Icons.menu_book, color: accentColor, size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.subject['name'],
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Text(
                  "Learner: ${widget.activeChild['display_name']} (${(widget.activeChild['grade_key'] as String).toUpperCase().replaceAll('_', ' ')})",
                  style: const TextStyle(color: Colors.white54, fontSize: 12),
                ),
              ],
            ),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.tealAccent))
          : SafeArea(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
                itemCount: _materials.length,
                separatorBuilder: (_, __) => const SizedBox(height: 16),
                itemBuilder: (context, index) {
                  final mat = _materials[index];
                  final isPastPaper = mat['type'] == 'PAST_PAPER_SAMPLE';
                  final questionsCount = (mat['questions'] as List<dynamic>? ?? []).length;

                  return DPadFocusableCard(
                    borderRadius: 22,
                    padding: const EdgeInsets.all(20),
                    backgroundColor: AppTheme.surfaceNavy,
                    onSelect: () => _startQuiz(mat),
                    child: Row(
                      children: [
                        // Icon Type Indicator
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            color: isPastPaper
                                ? AppTheme.goldStar.withOpacity(0.2)
                                : AppTheme.cobaltBlue.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Icon(
                            isPastPaper ? Icons.assignment_outlined : Icons.menu_book_rounded,
                            color: isPastPaper ? AppTheme.goldStar : AppTheme.tealAccent,
                            size: 26,
                          ),
                        ),
                        const SizedBox(width: 20),
                        // Titles and Topic summary
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: isPastPaper
                                          ? AppTheme.goldStar.withOpacity(0.15)
                                          : AppTheme.tealAccent.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Text(
                                      isPastPaper ? "PAST PAPER" : "REVISION & PRACTICE",
                                      style: TextStyle(
                                        color: isPastPaper ? AppTheme.goldStar : AppTheme.tealAccent,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 11,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Text(
                                    "$questionsCount Questions • +${questionsCount * 10} XP",
                                    style: const TextStyle(color: Colors.white54, fontSize: 13),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                mat['title'] ?? 'Practice Unit',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Action Buttons: Read Notes vs Take Quiz
                        Row(
                          children: [
                            if (mat['reading_content'] != null)
                              Padding(
                                padding: const EdgeInsets.only(right: 12),
                                child: TextButton.icon(
                                  style: TextButton.styleFrom(
                                    foregroundColor: Colors.white70,
                                    backgroundColor: Colors.white10,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                  ),
                                  icon: const Icon(Icons.description, size: 18),
                                  label: const Text("Read Notes"),
                                  onPressed: () => _openNotesViewer(mat),
                                ),
                              ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                              decoration: BoxDecoration(
                                color: AppTheme.tealAccent,
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: const Row(
                                children: [
                                  Text(
                                    "Start Quiz",
                                    style: TextStyle(
                                      color: Colors.black,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
                                  ),
                                  SizedBox(width: 6),
                                  Icon(Icons.play_arrow_rounded, color: Colors.black, size: 20),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
    );
  }
}
