import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Building2, AlertCircle } from 'lucide-react';
import { useToast } from '../components/Toast';

const WITHDRAW_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

export function Withdraw() {
  const navigate = useNavigate();
  const { user, updateUser } = useApp();
  const { showToast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const handleWithdraw = () => {
    const amount = selectedAmount || parseInt(customAmount);

    if (!amount || amount < 50000) {
      showToast('Minimal penarikan Rp 50.000', 'error');
      return;
    }

    if (amount > (user?.balance || 0)) {
      showToast('Saldo tidak mencukupi', 'error');
      return;
    }

    if (!bankName || !accountNumber || !accountName) {
      showToast('Lengkapi data rekening', 'error');
      return;
    }

    // Simulate withdraw
    const newBalance = (user?.balance || 0) - amount;
    updateUser({ balance: newBalance });
    showToast(`Penarikan Rp ${amount.toLocaleString('id-ID')} sedang diproses`, 'success');
    navigate('/profile');
  };

  const totalAmount = selectedAmount || parseInt(customAmount) || 0;
  const adminFee = totalAmount > 0 ? 2500 : 0;
  const totalReceived = totalAmount - adminFee;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-28">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Tarik Saldo</h1>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Current Balance */}
        <div className="bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-[16px] p-5">
          <p className="text-white/80 text-sm mb-2">Saldo Tersedia</p>
          <p className="text-2xl font-bold text-white">
            Rp {(user?.balance || 0).toLocaleString('id-ID')}
          </p>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-[12px] p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-900">
              Minimal penarikan Rp 50.000. Dana akan masuk ke rekening dalam 1-2 hari kerja.
            </p>
          </div>
        </div>

        {/* Quick Amount Selection */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Pilih Nominal</h3>
          <div className="grid grid-cols-3 gap-3">
            {WITHDRAW_AMOUNTS.map(amount => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
                disabled={amount > (user?.balance || 0)}
                className={`rounded-[12px] py-3 px-4 font-semibold transition-all ${
                  selectedAmount === amount
                    ? 'bg-[#6366F1] text-white shadow-lg'
                    : amount > (user?.balance || 0)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
          <p className="text-xs text-gray-500 mt-2">Minimal penarikan Rp 50.000</p>
        </div>

        {/* Bank Account Details */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Data Rekening</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Nama Bank</label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                placeholder="Contoh: BCA, Mandiri, BNI"
                className="w-full bg-white border border-gray-200 rounded-[12px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-2 block">Nomor Rekening</label>
              <input
                type="number"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder="Masukkan nomor rekening"
                className="w-full bg-white border border-gray-200 rounded-[12px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-2 block">Nama Pemilik Rekening</label>
              <input
                type="text"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                placeholder="Sesuai dengan rekening bank"
                className="w-full bg-white border border-gray-200 rounded-[12px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        {totalAmount > 0 && (
          <div className="bg-white rounded-[16px] p-5 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Ringkasan</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Nominal Penarikan</span>
                <span className="font-semibold text-gray-900">Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Biaya Admin</span>
                <span className="font-semibold text-gray-900">Rp {adminFee.toLocaleString('id-ID')}</span>
              </div>
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total Diterima</span>
                <span className="font-bold text-[#6366F1]">Rp {totalReceived.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 safe-area-pb max-w-[430px] mx-auto">
        <button
          onClick={handleWithdraw}
          disabled={!totalAmount || totalAmount < 50000 || totalAmount > (user?.balance || 0) || !bankName || !accountNumber || !accountName}
          className="w-full bg-[#6366F1] text-white rounded-[12px] py-4 font-semibold hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Tarik Saldo
        </button>
      </div>
    </div>
  );
}
