"use client";

import { motion } from "framer-motion";
import { brandConfig } from "@/config/brand.config";
import {
  Wrench,
  Zap,
  Sparkles,
  Wind,
  Hammer,
  ShieldCheck,
} from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const POPULAR_SERVICES = [
  {
    title: "Plumbing",
    desc: "Pipe leaks, tap fixtures, unclogging & bathroom repairs",
    icon: Wrench,
    startingPrice: 2500,
  },
  {
    title: "Electrical Work",
    desc: "Wiring, short circuits, switchboard & breaker repairs",
    icon: Zap,
    startingPrice: 2000,
  },
  {
    title: "House Cleaning",
    desc: "Deep cleaning, floor scrubbing & kitchen sanitization",
    icon: Sparkles,
    startingPrice: 4000,
  },
  {
    title: "AC Servicing",
    desc: "Gas filling, filter cleaning & cooling troubleshooting",
    icon: Wind,
    startingPrice: 3500,
  },
  {
    title: "Carpentry",
    desc: "Door lock fixing, furniture repair & custom timber jobs",
    icon: Hammer,
    startingPrice: 2500,
  },
  {
    title: "Home Maintenance",
    desc: "Roof leak repairs, painting touch-ups & general handymen",
    icon: ShieldCheck,
    startingPrice: 2000,
  },
];

export function ServicesGrid() {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {POPULAR_SERVICES.map((item) => {
        const Icon = item.icon;
        return (
          <motion.a
            key={item.title}
            href="#request-wizard"
            className="group rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-emerald-500/50 hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900"
            variants={itemVariants}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors dark:bg-emerald-950 dark:text-emerald-400">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-zinc-500 leading-relaxed dark:text-zinc-400">
              {item.desc}
            </p>
            <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              <span>Starting from</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                {brandConfig.currency.symbol} {item.startingPrice.toLocaleString()}
              </span>
            </div>
          </motion.a>
        );
      })}
    </motion.div>
  );
}
