import { ArrowRightIcon, Sparkles } from 'lucide-react';
import React from 'react'
const Hero = () => {
    return (
        <div className="relative z-20 max-w-5xl mx-auto px-4 py-16 flex h-screen flex-col justify-center items-center text-center">
            <div className="relative">
                <Sparkles
                    className="absolute -top-14 -right-40 text-purple-300 animate-pulse"
                    size={24}
                />
            </div>

            <h1 className="text-8xl font-bold mb-6 text-white">
                Drawing problems, <br></br> deriving solutions!
            </h1>

            <p className="text-2xl font-bold text-white mb-8">
                Draw, solve, repeat: Your ultimate problem-solver.
            </p>

            <div className="flex justify-center gap-8 mb-12 text-gray-300">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-400" />
                    <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-400" />
                    <span>Easy-To-Use</span>
                </div>
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-400" />
                    <span>Limitless</span>
                </div>  
            </div>
        </div>
    )
}

export default Hero