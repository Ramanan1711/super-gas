import { redirect } from 'next/navigation';

export default function ExpenseRoute() {
  redirect('/admin/expenses');
}
