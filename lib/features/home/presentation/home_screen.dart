import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:yivu/core/theme/app_theme.dart';
import 'package:yivu/shared/widgets/dpad_focusable.dart';
import 'package:yivu/features/gamification/presentation/tv_leaderboard_podium.dart';
import 'package:yivu/features/gamification/presentation/profile_switcher_dialog.dart';
import 'package:yivu/features/curriculum/presentation/subject_materials_screen.dart';
import 'package:yivu/features/curriculum/presentation/upload_past_paper_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _selectedDivision = 'standards'; // 'standards' or 'forms'
  Map<String, dynamic> _activeChild = {
    'id': 'child_1',
    'display_name': 'Kagiso',
    'avatar_mascot': 'owl',
    'grade_key': 'std_4',
    'division': 'standard',
    'total_xp': 420,
    'total_stars': 24,
  };

  List<Map<String, dynamic>> _leaderboard = [];
  Map<String, dynamic>? _curriculumData;
  bool _isLoading = true;

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
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [AppTheme.cobaltBlue, AppTheme.tealAccent],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Center(
                            child: Text(
                              "Y",
                              style: TextStyle(
                                fontSize: 30,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                          ),
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

            // Sibling Leaderboard (Passive TV Dashboard Component)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                child: TVLeaderboardPodium(leaderboard: _leaderboard),
              ),
            ),

            // Division Switcher (Standards Std 2-7 vs Forms Form 1-3)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                child: Row(
                  children: [
                    _buildDivisionTab(
                      id: 'standards',
                      title: 'Primary Standards (Std 2 to 7)',
                      subtitle: '10 Foundation Subjects',
                      icon: Icons.school,
                    ),
                    const SizedBox(width: 16),
                    _buildDivisionTab(
                      id: 'forms',
                      title: 'Junior Secondary (Form 1 to 3)',
                      subtitle: '14 Core & Elective Subjects',
                      icon: Icons.auto_stories,
                    ),
                  ],
                ),
              ),
            ),

            // Subject Grid
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: 260,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 1.25,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final subject = _currentSubjects[index];
                    final colorHex = subject['accent_color'] as String? ?? '#2563EB';
                    final color = Color(int.parse(colorHex.replaceAll('#', '0xFF')));

                    return DPadFocusableCard(
                      borderRadius: 22,
                      backgroundColor: AppTheme.surfaceNavy,
                      onSelect: () => _openSubjectMaterials(subject),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                width: 42,
                                height: 42,
                                decoration: BoxDecoration(
                                  color: color.withOpacity(0.18),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(Icons.menu_book_rounded, color: color, size: 22),
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
                                    fontWeight: FontWeight.w800,
                                    fontSize: 11,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                subject['name'] ?? '',
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                "${(subject['topics'] as List<dynamic>? ?? []).length} Topics / Past Papers",
                                style: const TextStyle(color: Colors.white54, fontSize: 12),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                  childCount: _currentSubjects.length,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDivisionTab({
    required String id,
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    final isSelected = _selectedDivision == id;

    return Expanded(
      child: DPadFocusableCard(
        borderRadius: 20,
        backgroundColor: isSelected ? AppTheme.cobaltBlue.withOpacity(0.25) : AppTheme.surfaceNavy,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        onSelect: () => setState(() => _selectedDivision = id),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected ? AppTheme.tealAccent : Colors.white60,
              size: 28,
            ),
            const SizedBox(width: 14),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.white70,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(color: Colors.white54, fontSize: 12),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

