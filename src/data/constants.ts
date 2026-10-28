import { FoodDatabaseItem } from '../types';

export interface CategoryDef {
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
}

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  {
    name: 'Food & Dining',
    icon: 'UtensilsCrossed',
    color: '#f97316',
    subcategories: ['Groceries', 'Vegetables & Sabzi', 'Milk & Dairy', 'Dining Out', 'Street Food / Snacks', 'Swiggy / Zomato', 'Tea & Coffee']
  },
  {
    name: 'Utilities',
    icon: 'Zap',
    color: '#eab308',
    subcategories: ['Electricity Bill', 'Water Bill', 'Gas (LPG / PNG)', 'Mobile Recharge', 'Broadband / Wi-Fi', 'DTH / Cable']
  },
  {
    name: 'Housing & Rent',
    icon: 'Home',
    color: '#8b5cf6',
    subcategories: ['House Rent', 'Society Maintenance', 'Repairs & Plumber', 'Furniture & Decor']
  },
  {
    name: 'Transport & Fuel',
    icon: 'Car',
    color: '#06b6d4',
    subcategories: ['Petrol / Diesel', 'CNG', 'Metro & Bus', 'Auto & Cab (Uber / Ola)', 'Vehicle Maintenance', 'Toll & Parking']
  },
  {
    name: 'Health & Medical',
    icon: 'HeartPulse',
    color: '#ef4444',
    subcategories: ['Medicines & Pharmacy', 'Doctor Consultation', 'Diagnostic Lab Tests', 'Health Insurance']
  },
  {
    name: 'Education',
    icon: 'GraduationCap',
    color: '#3b82f6',
    subcategories: ['School / College Fees', 'Books & Stationery', 'Courses & Coaching', 'Tutors']
  },
  {
    name: 'Shopping & Personal',
    icon: 'ShoppingBag',
    color: '#ec4899',
    subcategories: ['Clothing & Footwear', 'Electronics & Gadgets', 'Personal Care & Salon', 'Household Essentials']
  },
  {
    name: 'Entertainment & OTT',
    icon: 'Film',
    color: '#a855f7',
    subcategories: ['Movies & Outings', 'Netflix / Prime / Hotstar', 'Gaming', 'Events']
  },
  {
    name: 'Loans & EMI',
    icon: 'CreditCard',
    color: '#64748b',
    subcategories: ['Home Loan EMI', 'Personal Loan EMI', 'Car/Bike EMI', 'Credit Card Bill']
  },
  {
    name: 'Miscellaneous',
    icon: 'MoreHorizontal',
    color: '#71717a',
    subcategories: ['Gifts & Shagun', 'Puja & Festival', 'Charity & Donation', 'Other Expenses']
  }
];

export const INCOME_CATEGORIES: CategoryDef[] = [
  {
    name: 'Salary',
    icon: 'Briefcase',
    color: '#10b981',
    subcategories: ['Monthly Salary', 'Performance Bonus', 'Overtime']
  },
  {
    name: 'Business',
    icon: 'Building2',
    color: '#059669',
    subcategories: ['Store Revenue', 'Client Invoice', 'Consulting']
  },
  {
    name: 'Freelance & Gig',
    icon: 'Laptop',
    color: '#14b8a6',
    subcategories: ['Design/Coding Work', 'Writing', 'Consultancy']
  },
  {
    name: 'Interest & Returns',
    icon: 'TrendingUp',
    color: '#3b82f6',
    subcategories: ['Bank Savings Interest', 'FD / RD Interest', 'Stock / Mutual Fund Dividend']
  },
  {
    name: 'Rental Income',
    icon: 'Key',
    color: '#8b5cf6',
    subcategories: ['House Rent Received', 'Commercial Property']
  },
  {
    name: 'Gifts & Shagun',
    icon: 'Gift',
    color: '#f43f5e',
    subcategories: ['Festival Gift', 'Birthday / Wedding', 'Family Support']
  },
  {
    name: 'Refunds & Cashback',
    icon: 'RotateCcw',
    color: '#eab308',
    subcategories: ['UPI Cashback', 'E-commerce Refund', 'Tax Refund']
  },
  {
    name: 'Other Income',
    icon: 'PlusCircle',
    color: '#6b7280',
    subcategories: ['Asset Sale', 'Misc']
  }
];

export const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI (GPay / PhonePe / Paytm)', icon: 'Smartphone' },
  { id: 'cash', label: 'Cash in Hand', icon: 'Banknote' },
  { id: 'bank_transfer', label: 'Bank Transfer (IMPS / NEFT)', icon: 'Building' },
  { id: 'debit_card', label: 'Debit Card', icon: 'CreditCard' },
  { id: 'credit_card', label: 'Credit Card', icon: 'CreditCard' }
] as const;

export const INITIAL_FOOD_DATABASE: FoodDatabaseItem[] = [
  {
    id: 'food_roti',
    name: 'Roti / Chapati (Wheat)',
    category: 'Grains & Breads',
    servingSize: '1 medium roti (35g)',
    defaultServings: 2,
    caloriesPerServing: 104,
    proteinG: 3.1,
    carbsG: 18.5,
    fatG: 0.9
  },
  {
    id: 'food_dal_tadka',
    name: 'Dal Tadka (Toor / Moong)',
    category: 'Lentils & Curries',
    servingSize: '1 bowl (150g)',
    defaultServings: 1,
    caloriesPerServing: 165,
    proteinG: 9.0,
    carbsG: 22.0,
    fatG: 4.5
  },
  {
    id: 'food_rice',
    name: 'Steamed Basmati Rice',
    category: 'Grains & Breads',
    servingSize: '1 medium bowl (150g)',
    defaultServings: 1,
    caloriesPerServing: 195,
    proteinG: 4.1,
    carbsG: 44.0,
    fatG: 0.4
  },
  {
    id: 'food_paneer_masala',
    name: 'Paneer Butter Masala',
    category: 'Dairy & Curries',
    servingSize: '1 bowl (150g)',
    defaultServings: 1,
    caloriesPerServing: 340,
    proteinG: 14.0,
    carbsG: 11.0,
    fatG: 27.0
  },
  {
    id: 'food_idli',
    name: 'Idli (Rice & Urad dal)',
    category: 'South Indian',
    servingSize: '2 idlis with sambar (120g)',
    defaultServings: 1,
    caloriesPerServing: 160,
    proteinG: 4.8,
    carbsG: 32.0,
    fatG: 1.2
  },
  {
    id: 'food_masala_dosa',
    name: 'Masala Dosa',
    category: 'South Indian',
    servingSize: '1 medium dosa with potato masala',
    defaultServings: 1,
    caloriesPerServing: 280,
    proteinG: 5.5,
    carbsG: 42.0,
    fatG: 10.0
  },
  {
    id: 'food_poha',
    name: 'Kanda Poha (Flattened rice)',
    category: 'Breakfast & Snacks',
    servingSize: '1 bowl with peanuts (150g)',
    defaultServings: 1,
    caloriesPerServing: 210,
    proteinG: 4.2,
    carbsG: 36.0,
    fatG: 5.8
  },
  {
    id: 'food_upma',
    name: 'Vegetable Upma (Rava)',
    category: 'Breakfast & Snacks',
    servingSize: '1 bowl (150g)',
    defaultServings: 1,
    caloriesPerServing: 220,
    proteinG: 5.0,
    carbsG: 35.0,
    fatG: 6.5
  },
  {
    id: 'food_egg_bhurji',
    name: 'Egg Bhurji (2 Eggs)',
    category: 'Eggs & Poultry',
    servingSize: '2 eggs with onion and tomato',
    defaultServings: 1,
    caloriesPerServing: 220,
    proteinG: 14.0,
    carbsG: 4.0,
    fatG: 16.0
  },
  {
    id: 'food_chicken_curry',
    name: 'Chicken Curry (Home-style)',
    category: 'Eggs & Poultry',
    servingSize: '1 bowl with gravy (180g)',
    defaultServings: 1,
    caloriesPerServing: 290,
    proteinG: 26.0,
    carbsG: 7.0,
    fatG: 18.0
  },
  {
    id: 'food_curd',
    name: 'Plain Curd / Dahi',
    category: 'Dairy & Curries',
    servingSize: '1 cup (150g)',
    defaultServings: 1,
    caloriesPerServing: 98,
    proteinG: 5.2,
    carbsG: 7.0,
    fatG: 4.5
  },
  {
    id: 'food_chana_masala',
    name: 'Chana Masala (Chickpeas)',
    category: 'Lentils & Curries',
    servingSize: '1 bowl (150g)',
    defaultServings: 1,
    caloriesPerServing: 240,
    proteinG: 10.0,
    carbsG: 35.0,
    fatG: 6.5
  },
  {
    id: 'food_sprouts',
    name: 'Moong Sprout Salad',
    category: 'Salads & Healthy',
    servingSize: '1 medium bowl (120g)',
    defaultServings: 1,
    caloriesPerServing: 120,
    proteinG: 7.5,
    carbsG: 19.0,
    fatG: 1.5
  },
  {
    id: 'food_chai',
    name: 'Masala Chai with Milk & Sugar',
    category: 'Beverages',
    servingSize: '1 standard cup (150ml)',
    defaultServings: 1,
    caloriesPerServing: 95,
    proteinG: 2.8,
    carbsG: 12.0,
    fatG: 3.5
  },
  {
    id: 'food_apple',
    name: 'Fresh Apple',
    category: 'Fruits',
    servingSize: '1 medium apple (150g)',
    defaultServings: 1,
    caloriesPerServing: 78,
    proteinG: 0.4,
    carbsG: 20.6,
    fatG: 0.3
  },
  {
    id: 'food_banana',
    name: 'Banana',
    category: 'Fruits',
    servingSize: '1 medium banana (118g)',
    defaultServings: 1,
    caloriesPerServing: 105,
    proteinG: 1.3,
    carbsG: 27.0,
    fatG: 0.3
  },
  {
    id: 'food_almonds',
    name: 'Almonds (Badam)',
    category: 'Dry Fruits & Nuts',
    servingSize: '10 nuts (12g)',
    defaultServings: 1,
    caloriesPerServing: 70,
    proteinG: 2.5,
    carbsG: 2.6,
    fatG: 6.1
  },
  {
    id: 'food_oats',
    name: 'Oats with Milk & Honey',
    category: 'Breakfast & Snacks',
    servingSize: '1 bowl (40g oats + 150ml milk)',
    defaultServings: 1,
    caloriesPerServing: 235,
    proteinG: 8.5,
    carbsG: 38.0,
    fatG: 4.5
  }
];
