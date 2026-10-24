'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Briefcase, ShieldCheck, UserPlus, Activity, Users } from 'lucide-react';

const roles = [
  { key: 'owner', icon: ShieldCheck, color: '#F97316' },
  { key: 'admin', icon: ShieldCheck, color: '#8B5CF6' },
  { key: 'member', icon: Users, color: '#3B82F6' },
  { key: 'viewer', icon: Users, color: '#64748B' },
];

export default function WorkspacesGuide() {
  const t = useTranslations('GuideWorkspaces');

  return (
    <div>
      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#F97316]/20 flex items-center justify-center">
          <Briefcase className="h-5 w-5 text-[#F97316]" />
        </div>
        <span className="text-sm font-medium text-[#F97316]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">{t('subtitle')}</p>

      <h2>{t('what_title')}</h2>
      <p>{t('what_text')}</p>
      <p>{t('what_switch_text')}</p>

      <h2>{t('roles_title')}</h2>
      <p>{t('roles_text')}</p>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {roles.map((role, index) => {
          const Icon = role.icon;
          return (
            <motion.div
              key={role.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl border bg-card"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${role.color}20` }}
              >
                <Icon className="h-5 w-5" style={{ color: role.color }} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t(`roles.${role.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`roles.${role.key}.description`)}</p>
            </motion.div>
          );
        })}
      </div>

      <h2>{t('invite_title')}</h2>
      <p>{t('invite_text')}</p>
      <div className="not-prose p-5 rounded-xl border bg-card my-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#3B82F6] flex items-center justify-center shrink-0">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">{t('invite_box_text')}</p>
        </div>
      </div>

      <h2>{t('activity_title')}</h2>
      <p>{t('activity_text')}</p>
      <div className="not-prose p-5 rounded-xl border bg-card my-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#8B5CF6] flex items-center justify-center shrink-0">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">{t('activity_box_text')}</p>
        </div>
      </div>

      {/* Tip */}
      <div className="not-prose p-6 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
