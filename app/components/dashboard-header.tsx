"use client";

import { Button } from "@/components/ui/button";
import { RefreshCcw, Store, Calendar } from "lucide-react";
import {useState, useEffect} from "react";

export default function DashboardHeader ({ onRefresh }: {
  onRefresh?: () => void }) { 
    const [currentDate, setCurrentDate] = useState("");

    useEffect(() => {
      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setCurrentDate(today);
    }, []);
    
    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Welcome Back, Admin!
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{currentDate || "Loading Date..."}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2 text-sm text-slate-700">
            <Store className="h-4 w-4 text-[#DF5C5D]"/>
            <select className="bg-transparent focus:outline-none cursor-pointer font-medium">
              <option value="all">All Store Branches</option>
              <option value="main">Main Branch</option>
            </select>
          </div>

          <Button
            variant={"outline"}
            size={"sm"}
            onClick={onRefresh}
            className="h-10 border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm cursor-pointer"
          >

            <RefreshCcw className="h-4 w-4 mr-2"/>
              Refresh
          </Button>
        </div>
      </div>
    );
  }