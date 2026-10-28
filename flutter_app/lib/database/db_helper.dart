import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/transaction.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('daily_life_manager.db');
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

  Future _createDB(Database db, int version) async {
    // Transactions table with integer paise
    await db.execute('''
      CREATE TABLE transactions (
        id TEXT PRIMARY KEY,
        amountPaise INTEGER NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        paymentMethod TEXT NOT NULL,
        accountId TEXT NOT NULL,
        toAccountId TEXT,
        note TEXT,
        receiptPath TEXT,
        isRecurring INTEGER NOT NULL DEFAULT 0,
        recurringFrequency TEXT
      )
    ''');

    // Diet Meals table
    await db.execute('''
      CREATE TABLE meals (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        mealType TEXT NOT NULL,
        foodName TEXT NOT NULL,
        servingSize TEXT NOT NULL,
        servings REAL NOT NULL,
        calories INTEGER NOT NULL,
        proteinG REAL NOT NULL,
        carbsG REAL NOT NULL,
        fatG REAL NOT NULL,
        notes TEXT
      )
    ''');

    // Accounts table
    await db.execute('''
      CREATE TABLE accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        openingBalancePaise INTEGER NOT NULL,
        color TEXT NOT NULL
      )
    ''');

    // Water logs table
    await db.execute('''
      CREATE TABLE water_logs (
        date TEXT PRIMARY KEY,
        amountMl INTEGER NOT NULL,
        targetMl INTEGER NOT NULL
      )
    ''');

    // Seed Initial Accounts
    await db.insert('accounts', {'id': 'acc_cash', 'name': 'Cash in Hand', 'type': 'cash', 'openingBalancePaise': 450000, 'color': '#10b981'});
    await db.insert('accounts', {'id': 'acc_sbi', 'name': 'SBI Salary Account', 'type': 'bank', 'openingBalancePaise': 5200000, 'color': '#2563eb'});
    await db.insert('accounts', {'id': 'acc_hdfc', 'name': 'HDFC Savings Account', 'type': 'bank', 'openingBalancePaise': 2850000, 'color': '#0284c7'});
    await db.insert('accounts', {'id': 'acc_wallet', 'name': 'Paytm / PhonePe Wallet', 'type': 'wallet', 'openingBalancePaise': 235000, 'color': '#06b6d4'});
    await db.insert('accounts', {'id': 'acc_icici_cc', 'name': 'ICICI Amazon Pay Credit Card', 'type': 'credit_card', 'openingBalancePaise': -640000, 'color': '#f97316'});

    // Seed Sample Transactions
    final now = DateTime.now();
    final todayStr = "${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";

    await db.insert('transactions', {
      'id': 'tx_salary',
      'amountPaise': 7500000, // ₹75,000
      'type': 'income',
      'category': 'Salary',
      'subcategory': 'Monthly Salary',
      'date': todayStr,
      'time': '09:30',
      'paymentMethod': 'bank_transfer',
      'accountId': 'acc_sbi',
      'note': 'October Salary Credited',
      'isRecurring': 1,
      'recurringFrequency': 'monthly'
    });

    await db.insert('transactions', {
      'id': 'tx_rent',
      'amountPaise': 1800000, // ₹18,000
      'type': 'expense',
      'category': 'Housing & Rent',
      'subcategory': 'House Rent',
      'date': todayStr,
      'time': '11:00',
      'paymentMethod': 'bank_transfer',
      'accountId': 'acc_sbi',
      'note': 'Flat Rent to Landlord',
      'isRecurring': 1,
      'recurringFrequency': 'monthly'
    });
  }

  // Transaction Queries
  Future<int> insertTransaction(MoneyTransaction tx) async {
    final db = await instance.database;
    return await db.insert('transactions', tx.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<List<MoneyTransaction>> getAllTransactions() async {
    final db = await instance.database;
    final maps = await db.query('transactions', orderBy: 'date DESC, time DESC');
    return maps.map((m) => MoneyTransaction.fromMap(m)).toList();
  }

  Future<int> deleteTransaction(String id) async {
    final db = await instance.database;
    return await db.delete('transactions', where: 'id = ?', whereArgs: [id]);
  }

  // Meal Queries
  Future<int> insertMeal(DietMeal meal) async {
    final db = await instance.database;
    return await db.insert('meals', meal.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<List<DietMeal>> getMealsForDate(String date) async {
    final db = await instance.database;
    final maps = await db.query('meals', where: 'date = ?', whereArgs: [date]);
    return maps.map((m) => DietMeal.fromMap(m)).toList();
  }

  Future<int> deleteMeal(String id) async {
    final db = await instance.database;
    return await db.delete('meals', where: 'id = ?', whereArgs: [id]);
  }
}
