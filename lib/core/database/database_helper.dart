import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('yivu_local.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    // 1. Execute SQL schema script
    final schemaSql = await rootBundle.loadString('assets/data/schema.sql');
    final statements = schemaSql
        .split(';')
        .map((s) => s.trim())
        .where((s) => s.isNotEmpty && !s.startsWith('--'));

    for (final statement in statements) {
      await db.execute(statement);
    }

    // 2. Pre-populate Curriculum taxonomy & Baseline Seed materials
    await _seedCurriculum(db);
    await _seedMaterials(db);
  }

  Future<void> _seedCurriculum(Database db) async {
    final rawJson = await rootBundle.loadString('assets/data/curriculum.json');
    final data = json.decode(rawJson) as Map<String, dynamic>;
    final divisions = data['divisions'] as List<dynamic>;

    final batch = db.batch();

    for (final div in divisions) {
      batch.insert(
        'curriculum_divisions',
        {'id': div['id'], 'name': div['name']},
        conflictAlgorithm: ConflictAlgorithm.replace,
      );

      final subjects = div['subjects'] as List<dynamic>;
      for (final sub in subjects) {
        batch.insert(
          'subjects',
          {
            'id': sub['id'],
            'division_id': div['id'],
            'name': sub['name'],
            'code': sub['code'],
            'icon': sub['icon'],
            'accent_color': sub['accent_color'],
          },
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
    }

    await batch.commit(noResult: true);
  }

  Future<void> _seedMaterials(Database db) async {
    final rawJson = await rootBundle.loadString('assets/data/seed_materials.json');
    final data = json.decode(rawJson) as Map<String, dynamic>;
    final materials = data['seed_materials'] as List<dynamic>;

    final batch = db.batch();

    for (final mat in materials) {
      batch.insert(
        'learning_materials',
        {
          'id': mat['id'],
          'grade_key': mat['grade_key'],
          'subject_id': mat['subject_id'],
          'title': mat['title'],
          'type': mat['type'],
          'reading_content': mat['reading_content'],
          'is_precompiled': 1,
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );

      final questions = mat['questions'] as List<dynamic>;
      for (final q in questions) {
        batch.insert(
          'questions',
          {
            'id': q['id'],
            'material_id': mat['id'],
            'prompt': q['prompt'],
            'options_json': json.encode(q['options']),
            'correct_index': q['correct_index'],
            'explanation': q['explanation'],
          },
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
    }

    await batch.commit(noResult: true);
  }

  // Helper: Fetch weekly leaderboard for Android TV Home
  Future<List<Map<String, dynamic>>> getWeeklyLeaderboard() async {
    final db = await instance.database;
    return await db.rawQuery('SELECT * FROM v_weekly_leaderboard');
  }
}

