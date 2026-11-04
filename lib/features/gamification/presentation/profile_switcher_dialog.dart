import 'package:flutter/material.dart';
import 'package:yivu/core/theme/app_theme.dart';
import 'package:yivu/shared/widgets/dpad_focusable.dart';

class ProfileSwitcherDialog extends StatefulWidget {
  final String activeChildId;
  final Function(Map<String, dynamic> selectedChild) onProfileSelected;
  final Function(Map<String, dynamic> newChild) onProfileCreated;

  const ProfileSwitcherDialog({
    super.key,
    required this.activeChildId,
    required this.onProfileSelected,
    required this.onProfileCreated,
  });

  @override
  State<ProfileSwitcherDialog> createState() => _ProfileSwitcherDialogState();
}

class _ProfileSwitcherDialogState extends State<ProfileSwitcherDialog> {
  bool _isCreatingNew = false;
  final TextEditingController _nameController = TextEditingController();
  String _selectedGrade = 'std_2';
  String _selectedAvatar = 'owl';

  // Sample local profiles (loaded from SQLite or seed)
  final List<Map<String, dynamic>> _profiles = [
    {
      'id': 'child_aaba',
      'display_name': 'Aaba',
      'avatar_mascot': 'owl',
      'grade_key': 'std_5',
      'division': 'standard',
      'total_xp': 0,
      'total_stars': 0,
    },
    {
      'id': 'child_1',
      'display_name': 'Kagiso',
      'avatar_mascot': 'owl',
      'grade_key': 'std_4',
      'division': 'standard',
      'total_xp': 1420,
      'total_stars': 84,
    },
    {
      'id': 'child_2',
      'display_name': 'Tebogo',
      'avatar_mascot': 'lion',
      'grade_key': 'std_2',
      'division': 'standard',
      'total_xp': 910,
      'total_stars': 52,
    },
    {
      'id': 'child_3',
      'display_name': 'Naledi',
      'avatar_mascot': 'cheetah',
      'grade_key': 'form_1',
      'division': 'form',
      'total_xp': 2160,
      'total_stars': 115,
    },
  ];

  final List<Map<String, String>> _mascots = [
    {'id': 'owl', 'emoji': '🦉', 'label': 'Wise Owl'},
    {'id': 'lion', 'emoji': '🦁', 'label': 'Brave Lion'},
    {'id': 'cheetah', 'emoji': '🐆', 'label': 'Swift Cheetah'},
    {'id': 'elephant', 'emoji': '🐘', 'label': 'Kind Elephant'},
    {'id': 'zebra', 'emoji': '🦓', 'label': 'Clever Zebra'},
  ];

  final List<Map<String, String>> _gradeOptions = [
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

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _saveNewProfile() {
    final name = _nameController.text.trim();
    if (name.isEmpty) return;

    final selectedGradeMeta = _gradeOptions.firstWhere(
      (g) => g['key'] == _selectedGrade,
      orElse: () => _gradeOptions.first,
    );

    final newChild = {
      'id': 'child_${DateTime.now().millisecondsSinceEpoch}',
      'display_name': name,
      'avatar_mascot': _selectedAvatar,
      'grade_key': _selectedGrade,
      'division': selectedGradeMeta['division']!,
      'total_xp': 0,
      'total_stars': 0,
    };

    widget.onProfileCreated(newChild);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 40, vertical: 24),
      child: Container(
        width: 780,
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          color: AppTheme.surfaceNavy,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: AppTheme.tealAccent.withOpacity(0.3), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.5),
              blurRadius: 30,
              spreadRadius: 5,
            ),
          ],
        ),
        child: _isCreatingNew ? _buildCreateProfileView() : _buildProfileListView(),
      ),
    );
  }

  Widget _buildProfileListView() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Row(
              children: [
                Icon(Icons.people_alt_rounded, color: AppTheme.tealAccent, size: 28),
                SizedBox(width: 12),
                Text(
                  "Who is Learning Today?",
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            IconButton(
              icon: const Icon(Icons.close, color: Colors.white60),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
        const SizedBox(height: 6),
        const Text(
          "Switch active learner profile or add a new sibling to start earning XP.",
          style: TextStyle(fontSize: 14, color: Colors.white60),
        ),
        const SizedBox(height: 24),
        SizedBox(
          height: 170,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _profiles.length + 1,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (context, index) {
              if (index == _profiles.length) {
                // "Add Sibling" Card
                return DPadFocusableCard(
                  borderRadius: 22,
                  padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
                  backgroundColor: AppTheme.cobaltBlue.withOpacity(0.2),
                  onSelect: () => setState(() => _isCreatingNew = true),
                  child: const SizedBox(
                    width: 170,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircleAvatar(
                          radius: 28,
                          backgroundColor: AppTheme.cobaltBlue,
                          child: Icon(Icons.add, color: Colors.white, size: 30),
                        ),
                        SizedBox(height: 12),
                        Text(
                          "Add Sibling",
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          "New Learner",
                          style: TextStyle(color: Colors.white54, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                );
              }

              final child = _profiles[index];
              final isActive = child['id'] == widget.activeChildId;
              final mascot = _mascots.firstWhere(
                (m) => m['id'] == child['avatar_mascot'],
                orElse: () => _mascots.first,
              );

              return DPadFocusableCard(
                borderRadius: 22,
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                backgroundColor: isActive ? AppTheme.cobaltBlue.withOpacity(0.35) : AppTheme.darkNavy,
                onSelect: () {
                  widget.onProfileSelected(child);
                  Navigator.of(context).pop();
                },
                child: SizedBox(
                  width: 170,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Stack(
                        clipBehavior: Clip.none,
                        children: [
                          CircleAvatar(
                            radius: 28,
                            backgroundColor: isActive ? AppTheme.tealAccent : Colors.white10,
                            child: Text(
                              mascot['emoji']!,
                              style: const TextStyle(fontSize: 26),
                            ),
                          ),
                          if (isActive)
                            const Positioned(
                              bottom: -2,
                              right: -2,
                              child: CircleAvatar(
                                radius: 10,
                                backgroundColor: AppTheme.tealAccent,
                                child: Icon(Icons.check, size: 14, color: Colors.black),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        child['display_name'],
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        (child['grade_key'] as String).toUpperCase().replaceAll('_', ' '),
                        style: const TextStyle(color: AppTheme.tealAccent, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.bolt, color: AppTheme.xpPurple, size: 15),
                          Text(
                            "${child['total_xp']} XP",
                            style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildCreateProfileView() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white70),
                  onPressed: () => setState(() => _isCreatingNew = false),
                ),
                const SizedBox(width: 8),
                const Text(
                  "Create Child Profile",
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            IconButton(
              icon: const Icon(Icons.close, color: Colors.white60),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _nameController,
          autofocus: true,
          style: const TextStyle(color: Colors.white, fontSize: 16),
          decoration: InputDecoration(
            labelText: "Child's First Name",
            labelStyle: const TextStyle(color: Colors.white60),
            hintText: "e.g., Thabo, Lorato",
            hintStyle: const TextStyle(color: Colors.white30),
            filled: true,
            fillColor: AppTheme.darkNavy,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppTheme.tealAccent, width: 2),
            ),
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          "Choose Mascot Avatar:",
          style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 60,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _mascots.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final m = _mascots[index];
              final isSelected = m['id'] == _selectedAvatar;
              return DPadFocusableCard(
                borderRadius: 16,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                backgroundColor: isSelected ? AppTheme.cobaltBlue : AppTheme.darkNavy,
                onSelect: () => setState(() => _selectedAvatar = m['id']!),
                child: Row(
                  children: [
                    Text(m['emoji']!, style: const TextStyle(fontSize: 22)),
                    const SizedBox(width: 8),
                    Text(m['label']!, style: const TextStyle(color: Colors.white, fontSize: 13)),
                  ],
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          "Select School Level:",
          style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _selectedGrade,
          dropdownColor: AppTheme.surfaceNavy,
          style: const TextStyle(color: Colors.white, fontSize: 15),
          decoration: InputDecoration(
            filled: true,
            fillColor: AppTheme.darkNavy,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
          ),
          items: _gradeOptions.map((g) {
            return DropdownMenuItem<String>(
              value: g['key'],
              child: Text("${g['label']} (${g['division'] == 'standard' ? 'Primary' : 'Junior Sec'})"),
            );
          }).toList(),
          onChanged: (val) {
            if (val != null) setState(() => _selectedGrade = val);
          },
        ),
        const SizedBox(height: 24),
        Align(
          alignment: Alignment.centerRight,
          child: DPadFocusableCard(
            borderRadius: 18,
            backgroundColor: AppTheme.tealAccent,
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
            onSelect: _saveNewProfile,
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.check_rounded, color: Colors.black, size: 20),
                SizedBox(width: 8),
                Text(
                  "Save Learner",
                  style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 15),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

