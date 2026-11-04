import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:yivu/core/theme/app_theme.dart';
import 'package:yivu/shared/widgets/dpad_focusable.dart';
import 'materials_section_list_screen.dart';

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
  List<Map<String, dynamic>> _allMaterials = [];
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

      // Filter matching current subject
      final filtered = list
          .where((m) => m['subject_id'] == subjectId)
          .map((m) => Map<String, dynamic>.from(m))
          .toList();

      // If no pre-compiled items exist for this subject, generate fallback decks
      if (filtered.isEmpty) {
        final topics = (widget.subject['topics'] as List<dynamic>? ?? ['General Revision', 'Core Principles']);
        for (int i = 0; i < topics.length; i++) {
          filtered.add({
            'id': 'topic_${widget.subject['id']}_$i',
            'grade_key': widget.activeChild['grade_key'] ?? 'std_5',
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
        _allMaterials = filtered;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint("Error loading materials: $e");
      setState(() => _isLoading = false);
    }
  }

  // Filter materials for Exam Papers
  List<Map<String, dynamic>> get _examPapers {
    return _allMaterials.where((m) {
      final t = (m['type'] as String? ?? '').toUpperCase();
      return t.contains('PAST_PAPER') || (m['title'] as String? ?? '').toLowerCase().contains('exam') || (m['title'] as String? ?? '').toLowerCase().contains('paper');
    }).toList();
  }

  // Filter materials for Revision & Practice
  List<Map<String, dynamic>> get _revisionAndPractice {
    return _allMaterials.where((m) {
      final t = (m['type'] as String? ?? '').toUpperCase();
      return t.contains('REVISION') || t.contains('NOTES_WITH_MCQ') || (m['title'] as String? ?? '').toLowerCase().contains('practice') || (m['title'] as String? ?? '').toLowerCase().contains('revision');
    }).toList();
  }

  // Filter materials with readable Notes
  List<Map<String, dynamic>> get _notes {
    final list = _allMaterials.where((m) {
      final content = m['reading_content'] as String?;
      return content != null && content.trim().isNotEmpty;
    }).toList();
    return list.isNotEmpty ? list : _allMaterials;
  }

  // Filter materials with Quizzes (all items having questions)
  List<Map<String, dynamic>> get _quizzes {
    return _allMaterials.where((m) {
      final qs = m['questions'] as List<dynamic>?;
      return qs != null && qs.isNotEmpty;
    }).toList();
  }

  void _navigateToSection({
    required String title,
    required String categoryKey,
    required List<Map<String, dynamic>> items,
  }) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => MaterialsSectionListScreen(
          title: title,
          categoryKey: categoryKey,
          activeChild: widget.activeChild,
          subject: widget.subject,
          division: widget.division,
          materials: items,
        ),
      ),
    );
  }

  Widget _buildCategoryCard({
    required String title,
    required String subtitle,
    required String itemCountLabel,
    required IconData icon,
    required Color iconColor,
    required Gradient? gradient,
    required Color? backgroundColor,
    required VoidCallback onTap,
  }) {
    const double cardRadius = 26.0;
    const double cardHeight = 175.0;

    return Expanded(
      child: DPadFocusableCard(
        borderRadius: cardRadius,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        backgroundColor: backgroundColor ?? AppTheme.surfaceNavy,
        gradient: gradient,
        onSelect: onTap,
        child: SizedBox(
          height: cardHeight,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Top row: Icon and count badge
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: iconColor.withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(icon, color: iconColor, size: 26),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      itemCountLabel,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),

              // Middle title
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: -0.5,
                      height: 1.15,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.65),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),

              // Bottom action label
              Row(
                children: [
                  Text(
                    "explore →",
                    style: TextStyle(
                      color: iconColor,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorHex = widget.subject['accent_color'] as String? ?? '#2563EB';
    final accentColor = Color(int.parse(colorHex.replaceAll('#', '0xFF')));
    final gradeLabel = (widget.activeChild['grade_key'] as String).toUpperCase().replaceAll('_', ' ');

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
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: accentColor.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.menu_book_rounded, color: accentColor, size: 22),
            ),
            const SizedBox(width: 14),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.subject['name'],
                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                ),
                Text(
                  "Learner: ${widget.activeChild['display_name']} ($gradeLabel)",
                  style: const TextStyle(color: Colors.white54, fontSize: 13),
                ),
              ],
            ),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.tealAccent))
          : SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
                child: Column(
                  children: [
                    // TOP ROW: 2 Columns (Exam Papers & Revision and Practice)
                    Row(
                      children: [
                        // Card 1: Exam Papers
                        _buildCategoryCard(
                          title: "Exam Papers",
                          subtitle: "Standardised past exams & test sets",
                          itemCountLabel: "${_examPapers.length} Papers",
                          icon: Icons.assignment_rounded,
                          iconColor: AppTheme.goldStar,
                          gradient: const LinearGradient(
                            colors: [
                              Color(0xFFB45309), // Amber-800
                              Color(0xFFD97706), // Amber-600
                              Color(0xFFF59E0B), // Amber-500
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          backgroundColor: null,
                          onTap: () => _navigateToSection(
                            title: "Exam Papers",
                            categoryKey: 'EXAM_PAPERS',
                            items: _examPapers,
                          ),
                        ),

                        const SizedBox(width: 20),

                        // Card 2: Revision & Practice
                        _buildCategoryCard(
                          title: "Revision & Practice",
                          subtitle: "Topic modules & comprehensive exercises",
                          itemCountLabel: "${_revisionAndPractice.length} Units",
                          icon: Icons.auto_stories_rounded,
                          iconColor: AppTheme.tealAccent,
                          gradient: null,
                          backgroundColor: AppTheme.surfaceNavy,
                          onTap: () => _navigateToSection(
                            title: "Revision & Practice",
                            categoryKey: 'REVISION_PRACTICE',
                            items: _revisionAndPractice,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // BOTTOM ROW: 2 Columns (Notes & Quizzes)
                    Row(
                      children: [
                        // Card 3: Notes
                        _buildCategoryCard(
                          title: "Notes",
                          subtitle: "Study guides, summaries & core concepts",
                          itemCountLabel: "${_notes.length} Guides",
                          icon: Icons.description_rounded,
                          iconColor: AppTheme.cobaltBlue,
                          gradient: null,
                          backgroundColor: AppTheme.surfaceNavy,
                          onTap: () => _navigateToSection(
                            title: "Notes",
                            categoryKey: 'NOTES',
                            items: _notes,
                          ),
                        ),

                        const SizedBox(width: 20),

                        // Card 4: Quizzes
                        _buildCategoryCard(
                          title: "Quizzes",
                          subtitle: "Multiple choice challenges with AI hints",
                          itemCountLabel: "${_quizzes.length} Quizzes",
                          icon: Icons.bolt_rounded,
                          iconColor: const Color(0xFFC084FC),
                          gradient: const LinearGradient(
                            colors: [
                              Color(0xFF6B21A8), // Purple-800
                              Color(0xFF8B5CF6), // Purple-500
                              Color(0xFF4F46E5), // Indigo-600
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          backgroundColor: null,
                          onTap: () => _navigateToSection(
                            title: "Quizzes",
                            categoryKey: 'QUIZZES',
                            items: _quizzes,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
