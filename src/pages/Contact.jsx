import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactApi } from '../lib/api';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.target;
    const data = new FormData(formEl);
    const name = (data.get('name') || '').trim();
    const phone = (data.get('phone') || '').trim();
    const email = (data.get('email') || '').trim();
    const message = (data.get('message') || '').trim();

    setSent(false);
    if (!name) return toast.error('Please enter your full name.');
    if (!phone) return toast.error('Please enter your phone number.');
    if (!/^\d{10}$/.test(phone)) return toast.error('Phone number must be exactly 10 digits.');
    if (!email) return toast.error('Please enter your email address.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("That doesn't look like a valid email address.");
    if (!message) return toast.error('Please write your message before sending.');

    setSending(true);
    try {
      const res = await contactApi.send({ name, phone, email, message });
      toast.success(res.message || 'Your message has been sent successfully!');
      formEl.reset();
      setSent(true);
    } catch (err) {
      toast.error(err.message || 'Could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-4xl text-teal-900">Talk to us</h1>
        <p className="mt-2 max-w-lg text-ink-soft">Questions about an order, a prescription, or a bulk enquiry — our team replies within the hour.</p>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="space-y-5">
            {[
              [Phone, 'Call us', '+91 98765 43210'],
              [Mail, 'Email us', 'care@vernalrx.com'],
              [MapPin, 'Visit us', '4th Floor, Kaveri Complex, MG Road, Pune, MH 411001'],
            ].map(([Icon, label, value]) => (
              <div key={label} className="flex items-start gap-4 rounded-2xl border border-line bg-paper p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-700">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-teal-900">{label}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{value}</p>
                </div>
              </div>
            ))}
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 font-semibold text-white transition hover:opacity-90"
            >
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-line">
            <iframe
              title="Vernal Rx location"
              src="https://www.google.com/maps?q=MG+Road+Pune&output=embed"
              className="h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-3 rounded-2xl border border-line bg-paper p-7"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-ink-soft">Full name</label>
              <input name="name" className="mt-1.5 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-soft">Phone number</label>
              <input name="phone" type="tel" maxLength={10} className="mt-1.5 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-teal-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-ink-soft">Email</label>
              <input name="email" type="email" className="mt-1.5 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-teal-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-ink-soft">Message</label>
              <textarea name="message" rows={5} className="mt-1.5 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-teal-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-900 px-7 py-3.5 font-semibold text-cream transition hover:bg-teal-700 disabled:opacity-60"
          >
            <Send size={16} /> {sending ? 'Sending…' : 'Send message'}
          </button>

          {sent && <p className="mt-4 text-sm font-medium text-teal-700">Thanks — your message has been sent. We'll get back to you shortly.</p>}
        </motion.form>
      </div>
    </div>
  );
}
