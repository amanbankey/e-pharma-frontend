import { CreditCard, Banknote } from 'lucide-react';

export default function PaymentMethodSelector({ value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Payment Method</label>
      <div className="mt-2 space-y-2">
        <label
          onClick={() => onChange('razorpay')}
          className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition ${
            value === 'razorpay' ? 'border-teal-700 bg-teal-50/50' : 'border-line hover:border-teal-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-100 text-teal-800">
              <CreditCard size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-teal-900">Pay Online (Razorpay)</p>
              <p className="text-xs text-ink-soft">UPI</p>
            </div>
          </div>
          <input
            type="radio"
            name="paymentMethod"
            checked={value === 'razorpay'}
            onChange={() => onChange('razorpay')}
            className="accent-teal-700"
          />
        </label>

        <label
          onClick={() => onChange('cod')}
          className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition ${
            value === 'cod' ? 'border-teal-700 bg-teal-50/50' : 'border-line hover:border-teal-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-800">
              <Banknote size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-teal-900">Pay Cash on Delivery</p>
              <p className="text-xs text-ink-soft">Pay cash when medicine arrives at your doorstep</p>
            </div>
          </div>
          <input
            type="radio"
            name="paymentMethod"
            checked={value === 'cod'}
            onChange={() => onChange('cod')}
            className="accent-teal-700"
          />
        </label>
      </div>
    </div>
  );
}
