"use client"

import { motion } from "framer-motion"
import { DollarSign, ShoppingBag, Store, Users, Ticket, ArrowUpRight, AlertTriangle} from "lucide-react";
import { useProductsControllerFindAllQuery } from "@/Redux/Services/productsAPpiService";
import { useStoreControllerFindAllQuery } from "@/Redux/Services/storeApiService";
import { useUserControllerFindAllQuery } from "@/Redux/Services/userApiService";
import { useVoucherControllerFindAllQuery } from "@/Redux/Services/voucherApiService";
import store from "@/state/store";
import { title } from "process";
import { stat } from "fs";

export default function KPICards() {
  const { data: productsData } = useProductsControllerFindAllQuery({ pageNumber: 1, limit: 100, search: ""});
  const { data: storesData } = useStoreControllerFindAllQuery({page: 1});
  const { data: usersData } = useUserControllerFindAllQuery({page: 1, limit: 100, search: undefined, userType: undefined});
  const { data: voucherData } = useVoucherControllerFindAllQuery({page: 1});

  const productsLists = productsData?.response?.body?.content || [];
  const storesCount = storesData?.response?.body?.content?.length || 0;
  const usersCount = usersData?.response?.body?.content?.length || 0;
  const vouchersCount = voucherData?.response?.body?.content?.length || 0;

  const lowStockCount = productsLists.filter((p) => (p.productQuantity || 0) < 10).length;

  const stats = [
    {
      title: "Total Revenue",
      value: "$148,920.00",
      change: "+14.2%",
      isPositive: true,
      icon: DollarSign,
      color: "bg-emerald-500.10 text-emerald-600",
    },

    {
      title: "Total Products",
      value: productsLists.length.toString(),
      subtext: `${lowStockCount} Low Stock Alert`,
      icon: ShoppingBag,
      color: "bg-blue-500/10 text-blue-600",
      warning: lowStockCount > 0,
    },

    {
      title: "Store Branches",
      value: storesCount.toString(),
      subtext: "Active Branches",
      icon: Store,
      color: "bg-indigo-500/10 text-indigo-600",
    },

    {
      title: "System Users",
      value: usersCount.toString(),
      subtext: "Staff & Managers",
      icon: Users,
      color: "bg-amber-500/10 text-amber-600",
    },

    {
      title: "Active Vouchers",
      value: vouchersCount.toString(),
      subtext: "Promotions & Discount",
      icon: Ticket,
      color: "bg-purple-500/10 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-6">
      {stats.map((stats, idx) => {
        const Icon = stats.icon;
        return (
          <motion.div
            key={stats.title}
            initial={{ opacity: 0, y: 15}}
            animate={{ opacity: 1, y:0}}
            transition={{ duration: 0.3, delay: idx * 0.05}}
            whileHover={{ y:-4, transition: { duration: 0.02 }}}
            className="bg-white rounder-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">

            <div className="flex items-center justify-between"> 
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {stats.title}
              </span>
              <div className="{`p-2 rounder-lg ${stat.color}`}">
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">
                {stats.value}
              </div>

              <div className="flex items-center gap-1 mt-1 text-xs">
                {stats.change && (
                  <span className="flex items-center font-medium text-emerald-600">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {stats.change} 
                  </span>
                )}
                {stats.warning && (
                  <span className="flex items-center font-semibold text-rose-600bg-rose-50 px-1.5 py-0.5 rounded">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {stats.subtext}
                  </span>
                )}
                {!stats.change && !stats.warning && (
                    <span className="text-slate-400 font-normal">{stats.subtext}</span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}