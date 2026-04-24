import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { ArrowLeft, Shield, Smartphone, Building2, CreditCard, Wallet } from 'lucide-react';
import { storage } from '../utils-new/storage';

const PAYMENT_METHODS = [
  { id: 'qris', name: 'QRIS', Icon: Smartphone },
  { id: 'bank', name: 'Transfer Bank', Icon: Building2 },
  { id: 'gopay', name: 'GoPay', Icon: Wallet },
  { id: 'ovo', name: 'OVO', Icon: CreditCard },
  { id: 'dana', name: 'DANA', Icon: Wallet },
];

export function Payment() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const job = storage.getJobs().find(j => j.id === jobId);
  const platformFee = job ? job.budget * 0.05 : 0;
  const total = job ? job.budget + platformFee : 0;

  const handlePayment = () => {
    if (!selectedMethod) {
      showToast('Pilih metode pembayaran', 'error');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      if (jobId) {
        storage.updateJob(jobId, { status: 'paid' });
      }
      showToast('Pembayaran berhasil!', 'success');
      navigate('/my-jobs');
    }, 2000);
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <p className="text-gray-500">Job tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-8">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-semibold text-gray-900">Payment</h1>
      </div>

      <div className="px-6 space-y-6">
        {/* Job Summary */}
        <div className="bg-white rounded-[16px] p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Job Summary</h3>
          <h4 className="font-semibold text-[#6366F1] mb-2">{job.title}</h4>
          <div className="flex items-center gap-2">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${job.workerId}`}
              alt="Worker"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Worker UB</p>
              <p className="text-xs text-gray-500">Worker yang dipilih</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Metode Pembayaran</h3>
          <div className="space-y-2">
            {PAYMENT_METHODS.map(method => {
              const IconComponent = method.Icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full bg-white rounded-[10px] p-4 flex items-center gap-3 transition-all ${
                    selectedMethod === method.id
                      ? 'border-2 border-[#6366F1] shadow-md'
                      : 'border-2 border-transparent shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-gray-700" strokeWidth={2} />
                  </div>
                  <span className="font-medium text-gray-900">{method.name}</span>
                  {selectedMethod === method.id && (
                    <div className="ml-auto w-5 h-5 bg-[#6366F1] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-[16px] p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Order Summary</h3>
          <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Budget tugas</span>
              <span className="font-medium text-gray-900">Rp {job.budget.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Platform fee (5%)</span>
              <span className="font-medium text-gray-900">Rp {platformFee.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">
              Rp {total.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Escrow Info */}
        <div className="bg-gray-100 border border-gray-200 rounded-[16px] p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Protected by Escrow</h4>
              <p className="text-xs text-gray-700">
                Dana akan ditahan sampai worker submit hasil dan kamu approve. Uangmu aman!
              </p>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={!selectedMethod || isProcessing}
          className="w-full bg-[#6366F1] text-white rounded-[10px] py-4 font-medium hover:bg-[#4F46E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : `Bayar Rp ${total.toLocaleString('id-ID')}`}
        </button>
      </div>
    </div>
  );
}
