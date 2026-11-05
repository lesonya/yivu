import 'package:flutter/material.dart';
import 'package:yivu/core/theme/app_theme.dart';
import 'package:yivu/shared/widgets/dpad_focusable.dart';
import 'package:yivu/features/quiz/presentation/quiz_runner_screen.dart';

class MaterialsSectionListScreen extends StatelessWidget {
  final String title;
  final String categoryKey; // 'EXAM_PAPERS', 'REVISION_PRACTICE', 'NOTES', 'QUIZZES'
  final Map<String, dynamic> activeChild;
  final Map<String, dynamic> subject;
  final String division;
  final List<Map<String, dynamic>> materials;

  const MaterialsSectionListScreen({
    super.key,
    required this.title,
    required this.categoryKey,
    required this.activeChild,
    required this.subject,
    required this.division,
    required this.materials,
  });

  void _openNotesViewer(BuildContext context, Map<String, dynamic> material) {
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
                material['reading_content'] ?? 'No text notes provided for this unit.',
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

  void _startQuiz(BuildContext context, Map<String, dynamic> material) {
    final questions = List<Map<String, dynamic>>.from(material['questions'] ?? []);
    if (questions.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("No questions configured for this item.")),
      );
      return;
    }

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => QuizRunnerScreen(
          gradeKey: activeChild['grade_key'] ?? 'std_5',
          division: division,
          subjectName: subject['name'],
          materialTitle: material['title'] ?? subject['name'],
          questions: questions,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorHex = subject['accent_color'] as String? ?? '#2563EB';
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
                color: accentColor.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Icons.auto_stories_rounded, color: accentColor, size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "$title — ${subject['name']}",
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Text(
                  "Learner: ${activeChild['display_name']} (${(activeChild['grade_key'] as String).toUpperCase().replaceAll('_', ' ')})",
                  style: const TextStyle(color: Colors.white54, fontSize: 12),
                ),
              ],
            ),
          ],
        ),
      ),
      body: materials.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.inbox_rounded, color: Colors.white30, size: 64),
                  const SizedBox(height: 16),
                  Text(
                    "No $title found for ${(activeChild['grade_key'] as String).toUpperCase().replaceAll('_', ' ')}",
                    style: const TextStyle(color: Colors.white70, fontSize: 16),
                  ),
                ],
              ),
            )
          : SafeArea(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
                itemCount: materials.length,
                separatorBuilder: (_, __) => const SizedBox(height: 16),
                itemBuilder: (context, index) {
                  final mat = materials[index];
                  final isPastPaper = mat['type'] == 'PAST_PAPER_SAMPLE';
                  final questionsCount = (mat['questions'] as List<dynamic>? ?? []).length;
                  final hasNotes = mat['reading_content'] != null && mat['reading_content'].toString().trim().isNotEmpty;

                  return DPadFocusableCard(
                    borderRadius: 22,
                    padding: const EdgeInsets.all(20),
                    backgroundColor: AppTheme.surfaceNavy,
                    onSelect: () {
                      if (categoryKey == 'NOTES') {
                        _openNotesViewer(context, mat);
                      } else {
                        _startQuiz(context, mat);
                      }
                    },
                    child: Row(
                      children: [
                        // Icon indicator
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            color: isPastPaper
                                ? AppTheme.goldStar.withValues(alpha: 0.2)
                                : AppTheme.cobaltBlue.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Icon(
                            isPastPaper ? Icons.assignment_outlined : Icons.menu_book_rounded,
                            color: isPastPaper ? AppTheme.goldStar : AppTheme.tealAccent,
                            size: 26,
                          ),
                        ),
                        const SizedBox(width: 20),

                        // Title & Subtitle details
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
                                          ? AppTheme.goldStar.withValues(alpha: 0.15)
                                          : AppTheme.tealAccent.withValues(alpha: 0.15),
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
                                  if (questionsCount > 0)
                                    Text(
                                      "$questionsCount Questions • +${questionsCount * 10} XP",
                                      style: const TextStyle(color: Colors.white54, fontSize: 13),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                mat['title'] ?? 'Material',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Action Buttons
                        Row(
                          children: [
                            if (hasNotes)
                              Padding(
                                padding: const EdgeInsets.only(right: 12),
                                child: TextButton.icon(
                                  style: TextButton.styleFrom(
                                    foregroundColor: Colors.white70,
                                    backgroundColor: Colors.white10,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                  ),
                                  icon: const Icon(Icons.description_outlined, size: 18),
                                  label: const Text("Read Notes"),
                                  onPressed: () => _openNotesViewer(context, mat),
                                ),
                              ),
                            if (questionsCount > 0)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                                decoration: BoxDecoration(
                                  color: AppTheme.tealAccent,
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: Row(
                                  children: [
                                    Text(
                                      categoryKey == 'QUIZZES' ? "Take Quiz" : "Start Quiz",
                                      style: const TextStyle(
                                        color: Colors.black,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    const Icon(Icons.play_arrow_rounded, color: Colors.black, size: 20),
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

