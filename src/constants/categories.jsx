import { 
  FiShoppingBag, 
  FiCoffee, 
  FiBox, 
  FiActivity, 
  FiTruck, 
  FiCheckCircle, 
  FiClock, 
  FiGrid
} from 'react-icons/fi';
import { 
  GiFruitBowl, 
  GiBroccoli, 
  GiMilkCarton, 
  GiCupcake, 
  GiShrimp, 
  GiSteak, 
  GiBread 
} from 'react-icons/gi';

export const CATEGORIES = [
  { id: 'fruits', name: 'Fruits', icon: <GiFruitBowl />, color: 'rose' },
  { id: 'vegetables', name: 'Vegetables', icon: <GiBroccoli />, color: 'emerald' },
  { id: 'dairy', name: 'Dairy', icon: <GiMilkCarton />, color: 'blue' },
  { id: 'beverages', name: 'Beverages', icon: <FiCoffee />, color: 'amber' },
  { id: 'snacks', name: 'Snacks', icon: <GiCupcake />, color: 'purple' },
  { id: 'seafood', name: 'Seafood', icon: <GiShrimp />, color: 'cyan' },
  { id: 'bakery', name: 'Bakery', icon: <GiBread />, color: 'orange' },
  { id: 'meat', name: 'Meat', icon: <GiSteak />, color: 'red' },
];

export const getCategoryIcon = (categoryName) => {
  const category = CATEGORIES.find(c => c.name.toLowerCase() === categoryName?.toLowerCase());
  return category ? category.icon : <FiBox />;
};

export const getCategoryColor = (categoryName) => {
  const category = CATEGORIES.find(c => c.name.toLowerCase() === categoryName?.toLowerCase());
  return category ? category.color : 'slate';
};
