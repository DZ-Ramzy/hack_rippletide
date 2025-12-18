'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Shield } from 'lucide-react';

interface RiskData {
  confidence: number;
  risk_emoji: string;
  risk_message: string;
  risk_color: string;
  status_counts: {
    verified: number;
    uncertain: number;
    outdated: number;
    unsupported: number;
    contradicted: number;
  };
  total_claims: number;
}

interface HallucinationMeterProps {
  riskData: RiskData;
}

export default function HallucinationMeter({ riskData }: HallucinationMeterProps) {
  const { confidence, risk_message, risk_color } = riskData;
  const hallucinationRisk = 100 - confidence;

  const getColorClasses = () => {
    if (risk_color === 'green') {
      return {
        gradient: 'from-green-500 to-emerald-500',
        glow: 'shadow-green-500/50',
        icon: CheckCircle,
        iconColor: 'text-green-400',
        bgGradient: 'from-green-500/20 to-emerald-500/20',
        riskLabel: 'Low Hallucination Risk',
        riskColor: 'text-green-300'
      };
    } else if (risk_color === 'yellow') {
      return {
        gradient: 'from-yellow-500 to-orange-500',
        glow: 'shadow-yellow-500/50',
        icon: AlertTriangle,
        iconColor: 'text-yellow-400',
        bgGradient: 'from-yellow-500/20 to-orange-500/20',
        riskLabel: 'Moderate Hallucination Risk',
        riskColor: 'text-yellow-300'
      };
    } else {
      return {
        gradient: 'from-red-500 to-pink-500',
        glow: 'shadow-red-500/50',
        icon: XCircle,
        iconColor: 'text-red-400',
        bgGradient: 'from-red-500/20 to-pink-500/20',
        riskLabel: 'High Hallucination Risk',
        riskColor: 'text-red-300'
      };
    }
  };

  const colorClasses = getColorClasses();
  const Icon = colorClasses.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="relative overflow-hidden"
    >
      {/* Main Card */}
      <div className={`bg-gradient-to-br ${colorClasses.gradient} rounded-3xl p-8 shadow-2xl ${colorClasses.glow} relative overflow-hidden`}>
        {/* Animated Background Patterns */}
        <div className="absolute inset-0 opacity-10">
          <motion.div 
            className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.1, 0.2]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        {/* Shield Icon with Pulse */}
        <motion.div
          className="absolute top-4 right-4"
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Shield className="w-12 h-12 text-white/30" />
        </motion.div>

        <div className="relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <h3 className="text-sm uppercase tracking-wider text-white/80 font-semibold mb-2">
              Hallucination Detection Analysis
            </h3>
            <div className="flex items-center justify-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              >
                <Icon className="w-8 h-8 text-white" />
              </motion.div>
              <span className={`text-lg font-bold ${colorClasses.riskColor}`}>
                {colorClasses.riskLabel}
              </span>
            </div>
          </motion.div>

          {/* Dual Meter Display */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Confidence Score */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                className="text-6xl font-bold text-white mb-2"
              >
                {confidence}%
              </motion.div>
              <div className="text-sm text-white/80 font-semibold uppercase tracking-wide">
                Confidence
              </div>
              <motion.div
                className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ delay: 0.7, duration: 1, ease: 'easeOut' }}
                  className="h-full bg-white rounded-full shadow-lg"
                />
              </motion.div>
            </motion.div>

            {/* Hallucination Risk */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                className="text-6xl font-bold text-white mb-2"
              >
                {hallucinationRisk}%
              </motion.div>
              <div className="text-sm text-white/80 font-semibold uppercase tracking-wide">
                Hallucination Risk
              </div>
              <motion.div
                className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${hallucinationRisk}%` }}
                  transition={{ delay: 0.7, duration: 1, ease: 'easeOut' }}
                  className="h-full bg-white/60 rounded-full shadow-lg"
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-lg text-white/90 font-medium">
              {risk_message}
            </p>
          </motion.div>

          {/* Scanning Line Effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            <motion.div
              className="h-1 w-full bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{ y: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          </motion.div>
        </div>
      </div>

      {/* Additional Info Strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`mt-4 bg-gradient-to-r ${colorClasses.bgGradient} backdrop-blur-lg border border-white/10 rounded-xl p-4`}
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white/80">Real-time verification active</span>
          </div>
          <div className="text-white/60">
            {riskData.total_claims} claims analyzed
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

