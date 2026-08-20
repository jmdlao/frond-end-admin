import Sidebar from "@/app/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-white">
      <Sidebar />
      <div className="flex flex-col w-full h-full ml-64 p-4">
        {children}
      </div>
    </div>
  );
} 