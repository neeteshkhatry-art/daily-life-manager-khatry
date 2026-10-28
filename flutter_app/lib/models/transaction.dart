/// Daily Life Manager - Domain Models with Integer Paise Precision
/// Storing money as integer paise prevents floating-point rounding errors.

enum TransactionType { income, expense, transfer }

class MoneyTransaction {
  final String id;
  final int amountPaise; // 1 INR = 100 paise
  final TransactionType type;
  final String category;
  final String? subcategory;
  final String date; // YYYY-MM-DD
  final String time; // HH:mm
  final String paymentMethod; // upi, cash, bank_transfer, debit_card, credit_card
  final String accountId;
  final String? toAccountId;
  final String? note;
  final String? receiptPath;
  final bool isRecurring;
  final String? recurringFrequency;

  MoneyTransaction({
    required this.id,
    required this.amountPaise,
    required this.type,
    required this.category,
    this.subcategory,
    required this.date,
    required this.time,
    required this.paymentMethod,
    required this.accountId,
    this.toAccountId,
    this.note,
    this.receiptPath,
    this.isRecurring = false,
    this.recurringFrequency,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'amountPaise': amountPaise,
      'type': type.name,
      'category': category,
      'subcategory': subcategory,
      'date': date,
      'time': time,
      'paymentMethod': paymentMethod,
      'accountId': accountId,
      'toAccountId': toAccountId,
      'note': note,
      'receiptPath': receiptPath,
      'isRecurring': isRecurring ? 1 : 0,
      'recurringFrequency': recurringFrequency,
    };
  }

  factory MoneyTransaction.fromMap(Map<String, dynamic> map) {
    return MoneyTransaction(
      id: map['id'],
      amountPaise: map['amountPaise'],
      type: TransactionType.values.byName(map['type']),
      category: map['category'],
      subcategory: map['subcategory'],
      date: map['date'],
      time: map['time'],
      paymentMethod: map['paymentMethod'],
      accountId: map['accountId'],
      toAccountId: map['toAccountId'],
      note: map['note'],
      receiptPath: map['receiptPath'],
      isRecurring: map['isRecurring'] == 1,
      recurringFrequency: map['recurringFrequency'],
    );
  }

  double get amountRupees => amountPaise / 100.0;
}

class DietMeal {
  final String id;
  final String date;
  final String time;
  final String mealType; // breakfast, lunch, dinner, morning_snack, evening_snack
  final String foodName;
  final String servingSize;
  final double servings;
  final int calories;
  final double proteinG;
  final double carbsG;
  final double fatG;
  final String? notes;

  DietMeal({
    required this.id,
    required this.date,
    required this.time,
    required this.mealType,
    required this.foodName,
    required this.servingSize,
    required this.servings,
    required this.calories,
    required this.proteinG,
    required this.carbsG,
    required this.fatG,
    this.notes,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'date': date,
      'time': time,
      'mealType': mealType,
      'foodName': foodName,
      'servingSize': servingSize,
      'servings': servings,
      'calories': calories,
      'proteinG': proteinG,
      'carbsG': carbsG,
      'fatG': fatG,
      'notes': notes,
    };
  }

  factory DietMeal.fromMap(Map<String, dynamic> map) {
    return DietMeal(
      id: map['id'],
      date: map['date'],
      time: map['time'],
      mealType: map['mealType'],
      foodName: map['foodName'],
      servingSize: map['servingSize'],
      servings: (map['servings'] as num).toDouble(),
      calories: map['calories'],
      proteinG: (map['proteinG'] as num).toDouble(),
      carbsG: (map['carbsG'] as num).toDouble(),
      fatG: (map['fatG'] as num).toDouble(),
      notes: map['notes'],
    );
  }
}
