'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowRight, Play, LogIn, Globe, Palette, Heart, MapPin, BookOpen, Type, Download, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import BookDemo from '@/components/BookDemo';
import { usePathname } from 'next/navigation';
import ComboSubscriptionDialog from '@/components/dashboard/ComboSubscriptionDialog';

// Hero Section Component
function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section id="hero" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-16">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://videos.pexels.com/video-files/5183314/5183314-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 py-20">
        <div className="max-w-5xl mx-auto">
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-lg">★</span>
                <span className="text-yellow-400 text-lg">★</span>
                <span className="text-yellow-400 text-lg">★</span>
                <span className="text-yellow-400 text-lg">★</span>
                <span className="text-yellow-400 text-lg">★</span>
              </div>
              <span className="text-white/90 text-sm font-medium">Trusted by 100+ Theological Students</span>
            </div>
          </motion.div>

          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center space-y-6 mb-12"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl text-white font-bold tracking-tight leading-tight">
              Master English Through
              <span className="block bg-gradient-to-r from-yellow-300 via-[#fbbf24] to-yellow-300 bg-clip-text text-transparent mt-2">
                Biblical Wisdom
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-white/80 leading-relaxed">
              Transform your English proficiency with a Bible-based curriculum designed specifically for theological students in India.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
          >
            <Link href="/auth/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#f99f1b] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white text-lg h-14 px-10 rounded-full font-semibold transition-all shadow-xl hover:shadow-2xl hover:scale-105 group"
              >
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#features">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white hover:text-gray-900 text-lg h-14 px-10 rounded-full font-semibold transition-all group"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </a>
          </motion.div>
          
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              { icon: '📖', number: '100%', label: 'Bible-Based Curriculum', color: 'from-blue-500/20 to-blue-600/20' },
              { icon: '🎓', number: '500+', label: 'Active Students', color: 'from-[#f99f1b]/20 to-[#d97706]/20' },
              { icon: '⭐', number: '95%', label: 'Success Rate', color: 'from-yellow-500/20 to-[#d97706]/20' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-2xl">
                  <CardContent className="text-center">
                    <div className="text-4xl mb-3">{stat.icon}</div>
                    <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                    <div className="text-sm text-white/80 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex justify-center mt-16"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-white/60"
            >
              <span className="text-sm font-medium">Scroll to explore</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Revision Problems Section
interface ProblemItem {
  id: string;
  description: string;
  emoji: string;
  bgColor: string;
}

const problemItems: ProblemItem[] = [
  {
    id: 'general',
    description: 'General English courses don\'t prepare theology students for academic reading and study.',
    emoji: '📚',
    bgColor: 'bg-brand-100',
  },
  {
    id: 'speaking',
    description: 'Students struggle to read, understand, and discuss theological texts in English.',
    emoji: '😕',
    bgColor: 'bg-brand-100',
  },
  {
    id: 'writing',
    description: 'Many find it difficult to write sermons, assignments, and research papers clearly.',
    emoji: '✍️',
    bgColor: 'bg-yellow-100',
  },
  {
    id: 'opportunities',
    description: 'Limited English makes it hard to use commentaries, journals, and global resources.',
    emoji: '📖',
    bgColor: 'bg-yellow-100',
  },
];

function RevisionProblems() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-red-50 via-[#fffbeb] to-yellow-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-red-50 rounded-full border border-red-100 mb-4 md:mb-6">
            <span className="text-lg md:text-xl">�</span>
            <span className="text-xs md:text-sm font-medium text-red-700">The Challenge</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 tracking-tight text-gray-900 px-4">
            <span className="bg-gradient-to-r from-red-500 to-[#f99f1b] bg-clip-text">
              Is English Becoming a Barrier?
            </span>
          </h2>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Column - Problems */}
          <motion.div 
            className="space-y-3 md:space-y-4 order-2 lg:order-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {problemItems.map((item) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-[#f99f1b]">
                  <CardContent>
                    <div className="flex items-start gap-4 md:gap-5">
                      {/* Emoji Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl ${item.bgColor} flex items-center justify-center text-2xl md:text-3xl shadow-sm`}>
                        {item.emoji}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pt-1.5">
                        <p className="text-gray-700 leading-relaxed text-lg">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Column - Image with Blob Effect */}
          <motion.div 
            className="relative flex justify-center items-center order-1 lg:order-2"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
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
                  src="https://sprints.sciolabs.in/_next/image?url=%2F5.png&w=1200&q=95"
                  alt="Stressed student struggling with traditional revision methods"
                  width={600}
                  height={400}
                  className="object-contain w-full h-full scale-110"
                  priority
                  quality={95}
                  onError={(e) => {
                    console.log('Image load error');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom transition element */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#fffbeb] to-yellow-50 rounded-full border border-brand-200">
            <span className="text-sm md:text-base font-medium text-brand-dark">But it doesn&apos;t have to be this way...</span>
            <motion.span 
              className="text-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              💡
            </motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// TheoLingua Features Section
function TheoLinguaFeatures() {
  const promises = [
    {
      icon: <BookOpen className="w-10 h-10" />,
      title: 'Bible-Centric Content',
      description: 'The curriculum is based on the Bible and Christian literature which serve as the backbone of grammar teaching and practice.',
      bgGradient: 'from-[#f99f1b]/10 to-[#d97706]/10',
      iconColor: 'text-brand',
      hoverColor: 'group-hover:shadow-brand-100'
    },
    {
      icon: <Globe className="w-10 h-10" />,
      title: 'Digitally-Integrated Resources',
      description: 'The curriculum is fully developed with video lessons, classroom activities, digital assignments, digital assessments and more.',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      iconColor: 'text-blue-600',
      hoverColor: 'group-hover:shadow-blue-200'
    },
    {
      icon: '🎮',
      title: 'Interactive Learning',
      description: 'Unlike traditional language learning, this program is designed in a fun and engaging manner which makes learning memorable.',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
      iconColor: 'text-green-600',
      hoverColor: 'group-hover:shadow-green-200'
    },
    {
      icon: '💬',
      title: 'Student-Centric Approach',
      description: 'Tailored to meet the needs and interests of theological students, ensuring active participation and engagement.',
      bgGradient: 'from-[#f99f1b]/10 to-red-500/10',
      iconColor: 'text-brand',
      hoverColor: 'group-hover:shadow-brand-100'
    },
    {
      icon: <FileText className="w-10 h-10" />,
      title: 'Blended Learning Model',
      description: 'A digital curriculum combined with physical facilitator support for the best learning experience.',
      bgGradient: 'from-indigo-500/10 to-purple-500/10',
      iconColor: 'text-indigo-600',
      hoverColor: 'group-hover:shadow-indigo-200'
    },
    {
      icon: '👨‍🏫',
      title: 'Facilitator Training & Support',
      description: 'Comprehensive training and support for facilitators to deliver the curriculum effectively.',
      bgGradient: 'from-pink-500/10 to-rose-500/10',
      iconColor: 'text-pink-600',
      hoverColor: 'group-hover:shadow-pink-200'
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-50 to-brand-100 border border-brand-200 rounded-full mb-6">
            <span className="text-2xl">✨</span>
            <span className="text-sm font-semibold text-brand-800 tracking-wide">THE SOLUTION</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-[#d97706] via-[#f99f1b] to-[#d97706] bg-clip-text text-transparent">
              What is TheoLingua?
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            At TheoLingua, we offer a unique approach to learning English by integrating biblical texts and theological literature into our curriculum. Our program is specifically designed for theological students in India who wish to enhance their language skills while deepening their understanding of the Bible.
          </p>
        </motion.div>

        {/* Intro Video Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto mb-20"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gray-200">
            <div className="relative" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://www.youtube.com/embed/aRzqp8wPmjo"
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="TheoLingua Introduction Video"
              />
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promises.map((promise, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white relative overflow-hidden h-full ${promise.hoverColor}`}>
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${promise.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <CardContent className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${promise.bgGradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      {typeof promise.icon === 'string' ? (
                        <span className="text-4xl">{promise.icon}</span>
                      ) : (
                        <div className={promise.iconColor}>{promise.icon}</div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-brand-dark transition-colors">
                    {promise.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {promise.description}
                  </p>

                  {/* Decorative Element */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-gray-100/50 to-transparent rounded-tl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Games Data (shortened for file size)
interface GameData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  icon: React.ReactNode;
  iframe: {
    src: string;
    width: number;
    height: number;
    allow?: string;
  };
  color: string;
}

const gamesData: GameData[] = [
  {
    id: 'countries',
    title: 'Countries & Capitals',
    description: 'Match the countries with their capitals before time runs out!',
    category: 'Geography',
    difficulty: 'Medium',
    icon: <Globe className="w-5 h-5" />,
    iframe: {
      src: 'https://wordwall.net/embed/play/97069/953/922',
      width: 500,
      height: 380,
    },
    color: 'from-blue-600 to-blue-700',
  },
  {
    id: 'colors',
    title: 'Colour Search',
    description: 'Find the names of the colours hidden in this wordsearch grid.',
    category: 'Vocabulary',
    difficulty: 'Easy',
    icon: <Palette className="w-5 h-5" />,
    iframe: {
      src: 'https://www.educaplay.com/game/25247811-color_quest_word_search.html',
      width: 795,
      height: 690,
      allow: 'fullscreen; autoplay; allow-top-navigation-by-user-activation',
    },
    color: 'from-[#f99f1b] to-[#d97706]',
  },
  {
    id: 'emotions',
    title: 'Emotions',
    description: 'Can you rearrange the words and find the names of emotions?',
    category: 'Social Learning',
    difficulty: 'Easy',
    icon: <Heart className="w-5 h-5" />,
    iframe: {
      src: 'https://wordwall.net/embed/play/97070/887/862',
      width: 500,
      height: 380,
    },
    color: 'from-blue-500 to-[#f99f1b]',
  },
  {
    id: 'cities',
    title: 'Indian Cities',
    description: 'Guess the names of these cities using the clues given.',
    category: 'Geography',
    difficulty: 'Medium',
    icon: <MapPin className="w-5 h-5" />,
    iframe: {
      src: 'https://wordwall.net/embed/play/97070/306/480',
      width: 500,
      height: 380,
    },
    color: 'from-[#d97706] to-[#b45309]',
  },
  {
    id: 'verbs',
    title: 'Irregular Verbs',
    description: 'Test your English skills by hitting the moles, the irregular verbs!',
    category: 'Language',
    difficulty: 'Hard',
    icon: <BookOpen className="w-5 h-5" />,
    iframe: {
      src: 'https://wordwall.net/embed/play/97071/185/784',
      width: 500,
      height: 380,
    },
    color: 'from-blue-700 to-blue-800',
  },
  {
    id: 'speech',
    title: 'Adjectives or Adverbs',
    description: 'Is it an adjective or an adverb, or both?',
    category: 'Language',
    difficulty: 'Medium',
    icon: <Type className="w-5 h-5" />,
    iframe: {
      src: 'https://www.educaplay.com/game/25247848-noun_adjective_adverb_sentences.html',
      width: 795,
      height: 690,
      allow: 'fullscreen; autoplay; allow-top-navigation-by-user-activation',
    },
    color: 'from-[#f99f1b] to-blue-600',
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Hard':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

// Try Games Section
function TryGamesSection() {
  return (
    <section id="games" className="py-24 bg-gradient-to-b from-green-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-brand-blue/20 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-brand-orange/20 rounded-full blur-3xl opacity-30" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 mb-6">
            <Play className="w-4 h-4 text-brand" />
            <span className="text-sm font-medium text-gray-600">Interactive Learning</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-[#f99f1b] to-[#d97706] bg-clip-text text-transparent">
              Try Our Games
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            TheoLingua makes learning engaging and memorable. Jump in and explore! Play a few sample games to check your English levels — quick, fun, and easy.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="countries" className="w-full">
            {gamesData.map((game) => (
              <TabsContent key={game.id} value={game.id} className="mt-8">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden gap-0">
                  <CardHeader className={`bg-gradient-to-r ${game.color} text-white relative overflow-hidden pt-8`}>
                    <div className="absolute inset-0 bg-white/10 bg-grid-pattern" />
                    
                    <div className="relative">
                      <div className="flex justify-center mb-6">
                        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm rounded-2xl p-2 h-auto">
                          {gamesData.map((gameTab) => (
                            <TabsTrigger
                              key={gameTab.id}
                              value={gameTab.id}
                              className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-white/30 data-[state=active]:shadow-sm transition-all duration-200 group min-h-[80px] text-center"
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 group-data-[state=active]:bg-white/40 transition-colors">
                                <div className="text-white/80 group-data-[state=active]:text-white transition-colors">
                                  {gameTab.icon}
                                </div>
                              </div>
                              <span className="text-xs font-medium text-white/80 group-data-[state=active]:text-white leading-tight">
                                {gameTab.title}
                              </span>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="mb-4 text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                              <Badge variant="secondary" className={`${getDifficultyColor(game.difficulty)} border text-sm py-1 px-2`}>
                                {game.difficulty}
                              </Badge>
                              <p className="text-white/90 text-sm font-medium">
                                {game.category}
                              </p>
                            </div>
                            <p className="text-white/90 text-lg leading-relaxed mx-auto max-w-2xl">
                              {game.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    <div className="w-full h-[600px]">
                      <iframe
                        src={game.iframe.src}
                        frameBorder="0"
                        allowFullScreen
                        allow={game.iframe.allow}
                        className="w-full h-full"
                        style={{ minHeight: '600px' }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}

// Pricing Section (Hidden for TheoLingua - institutional program)
function PricingSection() {
  // TheoLingua is offered through institutions, not individual pricing
  return null;
}

// Original Pricing Section (kept for reference/future use)
function PricingSectionOriginal() {
  const { data: session } = useSession();
  const router = useRouter();
  const [pricingData, setPricingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<{ planName: string; duration: string; price: string; classSlug: string } | null>(null);
  const [comboDialogOpen, setComboDialogOpen] = useState(false);
  const [selectedComboDuration, setSelectedComboDuration] = useState(3);
  const [basicsWorkbookSelected, setBasicsWorkbookSelected] = useState(false);
  const [advancedWorkbookSelected, setAdvancedWorkbookSelected] = useState(false);
  const [comboWorkbooksSelected, setComboWorkbooksSelected] = useState(false);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        // Fetch pricing for TheoLingua programs
        const responses = await Promise.all([
          fetch('/api/programs/pricing?slug=theolingua-basics'),
          fetch('/api/programs/pricing?slug=theolingua-advanced')
        ]);

        const [basicsData, advancedData] = await Promise.all(
          responses.map(r => r.json())
        );

        setPricingData({
          basics: basicsData,
          advanced: advancedData
        });
      } catch (error) {
        console.error('Error fetching pricing:', error);
        // Fallback to hardcoded pricing if API fails
        setPricingData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  // Hardcoded fallback pricing
  const fallbackPricingPlans = [
    {
      name: 'Basics',
      description: 'Access to complete learning portal',
      subscriptions: [
        { duration: '3 Months', price: 'Rs.399' },
        { duration: '6 Months', price: 'Rs.699' },
        { duration: '12 Months', price: 'Rs.999' },
      ],
      workbook: { price: 'Rs.249', note: 'Printing + Shipping' },
      color: 'from-[#f99f1b] to-[#d97706]',
      bgColor: 'bg-brand-50',
    },
    {
      name: 'Advanced',
      description: 'Access to complete learning portal',
      subscriptions: [
        { duration: '3 Months', price: 'Rs.499' },
        { duration: '6 Months', price: 'Rs.799' },
        { duration: '12 Months', price: 'Rs.1099' },
      ],
      workbook: { price: 'Rs.250', note: 'Printing + Shipping' },
      color: 'from-yellow-500 to-[#d97706]',
      bgColor: 'bg-yellow-50',
      featured: true,
    }
  ];

  // Convert API data to display format or use fallback
  const pricingPlans = pricingData ? [
    {
      name: 'Basics',
      description: 'Access to complete learning portal',
      subscriptions: pricingData.basics?.plans?.map((p: any) => ({
        duration: p.name,
        price: `Rs.${(p.price / 100).toFixed(0)}`,
        planId: p.id
      })) || fallbackPricingPlans[0].subscriptions,
      workbook: pricingData.basics?.plans?.[0]?.workbookPrice ? {
        price: `Rs.${(pricingData.basics.plans[0].workbookPrice / 100).toFixed(0)}`,
        note: pricingData.basics.plans[0].workbookNote || 'Printing + Shipping'
      } : { price: 'Rs.249', note: 'Printing + Shipping' },
      color: 'from-[#f99f1b] to-[#d97706]',
      bgColor: 'bg-brand-50',
    },
    {
      name: 'Advanced',
      description: 'Access to complete learning portal',
      subscriptions: pricingData.advanced?.plans?.map((p: any) => ({
        duration: p.name,
        price: `Rs.${(p.price / 100).toFixed(0)}`,
        planId: p.id
      })) || fallbackPricingPlans[1].subscriptions,
      workbook: pricingData.advanced?.plans?.[0]?.workbookPrice ? {
        price: `Rs.${(pricingData.advanced.plans[0].workbookPrice / 100).toFixed(0)}`,
        note: pricingData.advanced.plans[0].workbookNote || 'Printing + Shipping'
      } : { price: 'Rs.250', note: 'Printing + Shipping' },
      color: 'from-yellow-500 to-[#d97706]',
      bgColor: 'bg-yellow-50',
      featured: true,
    }
  ] : fallbackPricingPlans;

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-brand-100 text-brand-700 hover:bg-brand-200">
            Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-[#f99f1b] to-[#d97706] bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Flexible pricing options to suit your learning needs
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden transition-all p-0 duration-300 hover:shadow-2xl ${
                plan.featured 
                  ? 'border-2 border-purple-400 shadow-xl ring-2 ring-purple-200' 
                  : 'border border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.featured && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg z-10">
                  POPULAR
                </div>
              )}
              
              <CardHeader className={`pb-6 pt-8 ${plan.bgColor} border-b border-gray-200`}>
                <div className="text-center">
                  <h3 className={`text-3xl font-bold mb-2 bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-5">
                  {/* Subscription Options */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                      Subscription Plans
                    </h4>
                    <div className="space-y-2.5">
                      {plan.subscriptions.map((sub: { duration: string; price: string }, subIndex: number) => (
                        <div
                          key={subIndex}
                          className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                        >
                          <span className="text-sm font-medium text-gray-700">{sub.duration}</span>
                          <span className="text-xl font-bold text-gray-900">{sub.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Optional Workbook */}
                  <div className="pt-2 border-t border-gray-200">
                    <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                      Optional Workbook
                    </h4>
                    <Button
                      variant={(plan.name === 'Basics' && basicsWorkbookSelected) || (plan.name === 'Advanced' && advancedWorkbookSelected) ? 'default' : 'outline'}
                      onClick={() => {
                        if (plan.name === 'Basics') {
                          setBasicsWorkbookSelected(!basicsWorkbookSelected);
                        } else {
                          setAdvancedWorkbookSelected(!advancedWorkbookSelected);
                        }
                      }}
                      className={`w-full justify-between py-3 px-4 h-auto ${((plan.name === 'Basics' && basicsWorkbookSelected) || (plan.name === 'Advanced' && advancedWorkbookSelected)) ? 'bg-gradient-to-r from-[#f99f1b] to-yellow-500 hover:opacity-90' : 'hover:bg-gray-50'}`}
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm font-medium">{plan.workbook.note}</span>
                      </span>
                      <span className={`text-lg font-bold ${((plan.name === 'Basics' && basicsWorkbookSelected) || (plan.name === 'Advanced' && advancedWorkbookSelected)) ? 'text-white' : 'text-brand'}`}>
                        {((plan.name === 'Basics' && basicsWorkbookSelected) || (plan.name === 'Advanced' && advancedWorkbookSelected)) ? '✓ ' : ''}{plan.workbook.price}
                      </span>
                    </Button>
                  </div>

                  {/* Subscribe Button */}
                  <div className="pt-4">
                    <Link href={session ? '/dashboard' : '/auth/login?redirect=/dashboard'}>
                      <Button 
                        className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all`}
                      >
                        {session ? 'View in Dashboard' : 'Get Started'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

            {/* Buy Both & Save Section */}
            {pricingData?.basics?.plans && pricingData?.advanced?.plans && (
              <Card className="mt-12 border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-red-50 shadow-xl">
                <CardContent>
                  <div className="text-center mb-6">
                    <Badge className="mb-3 bg-brand text-white text-base px-4 py-2">
                      🎯 Best Value
                    </Badge>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      Buy Both Programs & Save!
                    </h3>
                    <p className="text-gray-600">
                      Get complete TheoLingua - Basics + Advanced with exclusive discount
                    </p>
                  </div>

                  {/* Optional Workbooks Toggle */}
                  <div className="text-center mb-6">
                    <Button
                      variant={comboWorkbooksSelected ? 'default' : 'outline'}
                      onClick={() => setComboWorkbooksSelected(!comboWorkbooksSelected)}
                      className={`${comboWorkbooksSelected ? 'bg-gradient-to-r from-[#f99f1b] to-yellow-500 hover:opacity-90' : 'hover:bg-gray-50'}`}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      {comboWorkbooksSelected ? '✓ Workbooks Included (Printing + Shipping)' : 'Add Workbooks (Printing + Shipping)'}
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {pricingData.basics.plans.map((basicsPlan: any, index: number) => {
                      const advancedPlan = pricingData.advanced.plans.find((p: any) => p.durationMonths === basicsPlan.durationMonths);
                      if (!advancedPlan) return null;

                      const comboDiscount = basicsPlan.comboDiscount || 0;
                      const basicsWorkbook = comboWorkbooksSelected ? (basicsPlan.workbookPrice || 0) : 0;
                      const advancedWorkbook = comboWorkbooksSelected ? (advancedPlan.workbookPrice || 0) : 0;
                      const originalTotal = basicsPlan.price + advancedPlan.price + basicsWorkbook + advancedWorkbook;
                      const discountAmount = Math.round(originalTotal * (comboDiscount / 100));
                      const finalTotal = originalTotal - discountAmount;

                      return (
                        <div key={basicsPlan.durationMonths} className="bg-white rounded-xl p-6 shadow-md border border-brand-200 hover:shadow-lg transition-all">
                          <div className="text-center mb-4">
                            <div className="text-2xl font-bold text-brand">{basicsPlan.name}</div>
                            {comboDiscount > 0 && (
                              <Badge className="mt-2 bg-green-100 text-green-700 border-green-300">
                                Save {comboDiscount}%
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Basics</span>
                              <span>₹{(basicsPlan.price / 100).toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Advanced</span>
                              <span>₹{(advancedPlan.price / 100).toFixed(0)}</span>
                            </div>
                            {comboWorkbooksSelected && (basicsWorkbook > 0 || advancedWorkbook > 0) && (
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Workbooks (2)</span>
                                <span>₹{((basicsWorkbook + advancedWorkbook) / 100).toFixed(0)}</span>
                              </div>
                            )}
                            {comboDiscount > 0 && (
                              <div className="flex justify-between text-sm text-green-600 font-medium">
                                <span>Discount ({comboDiscount}%)</span>
                                <span>-₹{(discountAmount / 100).toFixed(0)}</span>
                              </div>
                            )}
                            <div className="border-t-2 pt-2 mt-2 flex justify-between font-bold text-lg">
                              <span>Total</span>
                              <span className="text-brand">₹{(finalTotal / 100).toFixed(0)}</span>
                            </div>
                          </div>

                          <Button 
                            onClick={() => {
                              if (session) {
                                setSelectedComboDuration(basicsPlan.durationMonths);
                                setComboDialogOpen(true);
                              } else {
                                router.push('/auth/login?redirect=/theolingua');
                              }
                            }}
                            className="w-full bg-gradient-to-r from-[#f99f1b] to-red-500 hover:opacity-90 text-white font-semibold"
                          >
                            {session ? 'Buy Both Programs' : 'Login to Subscribe'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Combo Subscription Dialog */}
            {pricingData?.basics && pricingData?.advanced && (
              <ComboSubscriptionDialog
                isOpen={comboDialogOpen}
                onClose={() => setComboDialogOpen(false)}
                basicsProgram={{
                  id: pricingData.basics.classId,
                  name: pricingData.basics.className,
                  plans: pricingData.basics.plans,
                }}
                advancedProgram={{
                  id: pricingData.advanced.classId,
                  name: pricingData.advanced.className,
                  plans: pricingData.advanced.plans,
                }}
                selectedDuration={selectedComboDuration}
              />
            )}

            {/* GST Notice */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">All prices inclusive of GST</p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// Start Your Journey Section
function StartJourneySection() {
  return (
    <section className="py-24 relative overflow-hidden bg-white">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      {/* Animated orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-10 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-100 border border-brand-200 rounded-full mb-6">
            <span className="text-2xl">🚀</span>
            <span className="text-sm font-semibold text-brand-800 tracking-wide">GET STARTED</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Ready to Transform Your
            <span className="block bg-gradient-to-r from-[#f99f1b] to-[#d97706] bg-clip-text text-transparent mt-2">
              English Journey?
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Join hundreds of theological students who are mastering English through biblical wisdom. Start your journey today.
          </p>

          {/* CTA Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Student Card */}
            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl p-8 text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-100 to-transparent rounded-bl-[100px] opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f99f1b] to-[#d97706] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <LogIn className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Already a Student?
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Sign in to access your learning portal and continue your English mastery journey.
                </p>
                
                <Link href="/auth/login">
                  <Button className="w-full bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#b45309] hover:to-[#92400e] text-white h-12 text-lg font-semibold rounded-xl group/btn shadow-lg">
                    <span className="group-hover/btn:mr-2 transition-all">Sign In</span>
                    <ArrowRight className="w-5 h-5 opacity-0 -ml-5 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Institution Card */}
            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl p-8 text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-[100px] opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  For Institutions
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Bring TheoLingua to your seminary or Bible college. Schedule a free demo.
                </p>
                
                <BookDemo>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 text-lg font-semibold rounded-xl group/btn shadow-lg">
                    <span className="group-hover/btn:mr-2 transition-all">Book a Demo</span>
                    <ArrowRight className="w-5 h-5 opacity-0 -ml-5 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all" />
                  </Button>
                </BookDemo>
              </div>
            </motion.div>
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-16 text-gray-600"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Free trial available</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const faqs = [
    {
      question: 'What is TheoLingua?',
      answer: 'TheoLingua is a unique Bible-based English learning program designed specifically for theological students in India. It integrates biblical texts and Christian literature into the curriculum to help students enhance their English skills while deepening their understanding of the Bible.'
    },
    {
      question: 'How does the program work?',
      answer: 'The program uses a blended learning model combining digital resources with in-person facilitator guidance. Students work through video lessons, classroom activities, digital assignments, and assessments, all centered around biblical and theological content.'
    },
    {
      question: 'Is the program suitable for beginners?',
      answer: 'Yes! TheoLingua is designed to accommodate students at various English proficiency levels, from basic to advanced learners. The curriculum is structured to help students progress at their own pace.'
    },
    {
      question: 'How long do I have access to the platform?',
      answer: 'Access duration varies by institution. Typically, students have access throughout their enrollment period. Contact your institution for specific details about platform access.'
    },
    {
      question: 'Will I receive a certificate?',
      answer: 'Yes! Upon successful completion of the program, you will receive a certificate recognizing your achievement in Bible-based English learning.'
    },
    {
      question: 'Can institutions customize the program?',
      answer: 'Yes! We offer custom plans for theological institutions with specific needs. Contact us at info@sciolabs.in to discuss tailored solutions for your seminary or Bible college.'
    }
  ];

  return (
    <section className="py-20 bg-brand-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-brand-100 text-brand-700 hover:bg-brand-200">FAQs</Badge>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-[#f99f1b] to-[#d97706] bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about TheoLingua
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <div className="space-y-4">
            <Accordion type="single" collapsible>
              {faqs.slice(0, 3).map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-2 border-gray-200 rounded-lg px-6 hover:border-brand-300 transition-colors bg-white !border-b-2 mb-4"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="text-lg md:text-xl font-semibold text-gray-900 pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-base md:text-lg text-gray-600 pb-5 pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          <div className="space-y-4">
            <Accordion type="single" collapsible>
              {faqs.slice(3).map((faq, index) => (
                <AccordionItem 
                  key={index + 3} 
                  value={`item-${index + 3}`}
                  className="border-2 border-gray-200 rounded-lg px-6 hover:border-brand-300 transition-colors bg-white !border-b-2 mb-4"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="text-lg md:text-xl font-semibold text-gray-900 pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-base md:text-lg text-gray-600 pb-5 pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const testimonials = [
    {
      text: 'Before learning this English, we didn\'t know how to speak, but after taking this English class, I came to learn how to use words in the appropriate way of speaking and writing. I improved much in listening to audio, listening to songs, and following how they are tuning the pronunciation and following in singing back at their flow of tune and music. This really helps me out in learning English.',
      author: 'Birila A. Yimchunger',
      institution: 'Olive Theological College',
      level: 'Level 2',
      rating: 5
    },
    {
      text: 'TheoLingua is the best course I have ever seen. It is very suitable, especially for basic English learners. For Christian students, it provides Bible knowledge, and even for non-Christian learners, it offers insight into the Bible.',
      author: 'Van Kyin Thang',
      institution: 'Asian College of Theology',
      level: 'Level 1',
      rating: 5
    },
    {
      text: 'It was a good experience that every class we enjoyed and earned many things in English grammar. I learned songs in class time, which was very good as we could sing the songs in class. During reading and listening activities, we tried to listen while in the listening time, which increased our listening skills. Everything in the class was very good.',
      author: 'S. Aaron Samraj',
      institution: 'Olive Theological College',
      level: 'Level 2',
      rating: 5
    },
    {
      text: 'It\'s so good to learn these classes online every day. I liked the way of teaching you were providing to us, especially I enjoyed doing assignments every day and learning new vocabulary day by day. It helped shape us to improve our English skills. I would like to follow your next program as well if it\'s God\'s will.',
      author: 'M.A Paul',
      institution: 'Asian College of Theology',
      level: 'Level 1',
      rating: 5
    },
    {
      text: 'TheoLingua gave an amazing experience and helped a lot to improve in english lanuage. There classes were interactive, knowlegable and inspiring. Learning new words and meanings helped a lot to improve and become fluent in speaking. There was some parts I was troubled, especially with adverbs. But I was able to pick up after re-watching the lessons. It is a good journey for a beginner to improve in many aspects of English language.',
      author: 'Godly Titus John',
      institution: 'Asian College of Theology',
      level: 'Level 1',
      rating: 5
    },
    {
      text: 'I had a good experience of TheoLingua class. I enjoyed the classes and the activities that I did every day in class time, and the best thing is that I learned songs also. From this class, I got some idea of how to use vocabulary in our daily life. The listening class made me understand things through listening, and I learned many things from this class. Now also, I am practicing those things.',
      author: 'Abhishek Kumar',
      institution: 'Olive Theological College',
      level: 'Level 2',
      rating: 5
    }
  ];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      if (newDirection > 0) {
        return (prevIndex + 1) % testimonials.length;
      }
      return prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-6 bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-sm px-4 py-2 text-sm">
              ✨ Student Testimonials
            </Badge>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-white">
              Students Speak
            </h2>
            
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Hear from theological students who have transformed their English skills through TheoLingua
            </p>
          </motion.div>
        </div>

        {/* Testimonial Slider */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative min-h-[500px] md:min-h-[450px]">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="w-full"
            >
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl overflow-visible">
                <CardContent>
                  {/* Quote Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#f99f1b] to-[#d97706] rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-white/90 text-lg leading-relaxed text-center mb-8 italic">
                    &ldquo;{testimonials[currentIndex].text}&rdquo;
                  </p>

                  {/* Author Info */}
                  <div className="flex flex-col items-center">
                    <h4 className="text-white font-bold text-xl mb-1">
                      {testimonials[currentIndex].author}
                    </h4>
                    <p className="text-white/70 text-sm">
                      {testimonials[currentIndex].institution}
                    </p>
                    <Badge className="mt-2 bg-white/10 text-white border-white/20">
                      {testimonials[currentIndex].level}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => paginate(-1)}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="Previous testimonial"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 h-3 bg-white rounded-full'
                      : 'w-3 h-3 bg-white/40 rounded-full hover:bg-white/60'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => paginate(1)}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="Next testimonial"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">100+</div>
              <div className="text-white/70 text-sm md:text-base">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">5★</div>
              <div className="text-white/70 text-sm md:text-base">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">95%</div>
              <div className="text-white/70 text-sm md:text-base">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Main Page Component
export default function TheoLinguaPage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <RevisionProblems />
      <TheoLinguaFeatures />
      {/* <TryGamesSection /> */}
      <PricingSection />
      <TestimonialsSection />
      <StartJourneySection />
      <FAQSection />
    </div>
  );
}
