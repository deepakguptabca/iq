"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import StatCard from "@/components/ui/StatCard";
import SessionRow from "@/components/ui/SessionRow";
import SkillBar from "@/components/ui/SkillBar";
import {
    Brain, TrendingUp, Clock, Zap, Flame, BarChart3,
} from "lucide-react";
import { recentSessions, skills, upcomingTips } from "@/lib/constants";

const keyStats = [
    { label: "Total Sessions", val: "24", icon: Brain, delta: "+3 this week" },
    { label: "Avg Score", val: "79%", icon: BarChart3, delta: "+4% vs last week" },
    { label: "Current Streak", val: "5 Days", icon: Flame, delta: "Personal best!" },
    { label: "Time Practiced", val: "18h", icon: Clock, delta: "+2h this week" },
];

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-dark">
            <Navbar />
            <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="brutal-tag inline-block mb-3">Dashboard</div>
                    <h1 className="text-4xl md:text-5xl font-grotesk font-black text-white">
                        WELCOME BACK, <span className="text-lime">SHIVAM</span> 👋
                    </h1>
                    <p className="text-white/50 mt-2">You&apos;re on a 5-day streak. Keep going!</p>
                </motion.div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {keyStats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                        >
                            <StatCard
                                label={stat.label}
                                value={stat.val}
                                icon={stat.icon}
                                delta={stat.delta}
                            />
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Recent Sessions */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 bg-card border-3 border-white shadow-brutal-white p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-grotesk font-black text-xl text-white">RECENT SESSIONS</h2>
                            <Link href="/setup" className="brutal-tag hover:bg-dark hover:text-lime transition-colors duration-150">
                                + New
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentSessions.map((s, i) => (
                                <SessionRow key={i} {...s} index={i} />
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Column */}
                    <div className="space-y-6">

                        {/* Quick Start */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-lime border-3 border-dark shadow-[4px_4px_0px_#000] p-6"
                        >
                            <h3 className="font-grotesk font-black text-dark text-lg mb-2">START NEW SESSION</h3>
                            <p className="text-dark/60 text-sm mb-5">Upload your resume + JD and practice with an AI interviewer.</p>
                            <Link
                                href="/setup"
                                className="bg-dark text-lime font-grotesk font-black border-3 border-dark px-5 py-3 flex items-center justify-center gap-2 hover:bg-dark/80 transition-colors text-sm uppercase"
                            >
                                <Zap className="w-4 h-4" /> Start Now
                            </Link>
                        </motion.div>

                        {/* Skill Breakdown */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-card border-3 border-white shadow-brutal-white p-6"
                        >
                            <h3 className="font-grotesk font-black text-white text-lg mb-5">SKILL BREAKDOWN</h3>
                            <div className="space-y-4">
                                {skills.map(skill => (
                                    <SkillBar key={skill.name} name={skill.name} score={skill.score} color={skill.color} />
                                ))}
                            </div>
                        </motion.div>

                        {/* AI Tips */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-card border-3 border-lime shadow-brutal p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-lime" />
                                <h3 className="font-grotesk font-black text-white text-lg">AI TIPS</h3>
                            </div>
                            <ul className="space-y-3">
                                {upcomingTips.map((tip, i) => (
                                    <li key={i} className="flex gap-2 text-xs text-white/60 leading-relaxed">
                                        <span className="text-lime font-black mt-0.5">→</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
