import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../../shared/widgets/dpad_focusable.dart';

class TVLeaderboardPodium extends StatelessWidget {
  final List<Map<String, dynamic>> leaderboard;

  const TVLeaderboardPodium({super.key, required this.leaderboard});

  @override
  Widget build(BuildContext context) {
    if (leaderboard.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppTheme.surfaceNavy,
          borderRadius: BorderRadius.circular(24),
        ),
        child: const Center(
          child: Text(
            "No learners registered yet. Add child profiles to start the climb!",
            style: TextStyle(color: Colors.white70, fontSize: 16),
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Row(
              children: [
                Icon(Icons.emoji_events, color: AppTheme.goldStar, size: 28),
                SizedBox(width: 8),
                Text(
                  "Household Leaderboard (Past 7 Days)",
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: AppTheme.tealAccent.withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.tealAccent.withOpacity(0.4)),
              ),
              child: const Text(
                "PASSIVE SIBLING CHALLENGE",
                style: TextStyle(
                  color: AppTheme.tealAccent,
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                  letterSpacing: 1.0,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 190,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: leaderboard.length,
            separatorBuilder: (_, __) => const SizedBox(width: 16),
            itemBuilder: (context, index) {
              final child = leaderboard[index];
              final rank = index + 1;
              final isFirst = rank == 1;

              return DPadFocusableCard(
                borderRadius: 22,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                onSelect: () {
                  // Switch active profile or view achievements
                },
                child: SizedBox(
                  width: 220,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Badge & Rank
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: isFirst
                                  ? AppTheme.goldStar.withOpacity(0.2)
                                  : Colors.white12,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              "#$rank ${isFirst ? '👑' : ''}",
                              style: TextStyle(
                                color: isFirst ? AppTheme.goldStar : Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Text(
                            (child['grade_key'] as String? ?? '').toUpperCase().replaceAll('_', ' '),
                            style: const TextStyle(color: Colors.white54, fontSize: 13),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      // Avatar Icon / Mascot
                      CircleAvatar(
                        radius: 28,
                        backgroundColor: isFirst ? AppTheme.cobaltBlue : Colors.white10,
                        child: Text(
                          (child['display_name'] as String? ?? 'Y')[0],
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      // Name
                      Text(
                        child['display_name'] ?? 'Child',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 6),
                      // XP & Stars stats
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.bolt, color: AppTheme.xpPurple, size: 18),
                          Text(
                            "${child['weekly_xp'] ?? 0} XP",
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Icon(Icons.star_rounded, color: AppTheme.goldStar, size: 18),
                          Text(
                            "${child['weekly_stars'] ?? 0}",
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                            ),
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
}
