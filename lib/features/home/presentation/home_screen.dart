import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:yivu/core/theme/app_theme.dart';
import 'package:yivu/shared/widgets/dpad_focusable.dart';
import 'package:yivu/features/gamification/presentation/profile_switcher_dialog.dart';
import 'package:yivu/features/gamification/presentation/leaderboard_screen.dart';
import 'package:yivu/features/curriculum/presentation/subject_materials_screen.dart';
import 'package:yivu/features/curriculum/presentation/upload_past_paper_screen.dart';
import 'widgets/dashboard_action_cards.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _selectedDivision = 'standards'; // 'standards' or 'forms'
  Map<String, dynamic> _activeChild = {
    'id': 'child_aaba',
    'display_name': 'Aaba',
    'avatar_mascot': 'owl',
    'grade_key': 'std_5',
    'division': 'standard',
    'total_xp': 0,
    'total_stars': 0,
  };

  List<Map<String, dynamic>> _leaderboard = [];
  Map<String, dynamic>? _curriculumData;
  bool _isLoading = true;

  // Last active task tracking (Dynamic Resume Link)
  int _lastProgressPercent = 0;
  String _lastTaskTitle = "Standard 5 • Mathematics";
  Map<String, dynamic>? _lastSubject;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    try {
      final rawCurriculum = await rootBundle.loadString('assets/data/curriculum.json');
      _curriculumData = await compute(
        (String jsonStr) => json.decode(jsonStr) as Map<String, dynamic>,
        rawCurriculum,
      );

      _leaderboard = [
        {
          'child_id': 'child_aaba',
          'display_name': 'Aaba',
          'avatar_mascot': 'owl',
          'grade_key': 'std_5',
          'weekly_xp': 500,
          'weekly_stars': 30,
        },
        {
          'child_id': 'child_1',
          'display_name': 'Kagiso',
          'avatar_mascot': 'owl',
          'grade_key': 'std_4',
          'weekly_xp': 420,
          'weekly_stars': 24,
        },
        {
          'child_id': 'child_2',
          'display_name': 'Tebogo',
          'avatar_mascot': 'lion',
          'grade_key': 'std_2',
          'weekly_xp': 310,
          'weekly_stars': 18,
        },
        {
          'child_id': 'child_3',
          'display_name': 'Naledi',
          'avatar_mascot': 'cheetah',
          'grade_key': 'form_1',
          'weekly_xp': 260,
          'weekly_stars': 15,
        },
      ];
    } catch (e) {
      debugPrint("Error loading data: $e");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  final ScrollController _scrollController = ScrollController();

  void _showSubjectPickerDialog() {
    final subjects = _currentSubjects;
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surfaceNavy,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      "Select Subject",
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white70),
                      onPressed: () => Navigator.of(ctx).pop(),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Flexible(
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: subjects.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, index) {
                      final subject = subjects[index] as Map<String, dynamic>;
                      final colorHex = subject['accent_color'] as String? ?? '#2563EB';
                      final color = Color(int.parse(colorHex.replaceAll('#', '0xFF')));
                      return DPadFocusableCard(
                        borderRadius: 16,
                        backgroundColor: AppTheme.darkNavy,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        onSelect: () {
                          Navigator.of(ctx).pop();
                          _openSubjectMaterials(subject);
                        },
                        child: Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: color.withValues(alpha: 0.18),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Icon(Icons.menu_book_rounded, color: color, size: 20),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Text(
                                subject['name'] ?? '',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white10,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                subject['code'] ?? '',
                                style: TextStyle(
                                  color: color,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _resumeLastTask() {
    if (_lastSubject != null) {
      _openSubjectMaterials(_lastSubject!);
    } else {
      // If no task stored yet, open first subject of active division
      final subjects = _currentSubjects;
      if (subjects.isNotEmpty) {
        _openSubjectMaterials(Map<String, dynamic>.from(subjects.first));
      }
    }
  }

  void _openLeaderboardScreen() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => LeaderboardScreen(leaderboard: _leaderboard),
      ),
    );
  }

  void _openProfileDialog() {
    showDialog(
      context: context,
      builder: (_) => ProfileSwitcherDialog(
        activeChildId: _activeChild['id'],
        onProfileSelected: (child) {
          setState(() {
            _activeChild = child;
            _selectedDivision = child['division'] == 'form' ? 'forms' : 'standards';
          });
        },
        onProfileCreated: (newChild) {
          setState(() {
            _activeChild = newChild;
            _selectedDivision = newChild['division'] == 'form' ? 'forms' : 'standards';
            _leaderboard.add({
              'child_id': newChild['id'],
              'display_name': newChild['display_name'],
              'avatar_mascot': newChild['avatar_mascot'],
              'grade_key': newChild['grade_key'],
              'weekly_xp': 0,
              'weekly_stars': 0,
            });
          });
        },
      ),
    );
  }

  void _openSubjectMaterials(Map<String, dynamic> subject) {
    setState(() {
      _lastSubject = subject;
      _lastTaskTitle = "${_activeChild['grade_key'].toString().toUpperCase().replaceAll('_', ' ')} • ${subject['name']}";
      _lastProgressPercent = 35; // Carried forward active progress
    });

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => SubjectMaterialsScreen(
          activeChild: _activeChild,
          subject: subject,
          division: _selectedDivision == 'forms' ? 'form' : 'standard',
        ),
      ),
    );
  }

  List<dynamic> get _currentSubjects {
    if (_curriculumData == null) return [];
    final divisions = _curriculumData!['divisions'] as List<dynamic>;
    final active = divisions.firstWhere(
      (d) => d['id'] == _selectedDivision,
      orElse: () => divisions.first,
    );
    return active['subjects'] as List<dynamic>;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: AppTheme.darkNavy,
        body: Center(
          child: CircularProgressIndicator(color: AppTheme.tealAccent),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.darkNavy,
      body: SafeArea(
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            // Top App Bar: Brand Logo & Active Child Profile Pill
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Brand Logo with Title
                    Row(
                      children: [
                        Image.asset(
                          "resources/img/logo.png",
                          width: 48,
                          height: 48,
                          fit: BoxFit.contain,
                        ),
                        const SizedBox(width: 14),
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "yivu",
                              style: TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                                letterSpacing: -0.5,
                              ),
                            ),
                            Text(
                              "Gamified Learning for Tablet & Android TV",
                              style: TextStyle(fontSize: 13, color: Colors.white54),
                            ),
                          ],
                        ),
                      ],
                    ),

                    // Active Learner Selector Pill & Add Past Paper Button
                    Row(
                      children: [
                        DPadFocusableCard(
                          borderRadius: 20,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          backgroundColor: AppTheme.cobaltBlue.withOpacity(0.2),
                          onSelect: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => UploadPastPaperScreen(
                                  preselectedGradeKey: _activeChild['grade_key'],
                                ),
                              ),
                            );
                          },
                          child: const Row(
                            children: [
                              Icon(Icons.add_circle_outline, color: AppTheme.tealAccent, size: 20),
                              SizedBox(width: 8),
                              Text(
                                "Add Past Paper",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 14),
                        DPadFocusableCard(
                          borderRadius: 30,
                          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                          backgroundColor: AppTheme.surfaceNavy,
                          onSelect: _openProfileDialog,
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 16,
                                backgroundColor: AppTheme.cobaltBlue,
                                child: Text(
                                  (_activeChild['display_name'] as String? ?? 'K')[0],
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Text(
                                "Learner: ${_activeChild['display_name']} (${(_activeChild['grade_key'] as String).toUpperCase().replaceAll('_', ' ')})",
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Icon(Icons.keyboard_arrow_down, color: Colors.white70, size: 20),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Four-Column Dashboard Action Cards: Resume, Select Subject, Select Grade, Leaderboard Ranks
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                child: DashboardActionCards(
                  progressPercent: _lastProgressPercent,
                  activeTaskTitle: _lastTaskTitle,
                  currentSubjectName: _lastSubject != null ? _lastSubject!['name'] : 'Mathematics',
                  currentGradeLabel: (_activeChild['grade_key'] as String).toUpperCase().replaceAll('_', ' '),
                  onResume: _resumeLastTask,
                  onSelectSubject: _showSubjectPickerDialog,
                  onSelectGrade: _openProfileDialog,
                  onOpenLeaderboard: _openLeaderboardScreen,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

