import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'database/db_helper.dart';
import 'models/transaction.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const DailyLifeManagerApp());
}

class DailyLifeManagerApp extends StatelessWidget {
  const DailyLifeManagerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Daily Life Manager',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF135BEC),
          brightness: Brightness.light,
        ),
        fontFamily: 'Roboto',
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF135BEC),
          brightness: Brightness.dark,
        ),
      ),
      themeMode: ThemeMode.system,
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  List<MoneyTransaction> _transactions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final txs = await DatabaseHelper.instance.getAllTransactions();
    setState(() {
      _transactions = txs;
      _isLoading = false;
    });
  }

  String formatINR(int paise) {
    final rupees = (paise / 100.0);
    final formatter = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2);
    return formatter.format(rupees);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final pages = [
      _buildHomeDashboard(),
      _buildTransactionsView(),
      _buildReportsView(),
      _buildDietView(),
      _buildSettingsView(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Daily Life Manager', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
        ],
      ),
      body: pages[_currentIndex],
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddTransactionDialog,
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        child: const Icon(Icons.add),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: 'Passbook'),
          NavigationDestination(icon: Icon(Icons.bar_chart_outlined), selectedIcon: Icon(Icons.bar_chart), label: 'Reports'),
          NavigationDestination(icon: Icon(Icons.restaurant_outlined), selectedIcon: Icon(Icons.restaurant), label: 'Diet'),
          NavigationDestination(icon: Icon(Icons.settings_outlined), selectedIcon: Icon(Icons.settings), label: 'Settings'),
        ],
      ),
    );
  }

  Widget _buildHomeDashboard() {
    int totalIncomePaise = _transactions.where((t) => t.type == TransactionType.income).fold(0, (s, t) => s + t.amountPaise);
    int totalExpensePaise = _transactions.where((t) => t.type == TransactionType.expense).fold(0, (s, t) => s + t.amountPaise);
    int netBalancePaise = 10000000 + (totalIncomePaise - totalExpensePaise); // Starting balance ₹1,00,000

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Balance Card
        Card(
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          color: const Color(0xFF135BEC),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Total Available Balance', style: TextStyle(color: Colors.white70, fontSize: 13)),
                const SizedBox(height: 6),
                Text(formatINR(netBalancePaise), style: const TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          const Icon(Icons.arrow_upward, color: Colors.greenAccent, size: 18),
                          const SizedBox(width: 6),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Income', style: TextStyle(color: Colors.white70, fontSize: 11)),
                              Text(formatINR(totalIncomePaise), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                            ],
                          )
                        ],
                      ),
                    ),
                    Expanded(
                      child: Row(
                        children: [
                          const Icon(Icons.arrow_downward, color: Colors.redAccent, size: 18),
                          const SizedBox(width: 6),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Expenses', style: TextStyle(color: Colors.white70, fontSize: 11)),
                              Text(formatINR(totalExpensePaise), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                            ],
                          )
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Recent Transactions Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Recent Transactions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            TextButton(onPressed: () => setState(() => _currentIndex = 1), child: const Text('View All')),
          ],
        ),
        ..._transactions.take(5).map((tx) {
          final isIncome = tx.type == TransactionType.income;
          return Card(
            margin: const EdgeInsets.symmetric(vertical: 4),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: isIncome ? Colors.green.withOpacity(0.15) : Colors.red.withOpacity(0.15),
                child: Icon(isIncome ? Icons.arrow_downward : Icons.arrow_upward, color: isIncome ? Colors.green : Colors.red, size: 18),
              ),
              title: Text(tx.note ?? tx.category, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              subtitle: Text("${tx.date} · ${tx.paymentMethod.toUpperCase()}", style: const TextStyle(fontSize: 11)),
              trailing: Text(
                "${isIncome ? '+' : '-'}${formatINR(tx.amountPaise)}",
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isIncome ? Colors.green : Colors.red),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildTransactionsView() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _transactions.length,
      itemBuilder: (context, index) {
        final tx = _transactions[index];
        final isIncome = tx.type == TransactionType.income;
        return Card(
          margin: const EdgeInsets.symmetric(vertical: 4),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: isIncome ? Colors.green.withOpacity(0.15) : Colors.red.withOpacity(0.15),
              child: Icon(isIncome ? Icons.arrow_downward : Icons.arrow_upward, color: isIncome ? Colors.green : Colors.red, size: 18),
            ),
            title: Text(tx.note ?? tx.category, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            subtitle: Text("${tx.date} · ${tx.paymentMethod.toUpperCase()} · ${tx.category}", style: const TextStyle(fontSize: 11)),
            trailing: Text(
              "${isIncome ? '+' : '-'}${formatINR(tx.amountPaise)}",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isIncome ? Colors.green : Colors.red),
            ),
          ),
        );
      },
    );
  }

  Widget _buildReportsView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.pie_chart, size: 64, color: Color(0xFF135BEC)),
            const SizedBox(height: 16),
            const Text('Financial & Nutrition Analytics', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Track monthly trends, payment method breakdowns, and category expenses accurately in integer paise.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Widget _buildDietView() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: const Padding(
            padding: EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(children: [Text('Calories', style: TextStyle(fontSize: 12, color: Colors.grey)), Text('1,420 kcal', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold))]),
                Column(children: [Text('Water', style: TextStyle(fontSize: 12, color: Colors.grey)), Text('2,250 ml', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.cyan))]),
                Column(children: [Text('Weight', style: TextStyle(fontSize: 12, color: Colors.grey)), Text('68.4 kg', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.green))]),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        const ListTile(title: Text('Today Meals', style: TextStyle(fontWeight: FontWeight.bold))),
        Card(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: const ListTile(
            leading: Icon(Icons.breakfast_dining, color: Colors.amber),
            title: Text('Roti & Dal Tadka (2 rotis + 1 bowl dal)'),
            subtitle: Text('Breakfast · 369 kcal · 15g Protein'),
          ),
        ),
      ],
    );
  }

  Widget _buildSettingsView() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        ListTile(leading: Icon(Icons.security), title: Text('4-Digit App Lock PIN'), subtitle: Text('Enabled (Default: 1234)')),
        ListTile(leading: Icon(Icons.currency_rupee), title: Text('Currency'), subtitle: Text('INR (₹) - Integer Paise Storage')),
        ListTile(leading: Icon(Icons.storage), title: Text('Local SQLite Database'), subtitle: Text('Stored offline in daily_life_manager.db')),
      ],
    );
  }

  void _showAddTransactionDialog() {
    final amountController = TextEditingController();
    final noteController = TextEditingController();
    String category = 'Food & Dining';
    String paymentMethod = 'upi';
    TransactionType type = TransactionType.expense;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 20, right: 20, top: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Add Transaction', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            TextField(
              controller: amountController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(labelText: 'Amount (₹)', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: noteController,
              decoration: const InputDecoration(labelText: 'Description / Note', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () async {
                final amt = double.tryParse(amountController.text) ?? 0.0;
                if (amt <= 0) return;
                final paise = (amt * 100).round();
                final now = DateTime.now();
                final todayStr = "${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";

                final tx = MoneyTransaction(
                  id: "tx_${DateTime.now().millisecondsSinceEpoch}",
                  amountPaise: paise,
                  type: type,
                  category: category,
                  date: todayStr,
                  time: "${now.hour}:${now.minute.toString().padLeft(2, '0')}",
                  paymentMethod: paymentMethod,
                  accountId: 'acc_sbi',
                  note: noteController.text.trim(),
                );

                await DatabaseHelper.instance.insertTransaction(tx);
                Navigator.pop(ctx);
                _loadData();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF135BEC),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Save Transaction', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
