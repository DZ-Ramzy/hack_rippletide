'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, AlertCircle, CheckCircle, Clock, HelpCircle, X, Shield, Zap, Target, FileSearch, FileText, MessageSquare } from 'lucide-react';
import HallucinationMeter from '@/components/HallucinationMeter';
import ClaimCard from '@/components/ClaimCard';
import SourceCard from '@/components/SourceCard';
import StatisticsBar from '@/components/StatisticsBar';
import Logo from '@/components/Logo';
import AnswerWithSources from '@/components/AnswerWithSources';
import PdfUploader from '@/components/PdfUploader';
import PdfViewer from '@/components/PdfViewer';
import Particles from '@/components/Particles';
import { verifyQuestion, askPdfQuestion } from '@/lib/api';
import type { VerificationResult } from '@/types';

const verificationSteps = [
  { icon: Sparkles, label: "Generating AI answer...", color: "text-purple-400" },
  { icon: FileSearch, label: "Searching web sources...", color: "text-blue-400" },
  { icon: Target, label: "Extracting claims...", color: "text-yellow-400" },
  { icon: Shield, label: "Verifying each claim...", color: "text-green-400" },
  { icon: Zap, label: "Finalizing analysis...", color: "text-pink-400" }
];

type Mode = 'fact-check' | 'pdf-qa';

interface PdfResult {
  question: string;
  answer: string;
  source_positions: Array<{
    page: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
    text?: string;
  }>;
  total_pages: number;
  filename: string;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('fact-check');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  // PDF mode state
  const [pdfFilename, setPdfFilename] = useState<string | null>(null);
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(0);
  const [pdfResult, setPdfResult] = useState<PdfResult | null>(null);

  useEffect(() => {
    if (loading) {
      setCurrentStep(0);
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          // Progress through steps, but stay on last one
          if (prev < verificationSteps.length - 1) {
            return prev + 1;
          }
          // Stay on last step - the pulse animation shows it's still working
          return prev;
        });
      }, 1500); // 1.5s per step
      
      return () => clearInterval(interval);
    } else {
      setCurrentStep(0);
    }
  }, [loading]);

  const handleVerify = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (mode === 'fact-check') {
        const data = await verifyQuestion(question);
        setResult(data);
        setPdfResult(null);
      } else {
        // PDF Q&A mode
        if (!pdfFilename) {
          setError('Please upload a PDF first');
          return;
        }
        const data = await askPdfQuestion(pdfFilename, question);
        setPdfResult(data);
        setResult(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setPdfResult(null);
    setQuestion('');
    setError(null);
  };

  const handlePdfUpload = (filename: string, totalPages: number) => {
    setPdfFilename(filename);
    setPdfTotalPages(totalPages);
    setError(null);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    handleClear();
  };

  return (
    <main className="min-h-screen bg-black overflow-hidden">
      {/* Particles Background */}
      <div className="fixed inset-0 pointer-events-none">
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <div className="relative z-10 h-screen flex">
        {/* LEFT PANEL - Search Area */}
        <motion.div 
          initial={{ x: 0 }}
          animate={{ 
            width: (result || pdfResult || loading) ? (mode === 'pdf-qa' ? '40%' : '45%') : '100%',
            transition: { duration: 0.5, ease: 'easeInOut' }
          }}
          className="flex flex-col p-8 overflow-y-auto"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center gap-3 mb-4"
            >
              <Logo size="lg" />
            </motion.div>
            
            <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
              Truth<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Lens</span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Advanced AI Hallucination Detection & PDF Q&A
            </p>
          </motion.div>

          {/* Mode Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-2"
          >
            <button
              onClick={() => switchMode('fact-check')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                mode === 'fact-check'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="w-5 h-5" />
              Fact Checking
            </button>
            <button
              onClick={() => switchMode('pdf-qa')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                mode === 'pdf-qa'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-5 h-5" />
              PDF Q&A
            </button>
          </motion.div>

          {/* PDF Upload (only in PDF mode) */}
          {mode === 'pdf-qa' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6"
            >
              <PdfUploader onUploadSuccess={handlePdfUpload} />
            </motion.div>
          )}

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                placeholder={
                  mode === 'fact-check' 
                    ? "Ask a question to verify for hallucinations..." 
                    : "Ask a question about your PDF..."
                }
                className="w-full px-6 py-5 pl-14 pr-32 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg transition-all"
                disabled={loading || (mode === 'pdf-qa' && !pdfFilename)}
              />
              {mode === 'fact-check' ? (
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              ) : (
                <MessageSquare className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              )}
              
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                {(result || pdfResult) && (
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                    disabled={loading}
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleVerify}
                  disabled={loading || !question.trim() || (mode === 'pdf-qa' && !pdfFilename)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/50"
                >
                  {loading ? 'Analyzing...' : mode === 'fact-check' ? 'Verify' : 'Ask'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-300 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
                <button onClick={() => setError(null)} className="ml-auto">
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Cards (visible when no results) */}
          {!result && !pdfResult && !loading && mode === 'fact-check' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid gap-6 mt-8"
            >
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <Shield className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-3">Multi-Layer Verification</h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Our system doesn't just answer questions—it cross-references every claim against multiple web sources to detect potential hallucinations.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <Target className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-3">Claim Extraction</h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Each factual statement is isolated and independently verified, giving you precise confidence scores.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <Zap className="w-12 h-12 text-yellow-400 mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-3">Real-Time Analysis</h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Watch as our AI analyzes, fact-checks, and calculates hallucination risk in real-time.
                </p>
              </div>
            </motion.div>
          )}

          {/* PDF Mode Info */}
          {!result && !pdfResult && !loading && mode === 'pdf-qa' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid gap-6 mt-8"
            >
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <FileText className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-3">Upload & Ask</h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Upload your PDF document and ask any question. Our AI will find the answer and highlight exactly where it appears in your document.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <Target className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-3">Smart Highlighting</h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  See your answer highlighted directly in the PDF viewer on the right, making it easy to verify the source.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <Sparkles className="w-12 h-12 text-yellow-400 mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-3">Context-Aware</h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Our AI understands the content of your PDF and provides accurate answers based only on what's in the document.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* RIGHT PANEL - Results or PDF Viewer */}
        <AnimatePresence>
          {(result || pdfResult || loading) && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className={`${mode === 'pdf-qa' ? 'w-[60%]' : 'w-[55%]'} border-l border-white/20 bg-black/30 backdrop-blur-xl overflow-y-auto p-8`}
            >
              {/* PDF Q&A Result with PDF Viewer */}
              {mode === 'pdf-qa' && pdfResult && !loading && (
                <div className="h-full flex flex-col gap-4">
                  {/* Answer Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-xl"
                  >
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      Answer
                    </h3>
                    <p className="text-gray-200 leading-relaxed">{pdfResult.answer}</p>
                    {pdfResult.source_positions.length > 0 && (
                      <p className="text-sm text-green-400 mt-3">
                        ✓ Found {pdfResult.source_positions.length} reference{pdfResult.source_positions.length > 1 ? 's' : ''} in the document
                      </p>
                    )}
                  </motion.div>

                  {/* PDF Viewer */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1"
                  >
                    <PdfViewer 
                      filename={pdfResult.filename} 
                      highlights={pdfResult.source_positions}
                    />
                  </motion.div>
                </div>
              )}
              {/* Loading State with Progress Steps */}
              {loading && mode === 'fact-check' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center min-h-full"
                >
                  <div className="w-full max-w-lg">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="mb-12 text-center"
                    >
                      <Shield className="w-24 h-24 text-purple-400 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-white mb-2">Hallucination Detection Active</h2>
                      <p className="text-gray-400">Analyzing response integrity...</p>
                    </motion.div>

                    {/* Progress Steps */}
                    <div className="space-y-6">
                      {verificationSteps.map((step, index) => {
                        const StepIcon = step.icon;
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                              isActive 
                                ? 'bg-purple-500/20 border-2 border-purple-500/50 scale-105' 
                                : isCompleted
                                ? 'bg-green-500/10 border border-green-500/30'
                                : 'bg-white/5 border border-white/10'
                            }`}
                          >
                            <div className={`flex-shrink-0 ${isActive || isCompleted ? step.color : 'text-gray-500'}`}>
                              {isCompleted ? (
                                <CheckCircle className="w-8 h-8" />
                              ) : (
                                <StepIcon className={`w-8 h-8 ${isActive ? 'animate-pulse' : ''}`} />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`text-lg font-semibold ${
                                isActive || isCompleted ? 'text-white' : 'text-gray-500'
                              }`}>
                                {step.label}
                              </p>
                            </div>
                            {isActive && (
                              <motion.div
                                className="flex gap-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <motion.div
                                  className="w-2 h-2 bg-purple-400 rounded-full"
                                  animate={{ scale: [1, 1.5, 1] }}
                                  transition={{ duration: 0.6, repeat: Infinity }}
                                />
                                <motion.div
                                  className="w-2 h-2 bg-purple-400 rounded-full"
                                  animate={{ scale: [1, 1.5, 1] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                />
                                <motion.div
                                  className="w-2 h-2 bg-purple-400 rounded-full"
                                  animate={{ scale: [1, 1.5, 1] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                />
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Info Message */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 6 }}
                      className="mt-8 text-center"
                    >
                      <p className="text-sm text-gray-400">
                        🔍 Performing deep verification across multiple sources...
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        This thorough analysis typically takes 15-30 seconds
                      </p>
                    </motion.div>

                    {/* Scanning Animation */}
                    <motion.div
                      className="mt-8 relative h-2 bg-white/10 rounded-full overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                        animate={{
                          x: ['-100%', '100%']
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Loading State for PDF Q&A */}
              {loading && mode === 'pdf-qa' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center min-h-full"
                >
                  <div className="w-full max-w-lg text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <FileText className="w-24 h-24 text-purple-400 mx-auto mb-6" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white mb-3">Analyzing PDF...</h2>
                    <p className="text-gray-400 mb-6">Reading document and finding your answer</p>
                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Results Display */}
              {result && !loading && mode === 'fact-check' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Hallucination Meter */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <HallucinationMeter riskData={result.risk_data} />
                  </motion.div>

                  {/* AI Answer */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl"
                  >
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                      AI Answer
                    </h2>
                    <AnswerWithSources answer={result.answer} sources={result.sources} />
                  </motion.div>

                  {/* Statistics */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <StatisticsBar riskData={result.risk_data} />
                  </motion.div>

                  {/* Claims */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <Target className="w-6 h-6 text-purple-400" />
                      Claim-by-Claim Verification
                    </h2>
                    <div className="space-y-4">
                      {result.verification.claims?.map((claim, index) => (
                        <ClaimCard key={index} claim={claim} index={index} allSources={result.sources} />
                      ))}
                    </div>
                  </motion.div>

                  {/* Sources */}
                  {result.sources && result.sources.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <FileSearch className="w-6 h-6 text-blue-400" />
                        Verified Sources
                      </h2>
                      <div className="space-y-3">
                        {result.sources.slice(0, 5).map((source, index) => (
                          <SourceCard key={index} source={source} index={index} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}
