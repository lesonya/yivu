import 'package:flutter/material.dart';
import 'package:yivu/core/theme/app_theme.dart';
import 'package:yivu/shared/widgets/dpad_focusable.dart';

class DashboardResumeAndRanksCards extends StatelessWidget {
  final int progressPercent;
  final String activeTaskTitle;
  final VoidCallback onResume;
  final VoidCallback onOpenLeaderboard;

  const DashboardResumeAndRanksCards({
    super.key,
    required this.progressPercent,
    required this.activeTaskTitle,
    required this.onResume,
    required this.onOpenLeaderboard,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Row(
          children: [
            // Left Card: Dynamic Resume / Progress Card
            Expanded(
              child: DPadFocusableCard(
                borderRadius: 28,
                padding: const EdgeInsets.symmetric(horizontal: 26, vertical: 22),
                backgroundColor: AppTheme.surfaceNavy,
                onSelect: onResume,
                child: SizedBox(
                  height: 140,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Top Left: Activity / Bar Chart Icon
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppTheme.cobaltBlue.withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.bar_chart_rounded,
                              color: AppTheme.cobaltBlue,
                              size: 26,
                            ),
                          ),
                          Text(
                            activeTaskTitle,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white38,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),

                      // Main Headline: Progress [X]%
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          const Text(
                            "Progress",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 26,
                              fontWeight: FontWeight.w500,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Text(
                            "$progressPercent%",
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ),

                      // Bottom Action Label: → continue
                      const Row(
                        children: [
                          Text(
                            "→ continue",
                            style: TextStyle(
                              color: AppTheme.tealAccent,
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              letterSpacing: -0.2,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(width: 20),

            // Right Card: Leaderboard Ranks (Brand Gradient Card)
            Expanded(
              child: DPadFocusableCard(
                borderRadius: 28,
                padding: const EdgeInsets.symmetric(horizontal: 26, vertical: 22),
                backgroundColor: Colors.transparent,
                onSelect: onOpenLeaderboard,
                child: Container(
                  height: 140,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        Color(0xFF8B5CF6), // Purple
                        Color(0xFF6366F1), // Indigo
                        Color(0xFF2563EB), // Cobalt Blue
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Top Left: Trophy Icon
                      Icon(
                        Icons.emoji_events_rounded,
                        color: Colors.white,
                        size: 30,
                      ),

                      // Large Bold Headline: Leaderboard Ranks
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Leaderboard",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.normal,
                              height: 1.15,
                              letterSpacing: -0.3,
                            ),
                          ),
                          Text(
                            "Ranks",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 30,
                              fontWeight: FontWeight.bold,
                              height: 1.15,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
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

