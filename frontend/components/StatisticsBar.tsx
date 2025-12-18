'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Clock, HelpCircle, XCircle } from 'lucide-react';

interface RiskData {
  status_counts: {
    verified: number;
    uncertain: number;
    outdated: number;
    unsupported: number;
    contradicted: number;
  };
  total_claims: number;
}

interface StatisticsBarProps {
  riskData: RiskData;
}

export default function StatisticsBar({ riskData }: StatisticsBarProps) {
  const stats = [
    {
      label: 'Verified',
      count: riskData.status_counts.verified,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/50',
      glowColor: 'shadow-green-500/30'
    },
    {
      label: 'Uncertain',
      count: riskData.status_counts.uncertain,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/50',
      glowColor: 'shadow-yellow-500/30'
    },
    {
      label: 'Outdated',
      count: riskData.status_counts.outdated,
      icon: Clock,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/50',
      glowColor: 'shadow-orange-500/30'
    },
    {
      label: 'Unsupported',
      count: riskData.status_counts.unsupported,
      icon: HelpCircle,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/50',
      glowColor: 'shadow-purple-500/30'
    },
    {
      label: 'Contradicted',
      count: riskData.status_counts.contradicted,
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
      glowColor: 'shadow-red-500/30'
    }
  ];

  const totalClaims = riskData.total_claims;

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between"
      >
        <h3 className="text-lg font-semibold text-white">Verification Breakdown</h3>
        <span className="text-sm text-gray-400">Total: {totalClaims} claims</span>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-5 gap-3"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const percentage = totalClaims > 0 ? Math.round((stat.count / totalClaims) * 100) : 0;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                delay: index * 0.08 + 0.2,
                type: 'spring',
                stiffness: 200,
                damping: 15
              }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`${stat.bgColor} backdrop-blur-lg border ${stat.borderColor} rounded-xl p-4 text-center relative overflow-hidden group cursor-pointer transition-shadow hover:${stat.glowColor} hover:shadow-xl`}
            >
              {/* Animated Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              />
              
              {/* Icon with Animation */}
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: stat.count > 0 ? [0, 10, -10, 0] : 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1 + 0.5,
                  repeat: stat.count > 0 ? 1 : 0
                }}
              >
                <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-2 relative z-10`} />
              </motion.div>
              
              {/* Count with Counter Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: index * 0.1 + 0.3,
                  type: 'spring',
                  stiffness: 300
                }}
                className="text-3xl font-bold text-white mb-1 relative z-10"
              >
                {stat.count}
              </motion.div>
              
              {/* Label */}
              <div className="text-xs text-gray-300 uppercase tracking-wide font-semibold relative z-10">
                {stat.label}
              </div>
              
              {/* Percentage Badge */}
              {stat.count > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.6 }}
                  className={`mt-2 text-xs ${stat.color} font-bold relative z-10`}
                >
                  {percentage}%
                </motion.div>
              )}

              {/* Progress Bar at Bottom */}
              {stat.count > 0 && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white/10"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ 
                      delay: index * 0.1 + 0.7,
                      duration: 0.8,
                      ease: 'easeOut'
                    }}
                    className={`h-full ${stat.bgColor.replace('/20', '/60')}`}
                  />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Visual Distribution Bar */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="h-3 bg-white/5 rounded-full overflow-hidden flex"
      >
        {stats.map((stat, index) => {
          const percentage = totalClaims > 0 ? (stat.count / totalClaims) * 100 : 0;
          if (percentage === 0) return null;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ 
                delay: 0.9 + index * 0.05,
                duration: 0.5,
                ease: 'easeOut'
              }}
              className={`${stat.bgColor.replace('/20', '/80')} relative group`}
              title={`${stat.label}: ${stat.count} (${Math.round(percentage)}%)`}
            >
              <motion.div
                className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

