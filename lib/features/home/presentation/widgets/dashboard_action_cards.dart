import 'package:flutter/material.dart';
import 'package:yivu/core/theme/app_theme.dart';
import 'package:yivu/shared/widgets/dpad_focusable.dart';

class DashboardActionCards extends StatelessWidget {
  final int progressPercent;
  final String activeTaskTitle;
  final String currentSubjectName;
  final String currentGradeLabel;
  final VoidCallback onResume;
  final VoidCallback onOpenLeaderboard;
  final VoidCallback onSelectSubject;
  final VoidCallback onSelectGrade;

  const DashboardActionCards({
    super.key,
    required this.progressPercent,
    required this.activeTaskTitle,
    required this.currentSubjectName,
    required this.currentGradeLabel,
    required this.onResume,
    required this.onOpenLeaderboard,
    required this.onSelectSubject,
    required this.onSelectGrade,
  });

  static const double _cardHeight = 160.0;
  static const double _cardRadius = 26.0;
  static const EdgeInsets _cardPadding = EdgeInsets.symmetric(horizontal: 20, vertical: 18);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 900;

        return Row(
          children: [
            // Card 1: Dynamic Resume / Progress Card
            Expanded(
              child: DPadFocusableCard(
                borderRadius: _cardRadius,
                padding: _cardPadding,
                backgroundColor: AppTheme.surfaceNavy,
                onSelect: onResume,
                child: SizedBox(
                  height: _cardHeight,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Top row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(7),
                            decoration: BoxDecoration(
                              color: AppTheme.cobaltBlue.withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.bar_chart_rounded,
                              color: AppTheme.cobaltBlue,
                              size: 22,
                            ),
                          ),
                          Flexible(
                            child: Text(
                              activeTaskTitle,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white38,
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),

                      // Middle headline: Progress [X]%
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            isWide ? "Progress" : "Prog.",
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.w500,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            "$progressPercent%",
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ),

                      // Bottom action
                      const Text(
                        "→ continue",
                        style: TextStyle(
                          color: AppTheme.tealAccent,
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          letterSpacing: -0.2,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(width: 14),

            // Card 2: Select Subject Card
            Expanded(
              child: DPadFocusableCard(
                borderRadius: _cardRadius,
                padding: _cardPadding,
                backgroundColor: AppTheme.surfaceNavy,
                onSelect: onSelectSubject,
                child: SizedBox(
                  height: _cardHeight,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Top row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(7),
                            decoration: BoxDecoration(
                              color: AppTheme.tealAccent.withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.menu_book_rounded,
                              color: AppTheme.tealAccent,
                              size: 22,
                            ),
                          ),
                          Flexible(
                            child: Text(
                              currentSubjectName,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: AppTheme.tealAccent,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),

                      // Middle headline
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Select",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.normal,
                              height: 1.1,
                            ),
                          ),
                          Text(
                            "Subject",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              height: 1.15,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ),

                      // Bottom action
                      const Text(
                        "browse all →",
                        style: TextStyle(
                          color: Colors.white54,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(width: 14),

            // Card 3: Select Standard / Grade Card
            Expanded(
              child: DPadFocusableCard(
                borderRadius: _cardRadius,
                padding: _cardPadding,
                backgroundColor: AppTheme.surfaceNavy,
                onSelect: onSelectGrade,
                child: SizedBox(
                  height: _cardHeight,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Top row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(7),
                            decoration: BoxDecoration(
                              color: AppTheme.goldStar.withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.school_rounded,
                              color: AppTheme.goldStar,
                              size: 22,
                            ),
                          ),
                          Flexible(
                            child: Text(
                              currentGradeLabel,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: AppTheme.goldStar,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),

                      // Middle headline
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Standard /",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.normal,
                              height: 1.1,
                            ),
                          ),
                          Text(
                            "Grade",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              height: 1.15,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ),

                      // Bottom action
                      const Text(
                        "switch level →",
                        style: TextStyle(
                          color: Colors.white54,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(width: 14),

            // Card 4: Leaderboard Ranks (Brand Gradient Card)
            Expanded(
              child: DPadFocusableCard(
                borderRadius: _cardRadius,
                padding: _cardPadding,
                gradient: const LinearGradient(
                  colors: [
                    Color(0xFF8B5CF6), // Purple
                    Color(0xFF6366F1), // Indigo
                    Color(0xFF2563EB), // Cobalt Blue
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                onSelect: onOpenLeaderboard,
                child: const SizedBox(
                  height: _cardHeight,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Top row: Trophy Icon
                      Icon(
                        Icons.emoji_events_rounded,
                        color: Colors.white,
                        size: 26,
                      ),

                      // Middle headline: Leaderboard Ranks
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Leaderboard",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.normal,
                              height: 1.1,
                              letterSpacing: -0.3,
                            ),
                          ),
                          Text(
                            "Ranks",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              height: 1.15,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ),

                      // Bottom action
                      Text(
                        "view podium →",
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
