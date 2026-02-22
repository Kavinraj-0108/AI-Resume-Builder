import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import api from '../configs/api.js';

const ResumeAnalysis = ({ isOpen, onClose, resumeData }) => {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && resumeData) {
            analyzeResume();
        }
    }, [isOpen]);

    const analyzeResume = async () => {
        setLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            // Pass resumeData directly as expected by our backend update
            const response = await api.post('/api/ai/analyze-resume', { resumeData });
            setAnalysis(response.data);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || err.message || "Failed to analyze resume");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">✨</span> AI Resume Analysis
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Loader2 className="w-12 h-12 animate-spin text-green-500 mb-4" />
                            <p className="text-lg font-medium">Analyzing your resume...</p>
                            <p className="text-sm">This may take a few seconds.</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold">Analysis Failed</h3>
                                <p className="text-sm opacity-90">{error}</p>
                                <button
                                    onClick={analyzeResume}
                                    className="mt-3 text-sm font-medium underline hover:text-red-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : analysis ? (
                        <div className="space-y-8">
                            {/* Score Section */}
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="60"
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="8"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="60"
                                            fill="none"
                                            stroke={analysis.score >= 80 ? "#22c55e" : analysis.score >= 60 ? "#eab308" : "#ef4444"}
                                            strokeWidth="8"
                                            strokeDasharray={2 * Math.PI * 60}
                                            strokeDashoffset={2 * Math.PI * 60 * (1 - analysis.score / 100)}
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-800">
                                        <span className="text-4xl font-bold">{analysis.score}</span>
                                        <span className="text-xs font-medium uppercase text-gray-500">Score</span>
                                    </div>
                                </div>
                                <p className="mt-2 text-gray-500 font-medium text-center">
                                    {analysis.score >= 80 ? "Excellent Job!" : analysis.score >= 60 ? "Good Start!" : "Needs Improvement"}
                                </p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Strengths */}
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" /> Key Strengths
                                    </h3>
                                    <ul className="space-y-2">
                                        {analysis.strengths?.map((item, i) => (
                                            <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Weaknesses */}
                                <div className="bg-red-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" /> Areas for Improvement
                                    </h3>
                                    <ul className="space-y-2">
                                        {analysis.weaknesses?.map((item, i) => (
                                            <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Suggestions */}
                            <div className="bg-blue-50 rounded-lg p-5">
                                <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5" /> Actionable Suggestions
                                </h3>
                                <div className="space-y-3">
                                    {analysis.suggestions?.map((item, i) => (
                                        <div key={i} className="flex gap-3 text-sm text-blue-700 bg-white/50 p-3 rounded border border-blue-100">
                                            <span className="font-bold text-blue-500">#{i + 1}</span>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                    {!loading && (
                        <button
                            onClick={analyzeResume}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Re-analyze
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeAnalysis;
