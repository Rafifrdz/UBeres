import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Smartphone, Building2, CreditCard, Wallet } from 'lucide-react';
import { useToast } from '../components/Toast';

const TOPUP_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

const PAYMENT_METHODS = [
  { id: 'gopay', name: 'GoPay', Icon: Smartphone },
  { id: 'dana', name: 'DANA', Icon: Wallet },
  { id: 'bank', name: 'Transfer Bank', Icon: Building2 },
  { id: 'card', name: 'Kartu Kredit/Debit', Icon: CreditCard },
];

export function TopUp() {
  const navigate = useNavigate();
  const { user, updateUser } = useApp();
  const { showToast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');

  const handleTopUp = () => {
    const amount = selectedAmount || parseInt(customAmount);

    if (!amount || amount < 10000) {
      showToast('Minimal top up Rp 10.000', 'error');
      return;
    }

    if (!selectedPayment) {
      showToast('Pilih metode pembayaran', 'error');
      return;
    }

    // Simulate top up
    const newBalance = (user?.balance || 0) + amount;
    updateUser({ balance: newBalance });
    showToast(`Berhasil top up Rp ${amount.toLocaleString('id-ID')}`, 'success');
    navigate('/profile');
  };

  const totalAmount = selectedAmount || parseInt(customAmount) || 0;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-28">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Top Up Saldo</h1>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Current Balance */}
        <div className="bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-[16px] p-5">
          <p className="text-white/80 text-sm mb-2">Saldo Saat Ini</p>
          <p className="text-2xl font-bold text-white">
            Rp {(user?.balance || 0).toLocaleString('id-ID')}
          </p>
        </div>

        {/* Quick Amount Selection */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Pilih Nominal</h3>
          <div className="grid grid-cols-3 gap-3">
            {TOPUP_AMOUNTS.map(amount => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
                className={`rounded-[12px] py-3 px-4 font-semibold transition-all ${
                  selectedAmount === amount
                    ? 'bg-[#6366F1] text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#6366F1]'
                }`}
              >
                {amount >= 1000000 ? `${amount / 1000000}jt` : `${amount / 1000}K`}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Atau Masukkan Nominal</h3>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
            <input
              type="number"
              value={customAmount}
              onChange={e => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
              placeholder="0"
              className="w-full bg-white border border-gray-200 rounded-[12px] pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Minimal top up Rp 10.000</p>
        </div>

        {/* Payment Method */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Metode Pembayaran</h3>
          <div className="space-y-2">
            {PAYMENT_METHODS.map(method => {
              const IconComponent = method.Icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full bg-white rounded-[12px] p-4 flex items-center gap-3 transition-all ${
                    selectedPayment === method.id
                      ? 'border-2 border-[#6366F1] shadow-md'
                      : 'border border-gray-200 hover:border-[#6366F1]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedPayment === method.id ? 'bg-[#6366F1]' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      selectedPayment === method.id ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <span className={`font-medium ${
                    selectedPayment === method.id ? 'text-[#6366F1]' : 'text-gray-900'
                  }`}>
                    {method.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        {totalAmount > 0 && (
          <div className="bg-white rounded-[16px] p-5 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Ringkasan</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Nominal Top Up</span>
                <span className="font-semibold text-gray-900">Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Biaya Admin</span>
                <span className="font-semibold text-gray-900">Gratis</span>
              </div>
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total Bayar</span>
                <span className="font-bold text-[#6366F1]">Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 safe-area-pb max-w-[430px] mx-auto">
        <button
          onClick={handleTopUp}
          disabled={!totalAmount || totalAmount < 10000 || !selectedPayment}
          className="w-full bg-[#6366F1] text-white rounded-[12px] py-4 font-semibold hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Top Up Sekarang
        </button>
      </div>
    </div>
  );
}
