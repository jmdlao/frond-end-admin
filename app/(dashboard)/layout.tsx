import Sidebar from "@/app/components/sidebar";

export default function DashboardLayout({ children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-slate-50/60 text-slate-800">
      <Sidebar />
      
      <main className="flex-1 min-w-0 flex flex-col h-full ml-64 overflow-y-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}