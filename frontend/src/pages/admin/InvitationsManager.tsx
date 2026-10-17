import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Ban,
  ShieldCheck,
  Mail,
  Send,
  Inbox,
  X,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { AdminHeader } from '../../components/AdminHeader';
import { StatusBadge } from '../../components/StatusBadge';

export const InvitationsManager: React.FC = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [emailStatusMsg, setEmailStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Outbox / Email History Modal
  const [showOutbox, setShowOutbox] = useState(false);
  const [outboxEmails, setOutboxEmails] = useState<any[]>([]);
  const [loadingOutbox, setLoadingOutbox] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<any | null>(null);

  const fetchInvitations = async () => {
    try {
      const data = await apiRequest('/invitations');
      setInvitations(data);
    } catch (err) {
      console.error('Failed to load invitations', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this candidate portal link?')) return;
    try {
      await apiRequest(`/invitations/${id}/revoke`, { method: 'POST' });
      await fetchInvitations();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke invitation');
    }
  };

  const handleRegenerate = async (id: string) => {
    try {
      await apiRequest(`/invitations/${id}/regenerate`, { method: 'POST' });
      await fetchInvitations();
    } catch (err: any) {
      alert(err.message || 'Failed to regenerate invitation');
    }
  };

  const handleSendEmail = async (invitationId: string, candidateEmail: string) => {
    setSendingEmailId(invitationId);
    setEmailStatusMsg(null);
    try {
      const res = await apiRequest(`/invitations/${invitationId}/send-email`, {
        method: 'POST',
        body: JSON.stringify({
          custom_note: 'Please complete your adaptive AI technical interview before the designated deadline.'
        })
      });
      setEmailStatusMsg({
        text: `Invitation credentials successfully dispatched to ${candidateEmail}! (${res.status || 'SENT'})`,
        type: 'success'
      });
      setTimeout(() => setEmailStatusMsg(null), 5000);
    } catch (err: any) {
      setEmailStatusMsg({
        text: err.message || `Failed to dispatch email to ${candidateEmail}`,
        type: 'error'
      });
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleSendTestEmail = async () => {
    setEmailStatusMsg(null);
    try {
      const res = await apiRequest('/invitations/emails/test', { method: 'POST' });
      setEmailStatusMsg({
        text: `Test credentials email dispatched to abhinavclouds@gmail.com! (${res.status})`,
        type: 'success'
      });
      setTimeout(() => setEmailStatusMsg(null), 5000);
    } catch (err: any) {
      setEmailStatusMsg({
        text: err.message || 'Failed to send test email',
        type: 'error'
      });
    }
  };

  const openOutboxModal = async () => {
    setShowOutbox(true);
    setLoadingOutbox(true);
    try {
      const res = await apiRequest('/invitations/emails/history');
      setOutboxEmails(res.emails || []);
    } catch (err) {
      console.error('Failed to load email history', err);
    } finally {
      setLoadingOutbox(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800">
      <AdminHeader
        title="Unique Candidate Portal Links"
        subtitle="Manage cryptographic invitation credentials, dispatch personalized invite emails, and audit candidate access."
      />

      <div className="w-full max-w-[1750px] mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-6">
        {/* Top Actions & Security Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900">Cryptographic Candidate Isolation Enforced:</span> Every candidate portal link uses a unique 32-byte URL-safe token. The backend validates requests exclusively against the token's SHA-256 hash.
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleSendTestEmail}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all active:scale-98"
            >
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              <span>Test Email (abhinavclouds@gmail.com)</span>
            </button>

            <button
              onClick={openOutboxModal}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 active:scale-98 transition-all"
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Email Outbox Log</span>
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {emailStatusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 shadow-xs ${
              emailStatusMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {emailStatusMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Ban className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{emailStatusMsg.text}</span>
          </motion.div>
        )}

        {/* Invitations Table */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded-xl skeleton-shimmer w-full"></div>
              ))}
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No active invitations found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono">
                    <th className="pb-3.5 font-semibold">Candidate</th>
                    <th className="pb-3.5 font-semibold">Hiring Campaign</th>
                    <th className="pb-3.5 font-semibold">Portal Token / Link</th>
                    <th className="pb-3.5 font-semibold">Status</th>
                    <th className="pb-3.5 font-semibold">Expires At</th>
                    <th className="pb-3.5 font-semibold text-right">Actions & Dispatch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invitations.map((inv) => {
                    const token = inv.raw_token || inv.token;
                    const testUrl = inv.portal_url || (token ? `${window.location.origin}/interview/${token}` : `${window.location.origin}/interview/${inv.token_prefix}`);

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5">
                          <div className="font-semibold text-slate-900">{inv.candidate_name}</div>
                          <div className="text-[11px] text-slate-500">{inv.candidate_email}</div>
                        </td>
                        <td className="py-3.5 text-slate-600 font-medium">
                          {inv.campaign_title}
                        </td>
                        <td className="py-3.5">
                          <div className="font-mono text-indigo-600 font-semibold text-[11px] max-w-[200px] truncate" title={testUrl}>
                            {token ? `${token.substring(0, 16)}...` : `${inv.token_prefix}...`}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">SHA-256 Verified</div>
                        </td>
                        <td className="py-3.5">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                          {inv.expires_at ? new Date(inv.expires_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '7 Days'}
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Send Email Action */}
                            <button
                              onClick={() => handleSendEmail(inv.id, inv.candidate_email)}
                              disabled={sendingEmailId === inv.id}
                              title="Send Invitation & Credentials Email"
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold inline-flex items-center gap-1 border border-indigo-200/80 transition-colors shadow-2xs"
                            >
                              <Mail className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{sendingEmailId === inv.id ? 'Sending...' : 'Email Credentials'}</span>
                            </button>

                            {/* Copy Link Action */}
                            <button
                              onClick={() => handleCopy(inv.id, testUrl)}
                              title="Copy Portal Link"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            >
                              {copiedId === inv.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                            </button>

                            {/* Open Portal Link */}
                            <a
                              href={testUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Open Candidate Portal"
                              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white transition-colors border border-indigo-200/60"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {/* Revoke / Regenerate */}
                            {inv.status !== 'REVOKED' ? (
                              <button
                                onClick={() => handleRevoke(inv.id)}
                                title="Revoke Invitation"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRegenerate(inv.id)}
                                title="Regenerate New Link"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-colors"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Outbox History Modal */}
      <AnimatePresence>
        {showOutbox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Inbox className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">Candidate Email Outbox History</h3>
                    <p className="text-[11px] text-slate-500">Real-time audit log of all candidate credentials and invitation emails.</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowOutbox(false); setPreviewEmail(null); }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                {loadingOutbox ? (
                  <div className="p-8 text-center text-xs text-slate-400 font-mono">Loading outbox logs...</div>
                ) : outboxEmails.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No emails have been dispatched yet. Use "Email Credentials" on any candidate to trigger an invitation.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {outboxEmails.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-white transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-xs">{item.candidate_name || 'Candidate'}</span>
                            <span className="text-slate-400">&bull;</span>
                            <span className="text-slate-600 text-xs font-mono">{item.recipient_email}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                              item.status === 'SENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-700 font-medium">{item.subject}</div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(item.created_at).toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setPreviewEmail(previewEmail?.id === item.id ? null : item)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{previewEmail?.id === item.id ? 'Hide Preview' : 'View Email HTML'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* HTML Email Preview Drawer */}
                {previewEmail && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-indigo-200 bg-white shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <div className="text-xs font-bold text-slate-900 font-display">Rendered Email Preview</div>
                        <div className="text-[11px] text-slate-500">To: {previewEmail.recipient_email} | Subject: {previewEmail.subject}</div>
                      </div>
                      <button
                        onClick={() => setPreviewEmail(null)}
                        className="text-slate-400 hover:text-slate-600 text-xs font-medium"
                      >
                        Close
                      </button>
                    </div>

                    <div
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-h-96 overflow-y-auto text-xs"
                      dangerouslySetInnerHTML={{ __html: previewEmail.body_html }}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
