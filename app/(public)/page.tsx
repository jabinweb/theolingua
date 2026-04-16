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
import { Play, BookOpen, Video, Gamepad2, FileText, Users, Award, CheckCircle2, Star, Quote, Globe, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// --- 1. NAVIGATION BAR ---
function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-colors duration-300 ${scrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-2xl tracking-tight text-theo-black">
            TheoLingua<span className="text-theo-yellow">.</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold tracking-wide">
            <Link href="#about" className="hover:text-theo-yellow transition-colors">About</Link>
            <Link href="#program" className="hover:text-theo-yellow transition-colors">The Program</Link>
            <Link href="#how-it-works" className="hover:text-theo-yellow transition-colors">How It Works</Link>
            <Link href="#institutions" className="hover:text-theo-yellow transition-colors">For Institutions</Link>
            <Link href="#testimonials" className="hover:text-theo-yellow transition-colors">Testimonials</Link>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/auth/login" className="text-sm font-semibold hover:text-theo-yellow transition-colors hidden md:block">
            Sign In
          </Link>
          <Button className="bg-theo-yellow hover:bg-[#b0bd2a] text-theo-black rounded-full px-6 font-bold shadow-none">
            Get Demo
          </Button>
        </div>
      </div>
    </header>
  );
}

// --- 2. HERO ---
function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-end pb-16 pt-28 md:pb-20 md:pt-32 bg-theo-black text-theo-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://videos.pexels.com/video-files/5183314/5183314-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/80 to-[#1A1A1A]/40 z-10" />
      </div>

      <div className="container mx-auto px-6 relative z-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-[60px] font-bold leading-tight tracking-tight mb-6 text-white drop-shadow-xl">
            Learn English to study Theology <br className="hidden md:block" />with <span className="text-theo-yellow">TheoLingua.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl leading-relaxed">
            An English for Specific Purposes (ESP) program for theological students in India — from foundational English to academic readiness, aligned to the CEFR international language framework.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
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

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="w-full border-t border-white/20 pt-8 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 md:gap-4">
            {[
              { icon: '📖', text: '3 Levels · A1 to B2+' },
              { icon: '🎬', text: '250+ Learning Videos' },
              { icon: '🕐', text: '150+ Hours of Content' },
              { icon: '🎓', text: '100+ Students · 8+ Colleges' }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5 text-sm font-medium text-white/90">
                <span className="text-lg">{stat.icon}</span>
                <span>{stat.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// --- 3. THE CHALLENGE ---
function Challenge() {
  const painPoints = [
    { icon: <BookOpen className="w-6 h-6" />, text: "General English courses don't prepare theology students for academic reading and study." },
    { icon: <FileText className="w-6 h-6" />, text: "Students struggle to read, understand, and discuss theological texts in English." },
    { icon: <Video className="w-6 h-6" />, text: "Many find it difficult to write sermons, assignments, and research papers clearly." },
    { icon: <Globe className="w-6 h-6" />, text: "Limited English makes it hard to use commentaries, journals, and global resources." },
    { icon: <Users className="w-6 h-6" />, text: "Communicating in ministry — letters, emails, and presentations — remains a challenge." },
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-theo-white text-theo-black">
      <div className="container mx-auto px-6 max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 max-w-2xl tracking-tighter">Is English becoming a barrier?</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {painPoints.map((point, idx) => (
            <Card key={idx} className="border-0 shadow-lg shadow-black/5 bg-white rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-8 h-full flex flex-col">
                <div className="w-12 h-12 rounded-full bg-theo-tint flex items-center justify-center text-theo-black mb-6">
                  {point.icon}
                </div>
                <p className="text-lg leading-relaxed text-gray-700">{point.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center gap-4 border-t border-gray-200 pt-10">
          <h3 className="text-2xl font-bold italic tracking-tight text-gray-800">But it doesn't have to be this way...</h3>
          <div className="w-12 h-2 rounded-full bg-theo-yellow" />
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

// --- 5. THE LEARNING PATHWAY ---
function Pathway() {
  return (
    <section className="py-16 md:py-24 bg-theo-white text-theo-black">
      <div className="container mx-auto px-6 max-w-6xl">
        <p className="text-sm font-bold tracking-[0.15em] uppercase text-gray-500 mb-4">The Learning Pathway</p>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 max-w-2xl tracking-tighter">A clear path from basic English to academic readiness</h2>
        <p className="text-lg text-gray-600 mb-16 max-w-3xl leading-relaxed">
          TheoLingua is structured across three levels, each mapped to the international CEFR framework — so you always know where you are and where you're going.
        </p>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Vertical Bracket simulation */}
          <div className="hidden lg:flex w-16 items-stretch justify-center relative">
            <div className="absolute top-8 bottom-8 w-1 bg-gray-200 rounded-full" />
            <div className="absolute top-8 w-4 h-4 rounded-full border-4 border-theo-white bg-gray-400" />
            <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-theo-white bg-theo-yellow z-10" />
            <div className="absolute bottom-8 w-4 h-4 rounded-full border-4 border-theo-white bg-gray-400" />
          </div>

          <div className="flex-1 flex flex-col gap-8">
            {/* Level 1 */}
            <Card className="rounded-[32px] border-none shadow-md bg-white overflow-hidden p-2">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <h3 className="text-2xl font-bold">Level 1: Foundations</h3>
                  <div className="px-3 py-1 bg-theo-yellow/20 text-theo-black font-bold text-sm rounded-full">CEFR: A1 → A2</div>
                  <span className="text-gray-500 px-2 font-medium">45+ hrs · 8 units</span>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Build foundational English using biblical texts. Focus: listening, speaking, basic reading and writing. Includes songs, memory verses, and vocabulary sets.
                </p>
              </CardContent>
            </Card>

            {/* Level 2 (Active) */}
            <Card className="rounded-[32px] border-2 border-theo-yellow shadow-xl bg-white overflow-hidden p-2 relative -ml-0 lg:-ml-6 z-10 transfrom scale-[1.02]">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <h3 className="text-3xl font-bold">Level 2: Academic English</h3>
                  <div className="px-3 py-1 bg-theo-yellow text-theo-black font-bold text-sm rounded-full">CEFR: A2 → B1+</div>
                  <span className="text-gray-500 px-2 font-medium">40+ hrs · 6 units</span>
                </div>
                <p className="text-gray-700 text-xl leading-relaxed font-medium">
                  Develop the language of theological study. Focus: academic reading and writing, with articles, podcasts, and complex grammar for Scripture engagement.
                </p>
              </CardContent>
            </Card>

            {/* Level 3 */}
            <Card className="rounded-[32px] border-none shadow-md bg-gray-50 overflow-hidden p-2 opacity-80">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">Level 3: Writing Lab</h3>
                  <div className="px-3 py-1 bg-gray-200 text-gray-700 font-bold text-sm rounded-full">CEFR: B1+ → B2+</div>
                  <span className="text-gray-500 px-2 font-medium">60+ hrs</span>
                  <div className="px-3 py-1 border border-gray-300 text-gray-500 font-bold text-xs rounded-full ml-auto uppercase tracking-wider">Coming soon</div>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Master academic writing for essays, assignments, and research. Practice-driven: observe, practise, apply, produce.
                </p>
              </CardContent>
            </Card>
          </div>
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

// --- 6. HOW IT WORKS ---
function DeliveryModels() {
  const classRows = [
    "Facilitator-led classes with detailed lesson plans",
    "Full access to the learning portal and workbooks",
    "Unit-wise assessments with answer keys for teachers",
    "Group revision games built into every unit",
    "Enrol in Level 1, 2, or 3",
    "Certificate on completion"
  ];
  const selfRows = [
    "Learn independently through the digital portal",
    "Self-paced assessments at your own speed",
    "Workbook available as an add-on",
    "Progress tracked automatically",
    "Flexible enrolment per level",
    "Certificate on completion"
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
          {/* Classroom */}
          <Card className="rounded-[32px] border border-gray-200 shadow-lg bg-white overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="p-10 flex-1 flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">🏫</div>
                <h3 className="text-3xl font-bold">Classroom Model</h3>
              </div>
              <ul className="space-y-6 flex-1">
                {classRows.map((row, i) => (
                  <li key={i} className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-theo-yellow shrink-0" />
                    <span className="text-lg text-gray-700">{row}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Self-learning */}
          <Card className="rounded-[32px] border-[3px] border-theo-yellow shadow-xl bg-white overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300 relative">
            <div className="absolute top-0 right-10 bg-theo-yellow text-theo-black px-4 py-1.5 rounded-b-xl text-sm font-bold tracking-wide uppercase">Recommended</div>
            <CardContent className="p-10 flex-1 flex flex-col pt-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-theo-tint rounded-full flex items-center justify-center text-2xl">💻</div>
                <h3 className="text-3xl font-bold">Self-learning Model</h3>
              </div>
              <ul className="space-y-6 flex-1">
                {selfRows.map((row, i) => (
                  <li key={i} className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-theo-yellow shrink-0 flex-shrink-0" fill="#C8D832" color="#1A1A1A" strokeWidth={1} />
                    <span className="text-lg text-gray-800 font-medium">{row}</span>
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

// --- 8. POWERED BY SCIOLABS ---
function CredibilityStrip() {
  return (
    <section className="bg-theo-tint py-16">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/3">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              Powered by ScioLabs <sup className="text-xs">&reg;</sup>
            </h3>
            <p className="text-base text-gray-800 leading-relaxed font-medium">
              TheoLingua is built by ScioLabs, an educational innovation organisation with experience designing learning programs for institutions including ONGC, AIIMS, and national training bodies. In the theological space, ScioLabs works closely with the ATA and leading seminaries across India.
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

// --- 9. STUDENT TESTIMONIALS ---
function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quotes = [
    { quote: "TheoLingua transformed how I read commentaries. I can now actively participate in deep theological discussions without hesitation.", author: "Birila A. Yimchunger", meta: "Level 2, Olive Theological College" },
    { quote: "I wrote and practiced my very first sermon efficiently. The grammar modules built into Scripture made everything click for me.", author: "Samuel M.", meta: "Level 1, Grace Seminary" },
    { quote: "As a facilitator, the lesson plans save me hours of prep. The interactive games keep my GenZ students completely engaged.", author: "Dr. Abraham K.", meta: "Faculty, Southern Bible Institute" },
    { quote: "I passed my assignments with confidence. Previously, academic writing was a nightmare, but the structured practice truly helps.", author: "Esther R.", meta: "Level 2, Bethel College" },
  ];

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // Calculate index based on the proportion of scroll
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll <= 0) return;
      
      const percentage = scrollLeft / maxScroll;
      const index = Math.round(percentage * (quotes.length - 1));
      setActiveIndex(index);
    }
  };

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-white text-theo-black overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-sm font-bold tracking-[0.15em] uppercase text-gray-500 mb-4">Students speak</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter">Hear it from the learners</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Theological students who are reading Scripture, writing assignments, and speaking English with newfound confidence.
          </p>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="relative group">
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="grid grid-auto-flow-col auto-cols-[min(80vw,400px)] lg:grid-cols-4 lg:auto-cols-auto overflow-x-auto lg:overflow-x-visible gap-6 pb-8 snap-x snap-mandatory no-scrollbar -mx-6 px-6"
            style={{ gridAutoFlow: 'column' }}
          >
            {quotes.map((q, idx) => (
              <div key={idx} className="flex flex-col h-full snap-center">
                <Card className="rounded-[24px] md:rounded-[32px] border-none shadow-lg shadow-black/5 bg-theo-white h-full hover:shadow-xl transition-shadow w-full overflow-hidden">
                  <CardContent className="p-6 md:p-8 h-full flex flex-col">
                    <Quote className="w-12 h-12 text-theo-yellow mb-6 shrink-0" fill="#C8D832" />
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed font-medium mb-8 grow break-words whitespace-normal">"{q.quote}"</p>
                    <div className="mt-auto">
                      <p className="font-bold text-theo-black text-base md:text-lg leading-tight">{q.author}</p>
                      <p className="text-gray-500 text-xs md:text-sm mt-1">{q.meta}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Indicators for mobile */}
          <div className="flex justify-center gap-2 mt-4 lg:hidden">
            {quotes.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeIndex === i ? 'bg-theo-yellow w-6' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-8">
          <div className="flex items-center gap-3">
            <div className="flex"><Star className="w-5 h-5 text-theo-yellow" fill="currentColor" /><Star className="w-5 h-5 text-theo-yellow" fill="currentColor" /><Star className="w-5 h-5 text-theo-yellow" fill="currentColor" /><Star className="w-5 h-5 text-theo-yellow" fill="currentColor" /><Star className="w-5 h-5 text-theo-yellow" fill="currentColor" /></div>
            <span className="font-bold text-gray-800 tracking-wide text-lg">5★ Average Rating</span>
          </div>
          <p className="font-medium text-gray-600">100+ Happy Students</p>
          <p className="font-medium text-gray-600 text-sm bg-gray-100 px-4 py-2 rounded-full">95% Satisfaction (based on end-of-level survey)</p>
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
            { num: "01", title: "Book a demo", desc: "We walk you through the program, portal, and workbooks in a free 45-minute session." },
            { num: "02", title: "Facilitator training", desc: "Your teachers receive full training on lesson plans, assessments, and classroom delivery." },
            { num: "03", title: "Launch your cohort", desc: "Students get portal access and workbooks. You receive progress reports and answer keys." }
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
          <Button className="bg-theo-yellow hover:bg-[#b0bd2a] text-theo-black rounded-full px-12 py-8 text-xl font-bold shadow-2xl mb-6">
            Book a Free Demo
          </Button>
          <p className="text-sm font-semibold text-gray-400 flex items-center justify-center gap-3 flex-wrap">
            <span>No credit card required</span>
            <span>&middot;</span>
            <span>Free 45-minute session</span>
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
  const faqs = [
    { q: "What level should I start at?", a: "If you are new to English or find reading and writing in English very difficult, start with Level 1 (A1–A2). If you already understand basic English but struggle with academic or theological texts, Level 2 is the right fit. Not sure? Book a free demo and we will help you place yourself." },
    { q: "Do I need a facilitator, or can I learn on my own?", a: "Both options are available. The Classroom Model is facilitator-led and works well in seminaries and Bible colleges. The Self-learning Model lets you study independently through the portal at your own pace, with all content fully accessible." },
    { q: "Will I receive a certificate?", a: "Yes. Students who complete any level receive a TheoLingua certificate of completion, which can be used as a record of your English and theological language training." },
    { q: "How long do I have access to the platform?", a: "Access is available for the duration of the enrolled level. Institutions can extend access as needed. Contact us at info@sciolabs.in for custom plans." },
    { q: "Is the program suitable for beginners?", a: "Yes. Level 1 is designed specifically for students with very basic or no English foundation. It begins with everyday vocabulary and simple grammar before introducing biblical and theological language." },
    { q: "Can institutions customise the program?", a: "Yes. Institutions can choose which level to deploy, request a customised schedule, and receive facilitator training tailored to their context. Book a demo to discuss your institution's needs." }
  ];

  return (
    <section className="py-16 md:py-24 bg-white text-theo-black">
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 tracking-tighter text-center">Frequently asked questions</h2>

        <Accordion type="multiple" defaultValue={["item-0", "item-1", "item-2"]} className="space-y-4">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="bg-theo-white rounded-2xl border border-gray-100 overflow-hidden px-6 data-[state=open]:border-l-[6px] data-[state=open]:border-l-theo-yellow transition-all shadow-sm">
              <AccordionTrigger className="text-xl font-bold hover:no-underline py-6 data-[state=open]:text-theo-black text-gray-800 text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-lg leading-relaxed pb-6">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

// --- 13. FOOTER ---
function Footer() {
  return (
    <footer className="bg-theo-black text-white pt-24 pb-8">
      <div className="container mx-auto px-6 max-w-7xl border-b border-white/10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          <div className="md:col-span-5 pr-8">
            <Link href="/" className="font-bold text-3xl tracking-tight text-white inline-block mb-6">
              TheoLingua<span className="text-theo-yellow">.</span>
            </Link>
            <p className="text-xl font-bold mb-4 text-white/90">Learn English to study Theology.</p>
            <p className="text-white/60 mb-8 leading-relaxed font-medium">An ESP program by ScioLabs &middot; CEFR-aligned &middot; Designed for theological students in India</p>
            <Button className="bg-theo-yellow hover:bg-[#b0bd2a] text-theo-black rounded-full px-8 py-6 font-bold">
              Book a Free Demo
            </Button>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-sm font-bold tracking-[0.15em] uppercase text-white/40 mb-6">Quick Links</h4>
            <ul className="space-y-4 font-medium text-white/80">
              <li><Link href="#about" className="hover:text-theo-yellow transition-colors">What is TheoLingua</Link></li>
              <li><Link href="#program" className="hover:text-theo-yellow transition-colors">The Program</Link></li>
              <li><Link href="#how-it-works" className="hover:text-theo-yellow transition-colors">How It Works</Link></li>
              <li><Link href="#institutions" className="hover:text-theo-yellow transition-colors">For Institutions</Link></li>
              <li><Link href="#testimonials" className="hover:text-theo-yellow transition-colors">Testimonials</Link></li>
              <li><Link href="#faq" className="hover:text-theo-yellow transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-sm font-bold tracking-[0.15em] uppercase text-white/40 mb-6">Resources & Legal</h4>
            <ul className="space-y-4 font-medium text-white/80">
              <li><Link href="#" className="hover:text-theo-yellow transition-colors">Download Brochure</Link></li>
              <li><Link href="/auth/login" className="hover:text-theo-yellow transition-colors">Student Portal (Sign In)</Link></li>
              <li><Link href="#institutions" className="hover:text-theo-yellow transition-colors">Book a Demo</Link></li>
              <li><Link href="mailto:info@sciolabs.in" className="hover:text-theo-yellow transition-colors">Contact Us</Link></li>
              <li className="pt-4"><Link href="/privacy" className="hover:text-theo-yellow transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-theo-yellow transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="/refunds" className="hover:text-theo-yellow transition-colors text-sm">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-white/40 uppercase tracking-widest text-center md:text-left">
        <div>&copy; 2026 TheoLingua. All rights reserved. | Bible-based English Learning</div>
        <div>Powered by ScioLabs | Built by Jabin Web</div>
      </div>
    </footer>
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
