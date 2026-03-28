import React from 'react';
import { Crown, Clock, Shield } from 'lucide-react';
import { PLAN_TYPES } from '../config/constants';

export default function MembershipStatusCard({ membership, trialRemaining }) {
  const { planType } = membership;

  const configs = {
    [PLAN_TYPES.PAID]: {
      icon: Crown,
      bg: 'from-primary-500 to-teal-500',
      title: '付費會員',
      subtitle: '享有完整功能',
      badge: '已開通',
    },
    [PLAN_TYPES.TRIAL]: {
      icon: Clock,
      bg: 'from-blue-400 to-indigo-500',
      title: '免費試用中',
      subtitle: trialRemaining || '試用期間',
      badge: '試用',
    },
    [PLAN_TYPES.EXPIRED]: {
      icon: Shield,
      bg: 'from-gray-400 to-gray-500',
      title: '試用已到期',
      subtitle: '升級以繼續使用',
      badge: '已到期',
    },
    [PLAN_TYPES.NONE]: {
      icon: Shield,
      bg: 'from-gray-300 to-gray-400',
      title: '尚未啟用',
      subtitle: '開始免費試用',
      badge: '未啟用',
    },
  };

  const config = configs[planType] || configs[PLAN_TYPES.NONE];
  const Icon = config.icon;

  return (
    <div className={`mx-4 p-5 bg-gradient-to-r ${config.bg} rounded-2xl text-white shadow-lg`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{config.title}</h3>
            <span className="text-[10px] px-2 py-0.5 bg-white/20 rounded-full">{config.badge}</span>
          </div>
          <p className="text-white/80 text-sm mt-0.5">{config.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
