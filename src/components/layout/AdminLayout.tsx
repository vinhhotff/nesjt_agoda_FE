import { ReactNode } from "react";
import Aside from "../admin/Aside";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <Aside />
      <main className="flex-1 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
