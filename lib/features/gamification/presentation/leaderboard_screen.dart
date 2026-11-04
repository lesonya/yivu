import 'package:flutter/material.dart';
import 'package:yivu/core/theme/app_theme.dart';
import 'tv_leaderboard_podium.dart';

class LeaderboardScreen extends StatelessWidget {
  final List<Map<String, dynamic>> leaderboard;

  const LeaderboardScreen({super.key, required this.leaderboard});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkNavy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Row(
          children: [
            Icon(Icons.emoji_events_rounded, color: AppTheme.goldStar),
            SizedBox(width: 10),
            Text(
              "Household Leaderboard Ranks",
              style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Detailed Podiums
              TVLeaderboardPodium(leaderboard: leaderboard),
              const SizedBox(height: 32),
              const Text(
                "All Learner Standings",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              ...List.generate(leaderboard.length, (index) {
                final child = leaderboard[index];
                final rank = index + 1;
                final isFirst = rank == 1;

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceNavy,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isFirst ? AppTheme.goldStar.withValues(alpha: 0.5) : Colors.white12,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: isFirst ? AppTheme.goldStar.withValues(alpha: 0.2) : Colors.white10,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          "#$rank",
                          style: TextStyle(
                            color: isFirst ? AppTheme.goldStar : Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: AppTheme.cobaltBlue,
                        child: Text(
                          (child['display_name'] as String? ?? 'K')[0],
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              child['display_name'] ?? '',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            Text(
                              (child['grade_key'] as String? ?? '').toUpperCase().replaceAll('_', ' '),
                              style: const TextStyle(color: Colors.white54, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                      Row(
                        children: [
                          const Icon(Icons.bolt, color: AppTheme.xpPurple, size: 20),
                          const SizedBox(width: 4),
                          Text(
                            "${child['weekly_xp'] ?? 0} XP",
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(width: 16),
                          const Icon(Icons.star_rounded, color: AppTheme.goldStar, size: 20),
                          const SizedBox(width: 4),
                          Text(
                            "${child['weekly_stars'] ?? 0}",
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }
}
