"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import SetupCard from "@/components/setup/SetupCard";
import ResumeUpload from "@/components/setup/ResumeUpload";
import LevelPicker from "@/components/setup/LevelPicker";
import RoundTypePicker from "@/components/setup/RoundTypePicker";
import { Brain, Zap, ChevronDown } from "lucide-react";
import { roles, levels, roundTypes } from "@/lib/constants";

export default function SetupPage() {
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jd, setJd] = useState("");
    const [role, setRole] = useState("");
    const [level, setLevel] = useState("");
    const [rounds, setRounds] = useState<string[]>(["technical", "behavioral"]);
    const [step] = useState(1);

    const toggleRound = (id: string) => {
        setRounds(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const canProceed = resumeFile && jd.trim() && role && level && rounds.length > 0;

    return (
        <div className="min-h-screen bg-dark">
            <Navbar />
            <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center"
                >
                    <div className="brutal-tag inline-block mb-3">Setup · Step {step} of 3</div>
                    <h1 className="text-4xl md:text-5xl font-grotesk font-black text-white">
                        PERSONALIZE YOUR <br /><span className="text-lime">INTERVIEW</span>
                    </h1>
                    <p className="text-white/50 mt-3">
                        Upload your resume and job description to generate a tailored interview plan.
                    </p>
                </motion.div>

                {/* Progress Bar */}
                <div className="flex gap-2 mb-10">
                    {[1, 2, 3].map(s => (
                        <div
                            key={s}
                            className={`flex-1 h-2 border-2 border-dark-200 transition-all duration-300 ${step >= s ? "bg-lime" : "bg-dark-200"}`}
                        />
                    ))}
                </div>

                <div className="space-y-6">

                    {/* Resume Upload */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <SetupCard step={1} title="UPLOAD RESUME">
                            <ResumeUpload file={resumeFile} onFileChange={setResumeFile} />
                        </SetupCard>
                    </motion.div>

                    {/* Job Description */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <SetupCard step={2} title="JOB DESCRIPTION">
                            <textarea
                                value={jd}
                                onChange={e => setJd(e.target.value)}
                                placeholder="Paste the full job description here — role requirements, responsibilities, skills needed..."
                                rows={6}
                                className="w-full bg-dark border-3 border-dark-300 focus:border-lime text-white/80 text-sm p-4 resize-none outline-none transition-colors duration-200 font-inter placeholder:text-white/30"
                            />
                            <div className="text-right text-white/30 text-xs mt-1">{jd.length} chars</div>
                        </SetupCard>
                    </motion.div>

                    {/* Role & Level */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <SetupCard step={3} title="ROLE & EXPERIENCE">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                {/* Role Selector */}
                                <div>
                                    <label className="text-white/50 text-xs font-grotesk uppercase tracking-wide block mb-2">
                                        Target Role
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={role}
                                            onChange={e => setRole(e.target.value)}
                                            className="w-full bg-dark border-3 border-dark-300 focus:border-lime text-white p-3 pr-10 outline-none appearance-none font-grotesk text-sm"
                                        >
                                            <option value="">Select a role...</option>
                                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Level Picker */}
                                <div>
                                    <label className="text-white/50 text-xs font-grotesk uppercase tracking-wide block mb-2">
                                        Experience Level
                                    </label>
                                    <LevelPicker levels={levels} selected={level} onChange={setLevel} />
                                </div>
                            </div>

                            {/* Round Types */}
                            <div>
                                <label className="text-white/50 text-xs font-grotesk uppercase tracking-wide block mb-3">
                                    Round Types <span className="text-lime">(select all that apply)</span>
                                </label>
                                <RoundTypePicker roundTypes={roundTypes} selected={rounds} onToggle={toggleRound} />
                            </div>
                        </SetupCard>
                    </motion.div>

                    {/* Generate CTA */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <Link
                            href={canProceed ? "/interview" : "#"}
                            className={`w-full flex items-center justify-center gap-3 font-grotesk font-black text-lg py-5 uppercase tracking-wide transition-all duration-150 border-3 ${canProceed
                                    ? "bg-lime text-dark border-dark shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                                    : "bg-dark-200 text-white/30 border-dark-300 cursor-not-allowed"
                                }`}
                        >
                            <Brain className="w-6 h-6" />
                            Generate Interview Plan
                            <Zap className="w-5 h-5" />
                        </Link>
                        {!canProceed && (
                            <p className="text-white/30 text-xs text-center mt-2 font-grotesk">
                                Complete all fields above to continue
                            </p>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
