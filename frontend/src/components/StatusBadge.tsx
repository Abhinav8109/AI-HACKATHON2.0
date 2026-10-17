import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const s = (status || '').toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200/90';
  let dotColor = 'bg-slate-400';
  let IconComponent = HelpCircle;

  if (['ACTIVE', 'COMPLETED', 'ADVANCE', 'APPROVED', 'CONSISTENT', 'SUPPORTED', 'SENT'].includes(s)) {
    styles = 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90 shadow-2xs shadow-emerald-500/10';
    dotColor = 'bg-emerald-500';
    IconComponent = CheckCircle2;
  } else if (['IN_PROGRESS', 'OPENED', 'REDEEMED', 'RUNNING'].includes(s)) {
    styles = 'bg-indigo-50/90 text-indigo-800 border-indigo-200/90 shadow-2xs shadow-indigo-500/10';
    dotColor = 'bg-indigo-500 animate-pulse';
    IconComponent = Clock;
  } else if (['INVITED', 'ISSUED', 'READY', 'HOLD_FOR_REVIEW', 'UNDER_REVIEW', 'HOLD', 'SIMULATED'].includes(s)) {
    styles = 'bg-amber-50/90 text-amber-900 border-amber-200/90 shadow-2xs shadow-amber-500/10';
    dotColor = 'bg-amber-500';
    IconComponent = AlertTriangle;
  } else if (['REVOKED', 'EXPIRED', 'REJECT', 'POTENTIAL_INCONSISTENCY', 'FAILED'].includes(s)) {
    styles = 'bg-rose-50/90 text-rose-800 border-rose-200/90 shadow-2xs shadow-rose-500/10';
    dotColor = 'bg-rose-500';
    IconComponent = XCircle;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${padding} ${styles} transition-all tracking-tight`}
    >
      <IconComponent className={`${iconSize} shrink-0`} />
      <span>{status.replace(/_/g, ' ')}</span>
    </span>
  );
};
