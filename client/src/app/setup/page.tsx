"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import SetupCard from "@/components/setup/SetupCard";
import ResumeUpload from "@/components/setup/ResumeUpload";
import { Brain, Zap, ChevronDown } from "lucide-react";
import { roles } from "@/lib/roles";

export default function SetupPage() {
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [roleId, setRoleId] = useState("");   // ✅ changed
    const [loading, setLoading] = useState(false);
    const [step] = useState(1);

    const router = useRouter();

    const canProceed = resumeFile && roleId;

    const handleSubmit = async () => {
        if (!resumeFile || !roleId) return;

        try {
            setLoading(true);

            const selectedRole = roles.find(r => r.id === roleId);

            if (!selectedRole) {
                alert("Invalid role selected");
                return;
            }

            const formData = new FormData();
            formData.append("file", resumeFile);

            // ✅ Send role_id only (best practice)
            formData.append("role_id", selectedRole.id);

            // Optional: if you still want to send prompt directly
            formData.append("prompt", selectedRole.promptTemplate);

            const response = await fetch("http://127.0.0.1:5000/cv", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            console.log("Response from backend:", data);

            if (response.ok) {
                router.push("/interview");
            }

        } catch (err) {
            console.error("Error during submission:", err);
        } finally {
            setLoading(false);
        }
    };

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
                    <div className="brutal-tag inline-block mb-3">
                        Setup · Step {step} of 2
                    </div>
                    <h1 className="text-4xl md:text-5xl font-grotesk font-black text-white">
                        PERSONALIZE YOUR <br />
                        <span className="text-lime">INTERVIEW</span>
                    </h1>
                </motion.div>

                <div className="space-y-6">

                    {/* Resume Upload */}
                    <SetupCard step={1} title="UPLOAD RESUME">
                        <ResumeUpload
                            file={resumeFile}
                            onFileChange={setResumeFile}
                        />
                    </SetupCard>

                    {/* Role Selection */}
                    <SetupCard step={2} title="TARGET ROLE">
                        <label className="text-white/50 text-xs block mb-2">
                            Target Role
                        </label>

                        <div className="relative">
                            <select
                                value={roleId}
                                onChange={(e) => setRoleId(e.target.value)}
                                className="w-full bg-dark border-3 border-dark-300 focus:border-lime text-white p-3 pr-10 outline-none"
                            >
                                <option value="">Select a role...</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>

                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                        </div>
                    </SetupCard>

                    {/* Submit Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <button
                            onClick={handleSubmit}
                            disabled={!canProceed || loading}
                            className={`w-full flex items-center justify-center gap-3 font-black text-lg py-5 uppercase border-3 transition-all ${
                                canProceed
                                    ? "bg-lime text-dark border-dark hover:translate-x-1 hover:translate-y-1"
                                    : "bg-dark-200 text-white/30 border-dark-300 cursor-not-allowed"
                            }`}
                        >
                            {loading ? "Processing..." : "Generate Interview Plan"}
                            {!loading && <Brain className="w-6 h-6" />}
                            {!loading && <Zap className="w-5 h-5" />}
                        </button>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}