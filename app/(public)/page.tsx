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
import { Star, Quote, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center flex flex-col items-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold leading-tight tracking-tight mb-6 text-white drop-shadow-xl">
              Learn English to study Theology <br className="hidden sm:block" />
              with <span className="text-theo-yellow">TheoLingua.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl leading-relaxed">
              Read Scripture. Write assignments. Speak with confidence. Go from basic English to theological fluency — one level at a time.
            </p>
            <div className="w-full max-w-md border-y border-white/25 divide-y divide-white/20 text-left">
              <p className="py-3.5 text-base md:text-lg font-medium text-white/95 tracking-tight">
                3 Levels - CEFR A1 to B2+
              </p>
              <p className="py-3.5 text-base md:text-lg font-medium text-white/95 tracking-tight">
                400+ students - 8+ colleges
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center w-full sm:w-auto">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button className="bg-theo-yellow hover:bg-[#b0bd2a] text-theo-black rounded-full px-8 py-6 text-lg font-bold w-full sm:w-auto">
                  Start Learning Free
                </Button>
              </Link>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-theo-black rounded-full px-8 py-6 text-lg font-bold bg-transparent w-full sm:w-auto">
                Download Brochure
              </Button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// --- 2. THE CHALLENGE ---
function Challenge() {
  const painPoints = [
    "General English courses don't prepare theology students for academic reading and study.",
    "Students struggle to read, understand, and discuss theological texts in English.",
    "Many find it difficult to write sermons, assignments, and research papers clearly.",
    "Limited English makes it hard to use commentaries, journals, and global resources.",
    "Communicating in ministry — letters, emails, and presentations — remains a challenge.",
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-theo-white text-theo-black">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-10 tracking-tighter">
              Is English becoming a barrier?
            </h2>
            <div className="border-y border-gray-200 divide-y divide-gray-200">
              {painPoints.map((text, idx) => (
                <p key={idx} className="py-4 md:py-5 text-lg leading-relaxed text-gray-700 font-medium">
                  {text}
                </p>
              ))}
            </div>
            <div className="flex items-center gap-4 border-t border-transparent pt-10 mt-2">
              <h3 className="text-2xl font-bold italic tracking-tight text-gray-800">But it doesn&apos;t have to be this way…</h3>
              <div className="w-12 h-2 rounded-full bg-theo-yellow shrink-0" />
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end lg:sticky lg:top-28">
            <div className="relative w-full max-w-md aspect-square">
               {/* Blob container */}
            <div className="relative w-96 h-96">
              {/* Animated blob shape background */}
              <motion.div
                className="absolute inset-0 z-10"
                animate={{
                  borderRadius: [
                    "60% 40% 30% 70%/60% 30% 70% 40%",
                    "30% 60% 70% 40%/50% 60% 30% 60%",
                    "60% 40% 30% 70%/60% 30% 70% 40%"
                  ]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                style={{
                  background: "linear-gradient(45deg, rgba(164, 199, 255, 0.7), rgba(147, 197, 253, 0.8))"
                }}
              />
              
              {/* Image positioned to overflow blob */}
              <div className="absolute -inset-16 z-20">
                <Image
                  src="/5.png"
                  alt="Stressed student struggling with traditional revision methods"
                  width={600}
                  height={600}
                  className="object-contain w-full h-full scale-110"
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

// --- 4. WHAT IS THEOLINGUA? ---
function FeatureESP() {
  const features = [
    { icon: '📖', title: 'Bible-centric content', desc: 'Grammar and vocabulary built directly on Scripture and Christian literature.' },
    { icon: '🎬', title: '250+ video lessons', desc: 'Watch, practise, and revisit every lesson at your own pace on the portal.' },
    { icon: '🎮', title: 'Songs, games & memory verses', desc: 'Interactive and gamified — designed to be memorable for GenZ learners.' },
    { icon: '📓', title: 'Workbook + digital portal', desc: 'Pen-and-paper workbook practice alongside a fully digital learning portal.' },
    { icon: '👨‍🏫', title: 'Facilitator training & support', desc: 'Detailed lesson plans, group revision games, and full teacher training provided.' },
    { icon: '🏅', title: 'Certificate on completion', desc: 'Students receive a TheoLingua certificate when they complete each level.' },
  ];

  return (
    <section id="program" className="py-16 md:py-24 bg-white text-theo-black">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-16 max-w-3xl">
          <p className="text-sm font-bold tracking-[0.15em] uppercase text-gray-500 mb-4">What is TheoLingua?</p>
          <p className="text-2xl leading-relaxed text-gray-800 mb-6 font-medium">
            TheoLingua is an English for Specific Purposes (ESP) program that equips students with the English skills to understand Scripture, participate in theological study, and engage in meaningful ministry communication.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Unlike general English courses, every lesson, vocabulary set, and grammar exercise is built around the Bible, theological literature, and real ministry contexts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
          {features.map((feature, idx) => (
            <div key={idx} className="flex gap-6">
              <div className="w-14 h-14 shrink-0 rounded-full bg-theo-yellow flex items-center justify-center text-2xl shadow-sm">
                {feature.icon}
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
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
        'Build foundational English using biblical texts. Focus: listening, speaking, basic reading and writing. Includes songs, memory verses, and vocabulary sets.',
    },
    {
      id: 'l2',
      title: 'Level 2: Academic English',
      badgeClass: 'bg-theo-yellow text-theo-black',
      badge: 'CEFR: A2 → B1+',
      meta: '40+ hrs · 6 units',
      body:
        'Develop the language of theological study. Focus: academic reading and writing, with articles, podcasts, and complex grammar for Scripture engagement.',
    },
    {
      id: 'l3',
      title: 'Level 3: Writing Lab',
      badgeClass: 'bg-theo-yellow/20 text-theo-black',
      badge: 'CEFR: B1+ → B2+',
      meta: '60+ hrs',
      body:
        'Master academic writing for essays, assignments, and research. Practice-driven: observe, practise, apply, produce.',
    },
  ] as const;

  const [active, setActive] = useState(0);
  const leftIdx = (active + 2) % 3;
  const centerIdx = active;
  const rightIdx = (active + 1) % 3;
  const ordered = [leftIdx, centerIdx, rightIdx];

  return (
    <section className="py-16 md:py-24 bg-theo-white text-theo-black">
      <div className="container mx-auto px-6 max-w-6xl">
        <p className="text-sm font-bold tracking-[0.15em] uppercase text-gray-500 mb-4">The Learning Pathway</p>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 max-w-2xl tracking-tighter">A clear path from basic English to academic readiness</h2>
        <p className="text-lg text-gray-600 mb-10 max-w-3xl leading-relaxed">
          TheoLingua is structured across three levels, each mapped to the international CEFR framework — so you always know where you are and where you&apos;re going.
        </p>

        <p className="text-sm text-gray-500 mb-6 text-center md:text-left">
          Tap a level or use the arrows to explore the pathway in a loop.
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

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
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
    <section id="how-it-works" className="py-16 md:py-24 bg-white text-theo-black">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-sm font-bold tracking-[0.15em] uppercase text-gray-500 mb-4 divider-label">Two Ways To Learn</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter">Two ways to learn TheoLingua</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Whether you are in a seminary classroom or learning on your own, the program fits your context.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch pt-8">
          <Card className="rounded-[32px] border border-gray-200 shadow-lg bg-white py-0 overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="p-10 flex-1 flex flex-col">
              <h3 className="text-3xl font-bold mb-8">Classroom Model</h3>
              <ul className="flex-1 border-t border-b border-gray-200 divide-y divide-gray-200">
                {classRows.map((row, i) => (
                  <li key={i} className="py-4 text-lg text-gray-700 leading-relaxed font-medium">
                    {row}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border border-gray-200 shadow-lg py-0 bg-white overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="p-10 flex-1 flex flex-col">
              <h3 className="text-3xl font-bold mb-8">Self-learning Model</h3>
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

// --- 7. THE THEOLINGUA PROMISE ---
function PromiseSection() {
  const promises = [
    { title: "Confidence in theological English", desc: "Speak, read, and write about Scripture without hesitation." },
    { title: "Stronger core language skills", desc: "Grammar gaps filled through targeted, remedial support." },
    { title: "Visible improvement in weeks", desc: "Structured practice that shows results quickly." },
    { title: "Engaging for GenZ learners", desc: "Songs, games, videos, and digital tools built for today's students." },
    { title: "Practice before production", desc: "Observe, practise, apply, then create — never thrown in at the deep end." },
    { title: "A clear pathway forward", desc: "From basic English to academic readiness, one level at a time." },
  ];

  return (
    <section className="py-16 md:py-24 bg-theo-white text-theo-black">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-sm font-bold tracking-[0.15em] uppercase text-gray-500 mb-4">The TheoLingua Promise</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter">What you will gain</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Every student who completes TheoLingua walks away with something real.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-12 mt-12">
          {promises.map((p, idx) => (
            <div key={idx} className="flex gap-6 items-start">
              <div className="w-14 h-14 shrink-0 rounded-full bg-theo-yellow flex items-center justify-center text-theo-black">
                <Star className="w-6 h-6" fill="currentColor" />
              </div>
              <div className="pt-2">
                <h4 className="text-xl font-bold mb-2">{p.title}</h4>
                <p className="text-gray-600 leading-relaxed text-lg">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 7. POWERED BY SCIOLABS ---
function CredibilityStrip() {
  return (
    <section className="bg-theo-tint py-16">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/3">
            <h3 className="text-xl font-bold mb-4">
              Powered by ScioLabs<sup className="text-xs align-super">®</sup>
            </h3>
            <p className="text-base text-gray-800 leading-relaxed font-medium">
              TheoLingua is built by ScioLabs, an educational innovation organisation with experience designing learning programs for institutions including ONGC, NPC, CMAI and several educational institutions. In the theological space, ScioLabs works closely with the ATA and leading seminaries in pedagogical training across India.
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

// --- 9. STUDENT TESTIMONIALS ---
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
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12 md:mb-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 sm:text-sm">Students speak</p>
          <h2 className="mb-3 text-3xl font-bold tracking-tighter sm:mb-4 sm:text-4xl md:text-5xl">Hear it from the learners</h2>
          <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
            Theological students who are reading Scripture, writing assignments, and speaking English with newfound confidence.
          </p>
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

// --- 10. FOR INSTITUTIONS ---
function Institutions() {
  return (
    <section id="institutions" className="py-16 md:py-24 bg-theo-black text-theo-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-sm font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">For Institutions</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter">Bring TheoLingua to your seminary or Bible college</h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            TheoLingua is designed for classroom deployment. We provide everything your institution needs — facilitator training, assessments, student portals, and ongoing support — so you can focus on your students, not the logistics.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              num: '01',
              title: '30-min demo',
              desc: 'Book a short call — we walk you through the program, LMS, workbooks, and how TheoLingua fits your seminary or Bible college.',
            },
            {
              num: '02',
              title: 'Once onboarded, your teachers…',
              desc: 'Receive facilitator training, detailed lesson plans, unit-wise assessments with answer keys, and ongoing support to lead each level with confidence.',
            },
            {
              num: '03',
              title: 'Launch with clarity',
              desc: 'Students will be given portal access and printed workbooks and teachers will be given lesson plans and assessments with answer keys.',
            },
          ].map((step, i) => (
            <Card key={i} className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden text-white hover:bg-white/10 transition-colors">
              <CardContent className="p-10 flex flex-col items-start">
                <span className="text-6xl font-bold text-theo-yellow opacity-90 tracking-tighter mb-6">{step.num}</span>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-300 leading-relaxed text-lg">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild className="bg-theo-yellow hover:bg-[#b0bd2a] text-theo-black rounded-full px-12 py-8 text-xl font-bold shadow-2xl mb-6">
            <Link href="https://calendly.com/sciolabs-info/30min" target="_blank" rel="noopener noreferrer">
              Book a Demo
            </Link>
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

// --- 11. GET STARTED CTA ---
function GetStartedCTA() {
  return (
    <section className="py-16 md:py-24 bg-theo-white text-theo-black border-b border-gray-200">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter">Ready to transform your English journey?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of theological students who are mastering English through biblical wisdom. Start your journey today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Card 1 */}
          <Card className="rounded-[32px] border border-gray-200 shadow-sm bg-white p-2">
            <CardContent className="p-10 text-center flex flex-col h-full items-center">
              <h3 className="text-2xl font-bold mb-4">Already a student?</h3>
              <p className="text-lg text-gray-600 mb-8 flex-1">Sign in to your learning portal and continue where you left off.</p>
              <Link href="/auth/login" className="w-full">
                <Button variant="outline" className="w-full rounded-full py-6 text-lg font-bold border-2 border-gray-200 hover:border-gray-300 bg-transparent text-gray-800">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="rounded-[32px] border-none shadow-xl bg-theo-black text-theo-white p-2">
            <CardContent className="p-10 text-center flex flex-col h-full items-center">
              <h3 className="text-2xl font-bold mb-4">New to TheoLingua?</h3>
              <p className="text-lg text-gray-300 mb-8 flex-1">Start with a free trial — no credit card required.</p>
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

// --- 12. FAQ ---
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
    <section id="faq" className="py-16 md:py-24 bg-white text-theo-black">
      <div className="container mx-auto px-6 max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 tracking-tighter text-center">FAQs</h2>

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
    <div className="bg-theo-white text-theo-black font-sans selection:bg-theo-yellow selection:text-theo-black">
      <Hero />
      <Challenge />
      <FeatureESP />
      <Pathway />
      <DeliveryModels />
      <PromiseSection />
      <CredibilityStrip />
      <Testimonials />
      <Institutions />
      <GetStartedCTA />
      <FAQSection />
    </div>
  );
}
