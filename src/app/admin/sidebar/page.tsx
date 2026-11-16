import AdminSidebar from '@/components/AdminSidebar';

export const metadata = {
  title: 'Super Gas | Admin Sidebar Navigation',
  description: 'Super Gas Logistics Core - Admin Sidebar Navigation Component',
};

export default function AdminSidebarPage() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4 sm:p-8">
      <div className="w-[280px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/90">
        <AdminSidebar className="w-full border-none rounded-none min-h-[720px]" />
      </div>
    </div>
  );
}
