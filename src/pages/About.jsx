import { motion } from 'framer-motion';
import { ShieldCheck, FlaskConical, Users, Leaf } from 'lucide-react';

const values = [
  { icon: ShieldCheck, title: 'Verified sourcing', text: 'Every SKU is sourced directly from licensed manufacturers and batch-checked before listing.' },
  { icon: FlaskConical, title: 'Pharmacist reviewed', text: 'A registered pharmacist reviews every prescription order before it is dispatched.' },
  { icon: Users, title: 'Built for families', text: 'From infant care to elder wellness, our catalogue is organised around real households.' },
];

export default function About() {
  return (
    <div>
      <section className="mx-auto max-w-5xl px-6 py-20 text-center md:px-10">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-1.5 text-sm text-ink-soft">
          <Leaf size={14} className="text-gold-600" /> Our story
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-6 font-display text-4xl leading-tight text-teal-900 sm:text-5xl"
        >
          We started Vernal Rx because a 9pm pharmacy run shouldn't be this hard.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft"
        >
          Vernal Rx began in 2021 with a single warehouse and a promise: real medicine, real fast, from people who actually check the batch numbers. Today we serve households across India with the same promise, just at scale.
        </motion.p>
      </section>

      <section className="border-y border-line bg-paper py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 md:grid-cols-3 md:px-10">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-line bg-cream p-7"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-teal-900 text-cream">
                <v.icon size={20} />
              </span>
              <h3 className="mt-5 font-display text-xl text-teal-900">{v.title}</h3>
              <p className="mt-2 text-ink-soft">{v.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-10">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            ['2021', 'Founded'],
            ['28', 'Cities served'],
            ['140+', 'Pharmacist team'],
            ['99.2%', 'On-time delivery'],
          ].map(([n, l]) => (
            <div key={l} className="rounded-2xl border border-line bg-paper p-6 text-center">
              <div className="font-display text-3xl text-teal-900">{n}</div>
              <div className="mt-1 text-sm text-ink-soft">{l}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
