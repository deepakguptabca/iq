"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import InterviewHeader from "@/components/interview/InterviewHeader";
import ChatMessage, { type Message } from "@/components/interview/ChatMessage";
import TypingIndicator from "@/components/interview/TypingIndicator";
import ChatInput from "@/components/interview/ChatInput";
import InterviewSidebar from "@/components/interview/InterviewSidebar";
import { aiResponses } from "@/lib/constants";

const initialMessages: Message[] = [
    {
        id: 1,
        role: "ai",
        content: "Hello! I'm your AI interviewer today. I've reviewed your resume and the Frontend Engineer role at Google. We'll start with some behavioral questions, then move to technical. Ready to begin?",
        timestamp: "10:00 AM",
    },
    {
        id: 2,
        role: "user",
        content: "Yes, I'm ready!",
        timestamp: "10:01 AM",
    },
    {
        id: 3,
        role: "ai",
        content: "Great! Let's start with a classic. Tell me about yourself — specifically focus on your most impactful technical projects and what drove your engineering decisions.",
        timestamp: "10:01 AM",
    },
];

const rounds = [
    { id: "behavioral", label: "Behavioral", done: false, active: true },
    { id: "technical", label: "Technical", done: false, active: false },
    { id: "system", label: "System Design", done: false, active: false },
];

export default function InterviewPage() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isMicOn, setIsMicOn] = useState(false);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isAiTyping]);

    useEffect(() => {
        const timer = setInterval(() => setElapsed(p => p + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const sendMessage = () => {
        if (!input.trim()) return;
        const newMsg: Message = {
            id: messages.length + 1,
            role: "user",
            content: input.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages(prev => [...prev, newMsg]);
        setInput("");
        setIsAiTyping(true);

        setTimeout(() => {
            setIsAiTyping(false);
            const aiMsg: Message = {
                id: messages.length + 2,
                role: "ai",
                content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 2000 + Math.random() * 1000);
    };

    return (
        <div className="min-h-screen bg-dark flex flex-col">
            <InterviewHeader elapsed={elapsed} rounds={rounds} />

            <div className="flex flex-1 overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                        <AnimatePresence initial={false}>
                            {messages.map(msg => (
                                <ChatMessage key={msg.id} message={msg} />
                            ))}
                        </AnimatePresence>

                        <AnimatePresence>
                            {isAiTyping && <TypingIndicator />}
                        </AnimatePresence>

                        <div ref={bottomRef} />
                    </div>

                    <ChatInput
                        input={input}
                        onChange={setInput}
                        onSend={sendMessage}
                        isMicOn={isMicOn}
                        onToggleMic={() => setIsMicOn(!isMicOn)}
                    />
                </div>

                <InterviewSidebar />
            </div>
        </div>
    );
}
