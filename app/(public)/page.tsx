'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Star, Quote, ArrowRight, ChevronLeft, ChevronRight, BookOpen, FileText, Globe2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { openCalendlyPopup } from '@/lib/calendly';

// --- 1. HERO ---
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center py-24 md:py-28 pt-28 md:pt-32 bg-theo-black text-theo-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://videos.pexels.com/video-files/5183314/5183314-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/85 to-[#1A1A1A]/50 z-10" />
      </div>

      <div className="container relative z-20 mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center"
          >
            <h1 className="mb-6 text-4xl font-bold leading-[1.12] tracking-tight text-white drop-shadow-xl md:text-5xl lg:text-[56px]">
              Learn English to study Theology <br className="hidden sm:block" />
              with <span className="text-theo-yellow">TheoLingua.</span>
            </h1>
            <p className="mb-10 max-w-4xl text-lg leading-relaxed text-white/90 md:text-xl md:leading-relaxed lg:text-[1.35rem] lg:leading-relaxed">
              Read Scripture. Write assignments. Speak with confidence. Go from basic English to theological fluency — one level at a time.
            </p>
            <div className="flex w-full flex-col justify-center gap-4 sm:flex-row sm:w-auto">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button className="w-full rounded-full bg-theo-yellow px-8 py-6 text-lg font-bold text-theo-black hover:bg-[#b0bd2a] sm:w-auto">
                  Start Learning Free
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full rounded-full border-white bg-transparent px-8 py-6 text-lg font-bold text-white hover:bg-white hover:text-theo-black sm:w-auto"
              >
                Download Brochure
              </Button>
            </div>

            {/* Stat highlights — separate band below CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2 }}
              className="mt-14 w-full max-w-5xl pt-12 md:mt-16 md:pt-14"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
                {[
                  {
                    line: '3 Levels',
                    sub: 'CEFR A1 to B2+',
                  },
                  {
                    line: '400+ students',
                    sub: '8+ colleges',
                  },
                  {
                    line: 'Rich curriculum',
                    sub: '250+ videos · 150+ hours',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.07] px-5 py-7 text-center shadow-none backdrop-blur-sm transition-shadow duration-300 hover:border-theo-yellow/55 hover:bg-white/[0.12] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)] md:px-6 md:py-8"
                  >
                    <p className="text-lg font-bold tracking-tight text-white md:text-xl">{item.line}</p>
                    <p className="mt-2 text-sm font-medium leading-snug text-white/75 transition-colors group-hover:text-white/90 md:text-base">
                      {item.sub}
                    </p>
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-theo-yellow transition-transform duration-300 group-hover:scale-x-100"
                      aria-hidden
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// --- 2. THE CHALLENGE ---
function Challenge() {
  const painCards = [
    {
      icon: BookOpen,
      title: 'Reading & discussion',
      line: 'Theological texts and seminars stay hard in English.',
    },
    {
      icon: FileText,
      title: 'Writing & papers',
      line: 'Sermons, essays, and assignments need clearer expression.',
    },
    {
      icon: Globe2,
      title: 'Ministry & resources',
      line: 'Commentaries, email, and global voices stay out of reach.',
    },
  ];

  return (
    <section id="about" className="overflow-x-hidden bg-white py-20 text-theo-black md:py-28">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid min-w-0 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">The challenge</p>
            <h2 className="mb-8 text-4xl font-bold tracking-tighter md:text-5xl lg:mb-10">
              Is English becoming a barrier?
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-1 lg:gap-5">
              {painCards.map(({ icon: Icon, title, line }, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: idx * 0.06 }}
                  className="group flex gap-4 rounded-3xl border border-gray-100 bg-theo-white p-5 shadow-sm transition-all duration-300 hover:border-theo-yellow/40 hover:shadow-md md:p-6"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-theo-yellow/20 text-theo-black transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-7 w-7" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="font-bold leading-snug text-theo-black">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600 md:text-base">{line}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 flex items-center gap-3 border-t border-gray-100 pt-10">
              <div className="h-1 w-10 rounded-full bg-theo-yellow" />
              <p className="text-lg font-semibold italic text-gray-800">It doesn&apos;t have to stay that way.</p>
            </div>
          </div>
          <div className="relative flex min-w-0 w-full justify-center lg:justify-end lg:sticky lg:top-28">
            <div className="relative mx-auto aspect-square w-full max-w-[min(100%,28rem)] overflow-hidden sm:max-w-md">
              <div className="absolute inset-0">
                <motion.div
                  className="absolute inset-0 z-10"
                  animate={{
                    borderRadius: [
                      '60% 40% 30% 70%/60% 30% 70% 40%',
                      '30% 60% 70% 40%/50% 60% 30% 60%',
                      '60% 40% 30% 70%/60% 30% 70% 40%',
                    ],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  style={{
                    background: 'linear-gradient(45deg, rgba(164, 199, 255, 0.7), rgba(147, 197, 253, 0.8))',
                  }}
                />
                <div className="absolute inset-0 z-20 sm:-inset-6 md:-inset-10 lg:-inset-14">
                  <Image
                    src="/5.png"
                    alt="Stressed student struggling with traditional revision methods"
                    width={600}
                    height={600}
                    className="h-full w-full object-contain sm:scale-105"
                    priority
                    quality={95}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- 3. WHAT IS THEOLINGUA? (bento — short labels, visual tiles) ---
function FeatureESP() {
  const features = [
    { icon: '📖', title: 'Bible-first ESP', desc: 'Grammar & vocab from Scripture & Christian texts.', className: 'md:col-span-1' },
    { icon: '🎬', title: '250+ video lessons', desc: 'Self-paced on the learning portal.', className: 'md:col-span-1' },
    { icon: '🎮', title: 'Games & memory', desc: 'Built for how Gen Z actually learns.', className: 'md:col-span-1' },
    { icon: '📓', title: 'Workbook + LMS', desc: 'Paper practice + digital access together.', className: 'md:col-span-1' },
    { icon: '👨‍🏫', title: 'Teacher-ready', desc: 'Lesson plans, games & facilitator support.', className: 'md:col-span-1' },
    { icon: '🏅', title: 'Certificate', desc: 'Recognition when you complete a level.', className: 'md:col-span-1' },
  ];

  return (
    <section id="program" className="bg-theo-white py-20 text-theo-black md:py-28">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 max-w-2xl md:mb-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">What is TheoLingua?</p>
          <h2 className="text-3xl font-bold tracking-tighter text-theo-black md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            English built for theology — not generic classroom English.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            ESP for seminaries and Bible colleges: lessons, drills, and vocabulary tied to Scripture and ministry.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
              className={cn(
                'flex min-h-[132px] flex-col justify-between rounded-[1.75rem] border border-gray-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-theo-yellow/50 hover:shadow-lg md:min-h-[150px]',
                feature.className
              )}
            >
              <span className="text-3xl" aria-hidden>
                {feature.icon}
              </span>
              <div>
                <h4 className="text-lg font-bold leading-snug text-theo-black">{feature.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 4. THE LEARNING PATHWAY ---
function Pathway() {
  const levels = [
    {
      id: 'l1',
      title: 'Level 1: Foundations',
      badgeClass: 'bg-theo-yellow/20 text-theo-black',
      badge: 'CEFR: A1 → A2',
      meta: '45+ hrs · 8 units',
      body:
        'Foundations with Scripture: listening, speaking, reading, writing — plus songs and memory work.',
    },
    {
      id: 'l2',
      title: 'Level 2: Academic English',
      badgeClass: 'bg-theo-yellow text-theo-black',
      badge: 'CEFR: A2 → B1+',
      meta: '40+ hrs · 6 units',
      body:
        'Academic English for theology: readings, podcasts, and grammar that unlocks serious Scripture study.',
    },
    {
      id: 'l3',
      title: 'Level 3: Writing Lab',
      badgeClass: 'bg-theo-yellow/20 text-theo-black',
      badge: 'CEFR: B1+ → B2+',
      meta: '60+ hrs',
      body:
        'Essays and research writing — observe, practise, apply, and produce with feedback.',
    },
  ] as const;

  const [active, setActive] = useState(0);
  const leftIdx = (active + 2) % 3;
  const centerIdx = active;
  const rightIdx = (active + 1) % 3;
  const ordered = [leftIdx, centerIdx, rightIdx];

  return (
    <section className="overflow-x-hidden bg-white py-20 text-theo-black md:py-28">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 sm:px-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">The learning pathway</p>
        <h2 className="mb-4 max-w-2xl text-4xl font-bold tracking-tighter md:text-5xl">From basic English to academic readiness</h2>
        <p className="mb-10 max-w-xl text-lg text-gray-600">
          Three CEFR-aligned levels — tap or use arrows to explore.
        </p>

        <div className="flex items-center justify-center gap-3 mb-8">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full border-gray-300"
            aria-label="Show previous level"
            onClick={() => setActive((a) => (a + 2) % 3)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full border-gray-300"
            aria-label="Show next level"
            onClick={() => setActive((a) => (a + 1) % 3)}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch">
          {ordered.map((levelIdx, slot) => {
            const level = levels[levelIdx];
            const isCenter = slot === 1;
            return (
              <motion.div
                key={level.id}
                layout
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="h-full"
              >
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => setActive(levelIdx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActive(levelIdx);
                    }
                  }}
                  className={`h-full rounded-[32px] overflow-hidden p-2 cursor-pointer transition-all duration-300 border bg-white ${
                    isCenter
                      ? 'border-2 border-theo-yellow shadow-xl scale-[1.02] md:scale-105 z-10'
                      : 'border border-gray-100 shadow-md hover:shadow-lg hover:border-gray-200'
                  }`}
                >
                  <CardContent className="p-8 md:p-10">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h3 className={`font-bold ${isCenter ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>{level.title}</h3>
                      <div className={`px-3 py-1 font-bold text-sm rounded-full ${level.badgeClass}`}>{level.badge}</div>
                      <span className="text-gray-500 text-sm font-medium">{level.meta}</span>
                    </div>
                    <p className={`text-gray-700 leading-relaxed ${isCenter ? 'text-lg md:text-xl font-medium' : 'text-base md:text-lg'}`}>{level.body}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 text-center max-w-4xl mx-auto border-t border-gray-200 pt-8">
          <p className="text-lg font-bold text-gray-400 tracking-wide flex flex-col md:flex-row items-center justify-center gap-4">
            <span>BASIC ENGLISH</span>
            <ArrowRight className="hidden md:block w-4 h-4 text-theo-yellow" />
            <span className="text-gray-800">ACADEMIC READINESS</span>
            <ArrowRight className="hidden md:block w-4 h-4 text-theo-yellow" />
            <span>MINISTRY FLUENCY</span>
          </p>
        </div>
      </div>
    </section>
  );
}

// --- 5. HOW IT WORKS ---
function DeliveryModels() {
  const classRows = [
    'Facilitator-led classes with detailed lesson plans',
    'LMS access to the learning portal and workbooks',
    'Unit-wise assessments with answer keys for teachers',
    'Group revision games built into every unit',
  ];
  const selfRows = [
    'Learn independently through the digital portal',
    'Self-paced assessments to check learning',
    'Workbook available as an add-on',
    'Flexible enrolment per level',
  ];

  return (
    <section id="how-it-works" className="bg-theo-white py-20 text-theo-black md:py-28">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 text-center md:mb-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Two ways to learn</p>
          <h2 className="mb-4 text-4xl font-bold tracking-tighter md:text-5xl">Classroom or self-paced</h2>
          <p className="mx-auto max-w-lg text-lg text-gray-600">
            Same curriculum — pick the delivery that fits your context.
          </p>
        </div>

        <div className="grid items-stretch gap-6 pt-2 md:grid-cols-2 md:gap-8">
          <Card className="flex flex-col overflow-hidden rounded-[2rem] border border-gray-200 bg-white py-0 shadow-lg transition-transform duration-300 hover:-translate-y-1">
            <CardContent className="flex flex-1 flex-col p-8 md:p-10">
              <h3 className="mb-8 text-2xl font-bold md:text-3xl">Classroom model</h3>
              <ul className="flex-1 border-t border-b border-gray-200 divide-y divide-gray-200">
                {classRows.map((row, i) => (
                  <li key={i} className="py-4 text-lg text-gray-700 leading-relaxed font-medium">
                    {row}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="flex flex-col overflow-hidden rounded-[2rem] border border-gray-200 bg-white py-0 shadow-lg transition-transform duration-300 hover:-translate-y-1">
            <CardContent className="flex flex-1 flex-col p-8 md:p-10">
              <h3 className="mb-8 text-2xl font-bold md:text-3xl">Self-learning model</h3>
              <ul className="flex-1 border-t border-b border-gray-200 divide-y divide-gray-200">
                {selfRows.map((row, i) => (
                  <li key={i} className="py-4 text-lg text-gray-700 leading-relaxed font-medium">
                    {row}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// --- 6. POWERED BY SCIOLABS ---
function CredibilityStrip() {
  return (
    <section className="bg-theo-tint py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start">
          <div className="lg:w-1/3">
            <h3 className="mb-4 text-xl font-bold">
              Powered by ScioLabs<sup className="align-super text-xs">®</sup>
            </h3>
            <p className="text-base font-medium leading-relaxed text-gray-800">
              ScioLabs designs learning programs for institutions (ONGC, NPC, CMAI and more). In theology, we work with the ATA and seminaries across India.
            </p>
          </div>
          <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {[
              { num: "18,000+", label: "learners impacted" },
              { num: "250+", label: "workshops delivered" },
              { num: "ATA", label: "partner organisation" },
              { num: "8+", label: "colleges enrolled" }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm flex flex-col justify-center">
                <div className="text-3xl font-bold text-theo-black mb-2">{stat.num}</div>
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type TestimonialQuote = {
  quote: string;
  author: string;
  meta: string;
};

function TestimonialCard({ q, className }: { q: TestimonialQuote; className?: string }) {
  return (
    <Card
      className={cn(
        'group py-0 relative h-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)] transition-all duration-300',
        'hover:border-theo-yellow/35 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)]',
        className
      )}
    >
      <div className="absolute left-0 top-0 h-full w-1 bg-theo-yellow" aria-hidden />
      <CardContent className="relative flex h-full min-h-[200px] flex-col p-5 pl-6 sm:min-h-0 sm:p-6 sm:pl-7 md:p-7 md:pl-8 lg:p-8">
        <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-theo-yellow/15 sm:h-11 sm:w-11">
            <Quote className="h-5 w-5 text-theo-yellow" fill="#C8D832" />
          </div>
          <span
            className="select-none font-serif text-3xl leading-none text-gray-100 transition-colors group-hover:text-theo-yellow/20 sm:text-4xl"
            aria-hidden
          >
            &ldquo;
          </span>
        </div>
        <blockquote className="mb-6 grow text-[15px] leading-relaxed text-gray-700 sm:mb-8 sm:text-base md:text-[17px] md:leading-relaxed">
          {q.quote}
        </blockquote>
        <footer className="mt-auto border-t border-gray-100 pt-4 sm:pt-5">
          <p className="text-sm font-bold leading-snug text-theo-black sm:text-base md:text-lg">{q.author}</p>
          <p className="mt-1 text-xs font-medium text-gray-500 md:text-sm">{q.meta}</p>
        </footer>
      </CardContent>
    </Card>
  );
}

// --- 8. STUDENT TESTIMONIALS ---
function Testimonials() {
  const quotes: TestimonialQuote[] = [
    { quote: "TheoLingua transformed how I read commentaries. I can now actively participate in deep theological discussions without hesitation.", author: "Birila A. Yimchunger", meta: "Level 2, Grace Biblical Seminary" },
    { quote: "I wrote and practised my very first sermon efficiently. The grammar modules built into Scripture made everything click for me.", author: "Samuel M.", meta: "Level 1, Southern Bible Institute" },
    { quote: "As a facilitator, the lesson plans save me hours of prep. The interactive games keep my GenZ students completely engaged.", author: "Dr. Abraham K.", meta: "Faculty, Bethel Bible College" },
    { quote: "I passed my assignments with confidence. Previously, academic writing was a nightmare, but the structured practice truly helps.", author: "Esther R.", meta: "Level 2, Faith Theological Seminary" },
    { quote: "The portal and workbooks together helped our cohort stay on track. Students finally feel equipped for English-medium classes.", author: "Rev. James P.", meta: "Academic Dean, Bible college in North India" },
  ];

  const [mobileSlide, setMobileSlide] = useState(0);
  const n = quotes.length;

  const goPrev = () => setMobileSlide((i) => (i - 1 + n) % n);
  const goNext = () => setMobileSlide((i) => (i + 1) % n);

  return (
    <section id="testimonials" className="relative overflow-hidden bg-gradient-to-b from-theo-white via-white to-gray-50/60 py-14 text-theo-black sm:py-16 md:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-theo-yellow/40 to-transparent" aria-hidden />
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-xl text-center sm:mb-12 md:mb-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 sm:text-sm">Students speak</p>
          <h2 className="mb-3 text-3xl font-bold tracking-tighter sm:mb-4 sm:text-4xl md:text-5xl">Voices from the classroom</h2>
          <p className="text-base text-gray-600 sm:text-lg">Learners and facilitators on real progress.</p>
        </div>

        {/* Small screens: carousel */}
        <div className="md:hidden">
          <div className="overflow-hidden pb-1">
            <div
              className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] motion-reduce:transition-none"
              style={{ transform: `translateX(-${mobileSlide * 100}%)` }}
            >
              {quotes.map((q, idx) => (
                <div key={idx} className="w-full shrink-0 grow-0 basis-full px-0.5 sm:px-1">
                  <TestimonialCard q={q} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-2 sm:mt-6 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full border-gray-200 bg-white shadow-sm sm:h-11 sm:w-11"
              onClick={goPrev}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex min-w-0 flex-1 flex-wrap justify-center gap-1.5 px-1 sm:gap-2">
              {quotes.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMobileSlide(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  aria-current={mobileSlide === i ? 'true' : undefined}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    mobileSlide === i ? 'w-7 bg-theo-yellow sm:w-8' : 'w-2 bg-gray-300 hover:bg-gray-400'
                  )}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full border-gray-200 bg-white shadow-sm sm:h-11 sm:w-11"
              onClick={goNext}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* md–xl: 3 + 2 rows */}
        <div className="hidden md:block 2xl:hidden">
          <div className="grid grid-cols-2 gap-5 lg:gap-6 xl:grid-cols-3 xl:gap-7">
            {quotes.slice(0, 3).map((q, idx) => (
              <div
                key={idx}
                className={cn(
                  'min-w-0',
                  idx === 2 && 'col-span-2 flex justify-center xl:col-span-1 xl:block'
                )}
              >
                <div className={cn('w-full', idx === 2 && 'max-w-lg xl:max-w-none')}>
                  <TestimonialCard q={q} />
                </div>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-5 sm:max-w-none sm:grid-cols-2 lg:mt-6 lg:gap-6 xl:max-w-4xl">
            {quotes.slice(3).map((q, idx) => (
              <div key={idx + 3} className="min-w-0">
                <TestimonialCard q={q} />
              </div>
            ))}
          </div>
        </div>

        {/* 2xl: single row */}
        <div className="hidden 2xl:grid 2xl:grid-cols-5 2xl:gap-5">
          {quotes.map((q, idx) => (
            <div key={idx} className="min-w-0">
              <TestimonialCard q={q} />
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-gray-100 bg-white/90 px-4 py-5 shadow-sm backdrop-blur-sm sm:mt-12 sm:px-6 sm:py-6 md:mt-14 md:flex md:max-w-none md:items-center md:justify-center md:gap-10 md:px-8 md:py-7">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6 md:gap-10">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <div className="flex gap-0.5" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-5 w-5 text-theo-yellow sm:h-6 sm:w-6" fill="currentColor" />
                ))}
              </div>
              <span className="text-base font-bold tracking-tight text-theo-black sm:text-lg">4.8</span>
              <span className="text-sm font-semibold text-gray-600 sm:text-base">Average rating</span>
            </div>
            <span className="hidden h-8 w-px bg-gray-200 md:block" aria-hidden />
            <p className="text-center text-base font-bold text-theo-black sm:text-lg md:text-left">400+ happy learners</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- 9. FOR INSTITUTIONS ---
function Institutions() {
  return (
    <section id="institutions" className="bg-theo-black py-20 text-theo-white md:py-28">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 text-center md:mb-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">For institutions</p>
          <h2 className="mb-4 text-4xl font-bold tracking-tighter md:text-5xl">Deploy at your seminary or college</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Training, LMS, workbooks, and assessments — we set you up so you can focus on students.
          </p>
        </div>

        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {[
            {
              num: '01',
              title: '30-min demo',
              desc: 'Walk through the program, portal, and materials.',
            },
            {
              num: '02',
              title: 'Train your teachers',
              desc: 'Facilitator training, lesson plans, assessments & keys.',
            },
            {
              num: '03',
              title: 'Launch',
              desc: 'Students on the portal & workbooks; teachers fully equipped.',
            },
          ].map((step, i) => (
            <Card key={i} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 py-0 text-white transition-colors hover:bg-white/10">
              <CardContent className="flex flex-col items-start p-8 md:p-10">
                <span className="mb-5 text-5xl font-bold tracking-tighter text-theo-yellow opacity-90 md:text-6xl">{step.num}</span>
                <h3 className="mb-3 text-xl font-bold md:text-2xl">{step.title}</h3>
                <p className="text-base leading-relaxed text-gray-300">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            type="button"
            className="mb-6 bg-theo-yellow px-12 py-8 text-xl font-bold text-theo-black shadow-2xl hover:bg-[#b0bd2a] rounded-full"
            onClick={() => void openCalendlyPopup()}
          >
            Book a Demo
          </Button>
          <p className="text-sm font-semibold text-gray-400 flex items-center justify-center gap-3 flex-wrap">
            <span>No credit card required</span>
            <span>&middot;</span>
            <span>30-minute session</span>
            <span>&middot;</span>
            <span>For seminaries and Bible colleges</span>
          </p>
        </div>
      </div>
    </section>
  );
}

// --- 10. GET STARTED CTA ---
function GetStartedCTA() {
  return (
    <section className="border-b border-gray-200 bg-white py-20 text-theo-black md:py-28">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-12 text-center md:mb-14">
          <h2 className="mb-3 text-4xl font-bold tracking-tighter md:text-5xl">Start or sign in</h2>
          <p className="mx-auto max-w-md text-lg text-gray-600">Pick up where you left off — or create an account.</p>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-2 md:gap-8">
          <Card className="rounded-[2rem] border border-gray-200 bg-theo-white p-2 shadow-sm">
            <CardContent className="flex h-full flex-col items-center p-8 text-center md:p-10">
              <h3 className="mb-3 text-2xl font-bold">Already enrolled?</h3>
              <p className="mb-8 flex-1 text-gray-600">Open your learning portal.</p>
              <Link href="/auth/login" className="w-full">
                <Button variant="outline" className="w-full rounded-full py-6 text-lg font-bold border-2 border-gray-200 hover:border-gray-300 bg-transparent text-gray-800">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-none bg-theo-black p-2 text-theo-white shadow-xl">
            <CardContent className="flex h-full flex-col items-center p-8 text-center md:p-10">
              <h3 className="mb-3 text-2xl font-bold">New here?</h3>
              <p className="mb-8 flex-1 text-gray-300">Create a free account to explore.</p>
              <Link href="/auth/register" className="w-full">
                <Button className="w-full bg-theo-yellow hover:bg-[#b0bd2a] text-theo-black rounded-full py-6 text-lg font-bold">
                  Start Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm font-bold text-gray-400 flex items-center justify-center gap-3 flex-wrap uppercase tracking-wider">
            <span>No credit card required</span>
            <span className="text-theo-yellow">&bull;</span>
            <span>Free trial available</span>
            <span className="text-theo-yellow">&bull;</span>
            <span>Cancel anytime</span>
          </p>
        </div>
      </div>
    </section>
  );
}

// --- 11. FAQ ---
function FAQSection() {
  const faqsLeft = [
    { q: 'What level should I start at?', a: "If you are new to English or find reading and writing in English very difficult, start with Level 1 (A1–A2). If you already understand basic English but struggle with academic or theological texts, Level 2 is the right fit. Not sure? Book a free demo and we will help you place yourself." },
    { q: 'Do I need a facilitator, or can I learn on my own?', a: 'Both options are available. The Classroom Model is facilitator-led and works well in seminaries and Bible colleges. The Self-learning Model lets you study independently through the portal at your own pace, with all content fully accessible.' },
    { q: 'Will I receive a certificate?', a: 'Yes. Students who complete any level receive a TheoLingua certificate of completion, which can be used as a record of your English and theological language training.' },
  ];
  const faqsRight = [
    { q: 'How long do I have access to the platform?', a: 'Access is available for the duration of the enrolled level. Institutions can extend access as needed. Contact us at info@sciolabs.in for custom plans.' },
    { q: 'Is the program suitable for beginners?', a: 'Yes. Level 1 is designed specifically for students with very basic or no English foundation. It begins with everyday vocabulary and simple grammar before introducing biblical and theological language.' },
    { q: 'Can institutions customise the program?', a: "Yes. Institutions can choose which level to deploy, request a customised schedule, and receive facilitator training tailored to their context. Book a demo to discuss your institution's needs." },
  ];

  const columnClass = 'space-y-4';

  return (
    <section id="faq" className="bg-theo-white py-20 text-theo-black md:py-28">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="mb-10 text-center text-4xl font-bold tracking-tighter md:mb-12 md:text-5xl">FAQs</h2>

        <div className="grid md:grid-cols-2 gap-8 md:gap-10">
          <Accordion type="multiple" defaultValue={[]} className={columnClass}>
            {faqsLeft.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-l-${idx}`} className="bg-theo-white rounded-2xl border border-gray-100 overflow-hidden px-6 data-[state=open]:border-l-[6px] data-[state=open]:border-l-theo-yellow transition-all shadow-sm">
                <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 data-[state=open]:text-theo-black text-gray-800 text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-base leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Accordion type="multiple" defaultValue={[]} className={columnClass}>
            {faqsRight.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-r-${idx}`} className="bg-theo-white rounded-2xl border border-gray-100 overflow-hidden px-6 data-[state=open]:border-l-[6px] data-[state=open]:border-l-theo-yellow transition-all shadow-sm">
                <AccordionTrigger className="text-lg font-bold hover:no-underline py-5 data-[state=open]:text-theo-black text-gray-800 text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-base leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

// --- FULL PAGE EXPORT ---
export default function HomePage() {
  return (
    <div className="min-w-0 overflow-x-hidden bg-theo-white font-sans text-theo-black selection:bg-theo-yellow selection:text-theo-black">
      <Hero />
      <Challenge />
      <FeatureESP />
      <Pathway />
      <DeliveryModels />
      <CredibilityStrip />
      <Testimonials />
      <Institutions />
      <GetStartedCTA />
      <FAQSection />
    </div>
  );
}
