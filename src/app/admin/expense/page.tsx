import AdminExpensesPage from '@/components/AdminExpensesPage';

export const metadata = {
  title: 'Expenses | Super Gas Logistics Core',
  description: 'Manage delivery partner expenses, agency operating costs, and miscellaneous expenses from one centralized ledger.',
};

export default function ExpenseRoute() {
  return <AdminExpensesPage />;
}
