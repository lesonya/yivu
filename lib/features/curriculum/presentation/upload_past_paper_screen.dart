import 'package:flutter/material.dart';
import 'package:yivu/core/theme/app_theme.dart';
import 'package:yivu/core/database/database_helper.dart';
import 'package:yivu/shared/widgets/dpad_focusable.dart';
import '../services/past_paper_extractor_service.dart';

class UploadPastPaperScreen extends StatefulWidget {
  final String? preselectedGradeKey;
  final String? preselectedSubjectId;

  const UploadPastPaperScreen({
    super.key,
    this.preselectedGradeKey,
    this.preselectedSubjectId,
  });

  @override
  State<UploadPastPaperScreen> createState() => _UploadPastPaperScreenState();
}

class _UploadPastPaperScreenState extends State<UploadPastPaperScreen> {
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();

  late String _selectedGrade;
  String _selectedTerm = 'Term 1';
  late String _selectedSubjectId;

  bool _isExtracting = false;
  String? _errorMessage;
  List<Map<String, dynamic>>? _extractedQuestions;

  final _gradeOptions = [
    {'key': 'std_2', 'label': 'Standard 2', 'division': 'standard'},
    {'key': 'std_3', 'label': 'Standard 3', 'division': 'standard'},
    {'key': 'std_4', 'label': 'Standard 4', 'division': 'standard'},
    {'key': 'std_5', 'label': 'Standard 5', 'division': 'standard'},
    {'key': 'std_6', 'label': 'Standard 6', 'division': 'standard'},
    {'key': 'std_7', 'label': 'Standard 7', 'division': 'standard'},
    {'key': 'form_1', 'label': 'Form 1', 'division': 'form'},
    {'key': 'form_2', 'label': 'Form 2', 'division': 'form'},
    {'key': 'form_3', 'label': 'Form 3', 'division': 'form'},
  ];

  final _termOptions = ['Term 1', 'Term 2', 'Term 3', 'Final Exam'];

  final _subjectsMap = {
    'standard': [
      {'id': 'std_english', 'name': 'English'},
      {'id': 'std_setswana', 'name': 'Setswana'},
      {'id': 'std_math', 'name': 'Mathematics'},
      {'id': 'std_env_science', 'name': 'Environmental Science'},
      {'id': 'std_science', 'name': 'Science'},
      {'id': 'std_social_studies', 'name': 'Social Studies'},
      {'id': 'std_agriculture', 'name': 'Agriculture'},
      {'id': 'std_cultural_studies', 'name': 'Cultural Studies'},
      {'id': 'std_rme', 'name': 'Religious & Moral Ed (RME)'},
      {'id': 'std_capa', 'name': 'Creative & Performing Arts (CAPA)'},
    ],
    'form': [
      {'id': 'form_english', 'name': 'English'},
      {'id': 'form_setswana', 'name': 'Setswana'},
      {'id': 'form_math', 'name': 'Mathematics'},
      {'id': 'form_integrated_science', 'name': 'Integrated Science'},
      {'id': 'form_social_studies', 'name': 'Social Studies'},
      {'id': 'form_agriculture', 'name': 'Agriculture'},
      {'id': 'form_moral_education', 'name': 'Moral Education'},
      {'id': 'form_religious_education', 'name': 'Religious Education'},
      {'id': 'form_design_technology', 'name': 'Design & Technology'},
      {'id': 'form_home_economics', 'name': 'Home Economics'},
      {'id': 'form_art_craft_music', 'name': 'Art & Craft / Music'},
      {'id': 'form_physical_education', 'name': 'Physical Education'},
      {'id': 'form_computer_awareness', 'name': 'Computer Awareness / ICT'},
      {'id': 'form_third_languages', 'name': 'Third Languages'},
    ],
  };

  @override
  void initState() {
    super.initState();
    _selectedGrade = widget.preselectedGradeKey ?? 'std_4';
    _selectedSubjectId = widget.preselectedSubjectId ?? _currentSubjects.first['id']!;
  }

  String get _currentDivision {
    final grade = _gradeOptions.firstWhere((g) => g['key'] == _selectedGrade);
    return grade['division']!;
  }

  List<Map<String, String>> get _currentSubjects {
    return _subjectsMap[_currentDivision]!;
  }

  Future<void> _extractQuestions() async {
    final title = _titleController.text.trim();
    final rawText = _contentController.text.trim();

    if (title.isEmpty || rawText.isEmpty) {
      setState(() => _errorMessage = "Please enter both a title and the past paper text.");
      return;
    }

    setState(() {
      _isExtracting = true;
      _errorMessage = null;
    });

    try {
      final subjectName = _currentSubjects.firstWhere((s) => s['id'] == _selectedSubjectId)['name']!;
      final extractor = PastPaperExtractorService();

      final questions = await extractor.extractQuestionsFromPaperText(
        division: _currentDivision,
        gradeKey: _selectedGrade,
        subjectName: subjectName,
        term: _selectedTerm,
        rawExamText: rawText,
      );

      setState(() {
        _isExtracting = false;
        _extractedQuestions = questions;
      });
    } catch (e) {
      setState(() {
        _isExtracting = false;
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  Future<void> _saveToLocalDatabase() async {
    if (_extractedQuestions == null || _extractedQuestions!.isEmpty) return;

    try {
      await DatabaseHelper.instance.saveExtractedPaper(
        gradeKey: _selectedGrade,
        subjectId: _selectedSubjectId,
        term: _selectedTerm,
        title: _titleController.text.trim(),
        rawContent: _contentController.text.trim(),
        questions: _extractedQuestions!,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppTheme.successGreen,
            content: Text(
              "Successfully saved ${_extractedQuestions!.length} questions into local database for $_selectedGrade ($_selectedTerm)!",
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      setState(() => _errorMessage = "Database save failed: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkNavy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Row(
          children: [
            Icon(Icons.upload_file_rounded, color: AppTheme.tealAccent),
            SizedBox(width: 10),
            Text("Digitize Past Paper with AI", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
          ],
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Metadata Selectors: Standard, Subject, Term
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceNavy,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: Colors.white12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Curriculum Classification",
                      style: TextStyle(color: AppTheme.tealAccent, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        // Standard / Form
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: _selectedGrade,
                            dropdownColor: AppTheme.surfaceNavy,
                            style: const TextStyle(color: Colors.white, fontSize: 14),
                            decoration: InputDecoration(
                              labelText: "Grade / Standard",
                              labelStyle: const TextStyle(color: Colors.white60),
                              filled: true,
                              fillColor: AppTheme.darkNavy,
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                            items: _gradeOptions.map((g) {
                              return DropdownMenuItem<String>(
                                value: g['key'],
                                child: Text("${g['label']} (${g['division'] == 'standard' ? 'Std' : 'Form'})"),
                              );
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) {
                                setState(() {
                                  _selectedGrade = val;
                                  _selectedSubjectId = _currentSubjects.first['id']!;
                                });
                              }
                            },
                          ),
                        ),
                        const SizedBox(width: 14),

                        // Subject
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: _selectedSubjectId,
                            dropdownColor: AppTheme.surfaceNavy,
                            style: const TextStyle(color: Colors.white, fontSize: 14),
                            decoration: InputDecoration(
                              labelText: "Subject",
                              labelStyle: const TextStyle(color: Colors.white60),
                              filled: true,
                              fillColor: AppTheme.darkNavy,
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                            items: _currentSubjects.map((s) {
                              return DropdownMenuItem<String>(
                                value: s['id'],
                                child: Text(s['name']!),
                              );
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) setState(() => _selectedSubjectId = val);
                            },
                          ),
                        ),
                        const SizedBox(width: 14),

                        // Term Note (Term 1, Term 2, Term 3, Final)
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: _selectedTerm,
                            dropdownColor: AppTheme.surfaceNavy,
                            style: const TextStyle(color: Colors.white, fontSize: 14),
                            decoration: InputDecoration(
                              labelText: "School Term",
                              labelStyle: const TextStyle(color: Colors.white60),
                              filled: true,
                              fillColor: AppTheme.darkNavy,
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                            items: _termOptions.map((t) {
                              return DropdownMenuItem<String>(
                                value: t,
                                child: Text(t),
                              );
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) setState(() => _selectedTerm = val);
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Title input
              TextField(
                controller: _titleController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: "Paper Title e.g., '2024 PSLE Science Mid-Term 2 Mock'",
                  labelStyle: const TextStyle(color: Colors.white60),
                  filled: true,
                  fillColor: AppTheme.surfaceNavy,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),

              const SizedBox(height: 16),

              // Raw exam text paste field
              TextField(
                controller: _contentController,
                maxLines: 8,
                style: const TextStyle(color: Colors.white, fontSize: 14),
                decoration: InputDecoration(
                  labelText: "Paste Past Paper or Exam Text Here",
                  labelStyle: const TextStyle(color: Colors.white60),
                  hintText: "1. Which gas do green plants absorb during photosynthesis?\nA) Oxygen\nB) Carbon Dioxide\nC) Nitrogen\nD) Helium...",
                  hintStyle: const TextStyle(color: Colors.white24),
                  filled: true,
                  fillColor: AppTheme.surfaceNavy,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),

              if (_errorMessage != null) ...[
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppTheme.errorCoral.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.errorCoral.withOpacity(0.4)),
                  ),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: AppTheme.errorCoral, fontSize: 14),
                  ),
                ),
              ],

              const SizedBox(height: 20),

              // Extraction Action Button
              DPadFocusableCard(
                borderRadius: 20,
                backgroundColor: AppTheme.cobaltBlue,
                padding: const EdgeInsets.symmetric(vertical: 16),
                onSelect: _isExtracting ? () {} : _extractQuestions,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      _isExtracting ? Icons.hourglass_top_rounded : Icons.auto_awesome,
                      color: AppTheme.goldStar,
                      size: 22,
                    ),
                    const SizedBox(width: 10),
                    Text(
                      _isExtracting ? "AI is Extracting Questions..." : "Extract Questions with Yivu AI",
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),

              // Preview extracted questions
              if (_extractedQuestions != null) ...[
                const SizedBox(height: 28),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Extracted ${_extractedQuestions!.length} Questions:",
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                    DPadFocusableCard(
                      borderRadius: 14,
                      backgroundColor: AppTheme.tealAccent,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      onSelect: _saveToLocalDatabase,
                      child: const Row(
                        children: [
                          Icon(Icons.save, color: Colors.black, size: 18),
                          SizedBox(width: 8),
                          Text(
                            "Save to Local Database",
                            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                ...List.generate(_extractedQuestions!.length, (index) {
                  final q = _extractedQuestions![index];
                  final opts = q['options'] as List<dynamic>;
                  final correctIdx = q['correct_index'] as int;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceNavy,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Q${index + 1}: ${q['prompt']}",
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        const SizedBox(height: 8),
                        ...List.generate(opts.length, (optIdx) {
                          final isCorrect = optIdx == correctIdx;
                          return Padding(
                            padding: const EdgeInsets.only(left: 10, bottom: 4),
                            child: Row(
                              children: [
                                Text(
                                  "${String.fromCharCode(65 + optIdx)}) ${opts[optIdx]}",
                                  style: TextStyle(
                                    color: isCorrect ? AppTheme.tealAccent : Colors.white70,
                                    fontWeight: isCorrect ? FontWeight.bold : FontWeight.normal,
                                    fontSize: 14,
                                  ),
                                ),
                                if (isCorrect) const Text("  ✓ (Correct)", style: TextStyle(color: AppTheme.tealAccent)),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  );
                }),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
