"use client";

import { Button } from "@/components/ui/button";
import { clearAccessTokenCookie } from "@/state/accessCookies";
import {
  LayoutDashboard,
  LogOut,
  LucideIcon,
  ShoppingBasket,
  Store,
  Ticket,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SidebarItem from "../items";

interface ISidebarItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

const items = [
  {
    name: "Overview",
    path: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    name: "Users",
    path: "/users",
    icon: User,
  },

  {
    name: "Store Branch",
    path: "/store",
    icon: Store,
  },

  {
    name: "Products",
    path: "/products",
    icon: ShoppingBasket,
  },
  {
    name: "Voucher",
    path: "/voucher",
    icon: Ticket,
  },
];

const Sidebar = () => {
  const router = useRouter();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleLogout = () => {
    clearAccessTokenCookie();
    router.push("/login");
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-md z-10 p-6">
      <div className="flex flex-col h-full">
        <div className="space-y-5 w-full">
          <img
            className="h-11 w-fit mx-auto"
            src="/logo-black.png"
            alt="logo"
          />
          <div className="flex flex-col space-y-2">
            {items.map((item) => (
              <SidebarItem key={item.path} item={item} />
            ))}
          </div>
        </div>
        {/* Logout Button */}
        <div className="mt-auto pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
