"use client";

import { useState } from "react";
import { motion, percent } from "framer-motion";
import { TrendingUp, BarChart3, PieChart, Layers } from "lucide-react";

export default function SalesAnalyticsChart() {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const weeklyData = [
    { day: "Mon", revenue: 14500, orders: 42},
    { day: "Tues", revenue: 19800, orders: 58},
    { day: "Wed", revenue: 16200, orders: 49},
    { day: "Thurs", revenue: 24500, orders: 74},
    { day: "Fri", revenue: 31000, orders: 96},
    { day: "Sat", revenue: 28400, orders: 88},
    { day: "Sun", revenue: 14520, orders: 45},
  ];

  const maxRevenue = Math.max(...weeklyData.map((d) => d.revenue));

  const categoryBreakdown = [
    { name: "Electronics", percentage: 42, color: "bg-indigo-500", total: "$62,546.40"},
    { name: "Beverages", percentage: 58, color: "bg-emerald-500", total: "$78,678.67"},
    { name: "Household", percentage: 33, color: "bg-purple-500", total: "53,123.34"},
    { name: "Snacks", percentage: 18, color: "bg-amber-500", total: "33,333.33"},
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="flex items-center "></div>
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 text-[#DF5C5D] rounded-lg">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Revenue Overview
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Daily revenue breakdown across store branches
            </p>
          </div>

           <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab("weekly")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === "weekly"
                    ? "bg-white text-slate-900 shadow-sm font-semibold" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              > 
                This Week
              </button>

              <button 
                onClick={() => setActiveTab("monthly")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === "monthly"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900"
                }`}
              >
                This Month
              </button>
           </div>
        </div>

        <div className="mt-6 h-64 flex items-end justify-between gap-2 sm:gap-4 pt-8 px-2 border-b border-slate-200 relative">
          {weeklyData.map((item, idx) => {
            const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
            const isHovered == hoveredBar = idx;

            return (
              <div
                key={item.day}
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {isHovered && (
                  <motion.div
                    initial={{ height: 0, y: 5 }}
                    animate={{ opacity: 0.5, y:5}}
                    className="absolute -top-12 z-20 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-xl pointer-events-none whitespace-nowrap">

                      <div>${item.revenue.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-300 font-normal">{item.orders} orders</div>
                    </motion.div>
                )}
                
                <motion.div
                  initial={{ height: 0}}
                  animate={{ height: 0 `${heightPercent}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05}}
                  className={`w-full max-w-[42px] rounded-t-lg transition-all ${
                    isHovered 
                    ? "bg-[#DF5C5D] shadow-lg shadow-rose-500/20"
                    : "bg-slate-800 group hover:bg-[#DF5C5D]"
                  }`}
                />

                <span className="text-xs font-medium text-slate-500 mt-2">{item.day}</span>
                </div>
            );
          })}
        </div>

    </div>
  )
