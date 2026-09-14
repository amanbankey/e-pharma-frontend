
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Pill, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-[80vh] overflow-hidden bg-cream px-6 py-16 md:px-10 md:py-24">
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-teal-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-teal-50 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl items-center justify-center">
        <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-teal-800">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
              Error 404
            </span>

            <h1 className="mt-5 font-display text-5xl leading-tight text-teal-900 sm:text-6xl lg:text-7xl">
              Page not
              <span className="block text-teal-600">found.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-md text-base leading-7 text-ink-soft lg:mx-0">
              Sorry, we couldn't find the page you're looking for. It may
              have been moved, removed, or the link might be incorrect.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <a
                href="/"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-900 px-7 py-3.5 font-semibold text-cream transition hover:bg-teal-700 sm:w-auto"
              >
                <ArrowLeft size={17} />
                Back to home
              </a>

              <a
                href="/products"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-paper px-7 py-3.5 font-semibold text-teal-900 transition hover:border-teal-300 hover:bg-teal-50 sm:w-auto"
              >
                <Pill size={17} />
                Browse products
              </a>
            </div>

            <p className="mt-6 text-xs font-medium text-ink-soft">
              Error code: 404 · Page unavailable
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative flex h-[330px] items-center justify-center sm:h-[390px]"
          >
            <div className="absolute h-64 w-64 rounded-full border border-dashed border-teal-200 sm:h-80 sm:w-80" />

            <div className="absolute h-48 w-48 rounded-full bg-teal-50 sm:h-60 sm:w-60" />

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative z-10"
            >
              <div className="relative flex h-44 w-44 items-center justify-center rounded-[2rem] border border-line bg-paper shadow-xl sm:h-52 sm:w-52">
                <div className="absolute inset-4 rounded-[1.5rem] border border-dashed border-teal-200" />

                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 sm:h-24 sm:w-24">
                  <Search size={38} strokeWidth={1.7} />
                </div>

                <div className="absolute -right-5 -top-5 flex h-12 w-12 items-center justify-center rounded-full bg-teal-900 text-cream shadow-lg">
                  <FileQuestion size={21} />
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0], rotate: [0, 2, 0] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
              className="absolute bottom-5 left-4 rounded-2xl border border-line bg-paper px-4 py-3 shadow-lg sm:left-10"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-100 text-teal-700">
                  <Pill size={18} />
                </div>

                <div>
                  <p className="text-[11px] text-ink-soft">Search status</p>
                  <p className="text-sm font-semibold text-teal-900">
                    No match found
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="absolute right-2 top-5 rounded-2xl border border-line bg-paper px-4 py-3 shadow-lg sm:right-8"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                <span className="text-xs font-semibold text-teal-900">
                  Page unavailable
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
