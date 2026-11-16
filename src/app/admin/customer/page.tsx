import { redirect } from 'next/navigation';

export default function AdminCustomerRedirect() {
  redirect('/admin/customers');
}
