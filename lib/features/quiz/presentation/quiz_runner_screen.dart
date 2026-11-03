import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_theme.dart';
import '../../core/network/chatgpt_service.dart';
import '../../shared/widgets/dpad_focusable.dart';

class QuizRunnerScreen extends StatefulWidget {
  final String gradeKey;
  final String division;
  final String subjectName;
  final String materialTitle;
  final List<Map<String, dynamic>> questions;

  const QuizRunnerScreen({
    super.key,
    required this.gradeKey,
    required this.division,
    required this.subjectName,
    required this.materialTitle,
    required this.questions,
  });

  @override
  State<QuizRunnerScreen> createState() => _QuizRunnerScreenState();
}

class _QuizRunnerScreenState extends State<QuizRunnerScreen> {
  int _currentIndex = 0;
  int? _selectedAnswerIndex;
  bool _isSubmitted = false;
  int _earnedXP = 0;
  int _earnedStars = 0;

  bool _isExplainingWithAI = false;
  String? _aiExplanation;

  final ChatGPTService _chatGPTService = ChatGPTService();

  Map<String, dynamic> get _currentQuestion => widget.questions[_currentIndex];

  void _submitAnswer(int index) {
    if (_isSubmitted) return;

    setState(() {
      _selectedAnswerIndex = index;
      _isSubmitted = true;
      _aiExplanation = null;

      final isCorrect = index == _currentQuestion['correct_index'];
      if (isCorrect) {
        _earnedXP += 10;
        _earnedStars += 1;
      }
    });
  }

  Future<void> _explainWithAI() async {
    setState(() {
      _isExplainingWithAI = true;
      _aiExplanation = null;
    });

    final options = (_currentQuestion['options'] as List<dynamic>).map((e) => e.toString()).toList();
    final chosen = _selectedAnswerIndex != null ? options[_selectedAnswerIndex!] : 'None';
    final correct = options[_currentQuestion['correct_index'] as int];

    final explanation = await _chatGPTService.explainMistake(
      division: widget.division,
      gradeKey: widget.gradeKey,
      subjectName: widget.subjectName,
      questionPrompt: _currentQuestion['prompt'],
      selectedOption: chosen,
      correctOption: correct,
    );

    setState(() {
      _isExplainingWithAI = false;
      _aiExplanation = explanation;
    });
  }

  void _nextQuestion() {
    if (_currentIndex < widget.questions.length - 1) {
      setState(() {
        _currentIndex++;
        _selectedAnswerIndex = null;
        _isSubmitted = false;
        _aiExplanation = null;
      });
    } else {
      _showQuizCompletionDialog();
    }
  }

  void _showQuizCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          backgroundColor: AppTheme.surfaceNavy,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Row(
            children: [
              Icon(Icons.military_tech_rounded, color: AppTheme.goldStar, size: 36),
              SizedBox(width: 10),
              Text(
                "Paper Completed!",
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Great work! Your XP and stars have been added to the household leaderboard.",
                style: TextStyle(color: Colors.white70, fontSize: 15),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppTheme.xpPurple.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.bolt, color: AppTheme.xpPurple, size: 20),
                        const SizedBox(width: 6),
                        Text(
                          "+$_earnedXP XP",
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppTheme.goldStar.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.star_rounded, color: AppTheme.goldStar, size: 20),
                        const SizedBox(width: 6),
                        Text(
                          "+$_earnedStars Stars",
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.tealAccent,
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.of(context).pop();
              },
              child: const Text("Return to Home", style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final question = _currentQuestion;
    final options = question['options'] as List<dynamic>;
    final correctIndex = question['correct_index'] as int;

    return Scaffold(
      backgroundColor: AppTheme.darkNavy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.materialTitle,
              style: const TextStyle(fontSize: 16, color: Colors.white70),
            ),
            Text(
              "Question ${_currentIndex + 1} of ${widget.questions.length}",
              style: const TextStyle(fontSize: 13, color: AppTheme.tealAccent),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 24),
            child: Row(
              children: [
                const Icon(Icons.bolt, color: AppTheme.xpPurple, size: 20),
                const SizedBox(width: 4),
                Text(
                  "$_earnedXP XP",
                  style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(width: 14),
                const Icon(Icons.star_rounded, color: AppTheme.goldStar, size: 22),
                const SizedBox(width: 4),
                Text(
                  "$_earnedStars",
                  style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Question Card
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceNavy,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.white12),
                ),
                child: Text(
                  question['prompt'],
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                    height: 1.4,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // MCQ Options Deck (TV D-Pad & Tablet Touch friendly)
              ...List.generate(options.length, (index) {
                final isSelected = _selectedAnswerIndex == index;
                final isCorrect = index == correctIndex;

                Color optionColor = AppTheme.surfaceNavy;
                Color borderColor = Colors.white12;

                if (_isSubmitted) {
                  if (isCorrect) {
                    optionColor = AppTheme.successGreen.withOpacity(0.2);
                    borderColor = AppTheme.successGreen;
                  } else if (isSelected) {
                    optionColor = AppTheme.errorCoral.withOpacity(0.2);
                    borderColor = AppTheme.errorCoral;
                  }
                }

                return Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: DPadFocusableCard(
                    borderRadius: 20,
                    backgroundColor: optionColor,
                    onSelect: () => _submitAnswer(index),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 18,
                          backgroundColor: Colors.white10,
                          child: Text(
                            String.fromCharCode(65 + index), // A, B, C, D
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: _isSubmitted && isCorrect
                                  ? AppTheme.successGreen
                                  : Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Text(
                            options[index].toString(),
                            style: const TextStyle(
                              fontSize: 18,
                              color: Colors.white,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        if (_isSubmitted && isCorrect)
                          const Icon(Icons.check_circle, color: AppTheme.successGreen, size: 26)
                        else if (_isSubmitted && isSelected)
                          const Icon(Icons.cancel, color: AppTheme.errorCoral, size: 26),
                      ],
                    ),
                  ),
                );
              }),

              const SizedBox(height: 16),

              // Action Buttons: Explain with AI & Next Question
              if (_isSubmitted) ...[
                Row(
                  children: [
                    // Prominent "Explain with AI" Button
                    Expanded(
                      child: DPadFocusableCard(
                        borderRadius: 20,
                        backgroundColor: AppTheme.cobaltBlue,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        onSelect: _explainWithAI,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.auto_awesome, color: AppTheme.goldStar, size: 22),
                            const SizedBox(width: 8),
                            Text(
                              _isExplainingWithAI ? "Asking Yivu..." : "Explain with AI",
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    // Next Question Button
                    Expanded(
                      child: DPadFocusableCard(
                        borderRadius: 20,
                        backgroundColor: AppTheme.tealAccent,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        onSelect: _nextQuestion,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              _currentIndex < widget.questions.length - 1
                                  ? "Next Question"
                                  : "Finish Paper",
                              style: const TextStyle(
                                color: Colors.black,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Icon(Icons.arrow_forward_rounded, color: Colors.black, size: 22),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // AI Explanation Box (Animated display)
                if (_aiExplanation != null)
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppTheme.cobaltBlue.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: AppTheme.tealAccent.withOpacity(0.5)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.smart_toy_rounded, color: AppTheme.tealAccent, size: 24),
                            SizedBox(width: 8),
                            Text(
                              "Yivu AI Tutor says:",
                              style: TextStyle(
                                color: AppTheme.tealAccent,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          _aiExplanation!,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
