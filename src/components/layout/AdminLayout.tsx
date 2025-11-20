import { ReactNode } from "react";
import Aside from "../admin/Aside";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <Aside />
      <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-x-hidden">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
