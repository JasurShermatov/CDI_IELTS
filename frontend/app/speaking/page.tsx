'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { SpeakingRequest } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Check, Calendar, Phone, Send, Info, User as UserIcon, MessageSquare, Clock, AlertCircle } from 'lucide-react';

const SPEAKING_FEE = 50000;

const CHECKLIST_ITEMS = [
  { id: 'recording_ready', label: 'I have a working microphone and camera' },
  { id: 'internet_stable', label: 'I have a stable internet connection' },
  { id: 'quiet_environment', label: 'I will be in a quiet, private room' },
  { id: 'id_ready', label: 'I have my ID/Passport ready for verification' },
  { id: 'punctuality', label: 'I understand that being late may result in cancellation' },
];

export default function SpeakingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<SpeakingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    phone_number: user?.phone_number || '',
    payment_date: new Date().toISOString().slice(0, 16),
  });

  const [checklist, setChecklist] = useState<Record<string, boolean>>(
    CHECKLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: false }), {})
  );

  const fetchRequests = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await api.get('/speaking/request/me/', { signal });
      setRequests(response.data);
    } catch (error: any) {
      if (error.name !== 'CanceledError') {
        process.env.NODE_ENV === 'development' && console.error('Failed to fetch requests:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchRequests(controller.signal);
    return () => controller.abort();
  }, [fetchRequests]);

  const handleChecklistToggle = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isChecklistComplete = Object.values(checklist).every(Boolean);

  const handleSubmit = async () => {
    if (!isChecklistComplete) {
      toast('Please complete all checklist items.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/speaking/request/', {
        phone_number: formData.phone_number,
        payment_date: new Date(formData.payment_date).toISOString(),
        checklist,
      });
      toast('Speaking request submitted successfully!', 'success');

      // Reset form
      setChecklist(CHECKLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: false }), {}));
      setShowConfirm(false);

      // Refresh list
      fetchRequests();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to submit request. Please try again.';
      toast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'connected': return 'badge-info';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <Skeleton.Dashboard />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Speaking Practice</h1>
        <p className="text-muted text-lg">
          Submit a request for a 1-on-1 mock interview with an expert examiner.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Form */}
        <div className="lg:col-span-2 space-y-6">
          <section className="card space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="bg-primary-light p-2 rounded-lg">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">New Request</h2>
            </div>

            {/* Checklist */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                Preparation Checklist
              </h3>
              <div className="grid gap-3">
                {CHECKLIST_ITEMS.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${checklist[item.id]
                        ? 'bg-primary-light/30 border-primary/20'
                        : 'bg-white hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist[item.id]}
                      onChange={() => handleChecklistToggle(item.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className={`text-sm ${checklist[item.id] ? 'font-medium' : ''}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    disabled
                    value={user?.fullname || ''}
                    className="w-full pl-10 h-10 bg-gray-50 rounded-lg border text-sm cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+998901234567"
                    className="w-full pl-10 h-10 rounded-lg border text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Date & Time</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="datetime-local"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  className="w-full pl-10 h-10 rounded-lg border text-sm"
                />
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Info className="w-3 h-3" />
                Select when you transferred the 50,000 UZS fee.
              </p>
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              disabled={!isChecklistComplete || isSubmitting}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Submit Request (50,000 UZS)
                </>
              )}
            </button>
          </section>
        </div>

        {/* Sidebar / Info */}
        <div className="space-y-6">
          <section className="card bg-gray-50/50 border-dashed space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              How it works
            </h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>Top up your balance via Click or Payme.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>Fill out the checklist and submit request.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>Our team will notify you in our TG group.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">4.</span>
                <span>An examiner will meet you for the test.</span>
              </li>
            </ol>
          </section>

          {/* Fee Card */}
          <div className="card bg-primary text-white space-y-1">
            <p className="opacity-80 text-xs font-medium uppercase tracking-wider">Exam Fee</p>
            <p className="text-3xl font-bold">50,000 <span className="text-lg opacity-90">UZS</span></p>
            <div className="pt-3 border-t border-white/20 mt-3">
              <p className="text-[10px] opacity-70">Balance will be deducted upon submission.</p>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b pb-2">
          <Clock className="w-5 h-5 text-muted" />
          <h2 className="text-xl font-semibold">My Requests</h2>
        </div>

        {requests.length === 0 ? (
          <EmptyState
            title="No speaking requests yet"
            description="Submit your first request above to get started."
            icon={MessageSquare}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((req) => (
              <div key={req.id} className="card p-4 space-y-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className={`badge ${getStatusColor(req.status)} text-[10px]`}>
                    {req.status.toUpperCase()}
                  </div>
                  <span className="text-[10px] text-muted font-medium">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-semibold truncate">{req.full_name}</p>
                  <p className="text-xs text-muted flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {req.phone_number}
                  </p>
                </div>

                <div className="pt-3 border-t flex justify-between items-center text-[11px]">
                  <span className="text-muted">Fee Paid</span>
                  <span className="font-bold text-primary">{parseInt(req.fee_amount).toLocaleString()} UZS</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
        title="Confirm Speaking Request"
        message={`Do you want to submit a speaking request? ${SPEAKING_FEE.toLocaleString()} UZS will be deducted from your balance.`}
        confirmText="Yes, Submit"
        type="warning"
      />
    </div>
  );
}
