'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Play, ChevronRight, Crown } from "lucide-react";
import { useRouter } from 'next/navigation';

// Helper to get a unique icon for each program
function getProgramIcon(className: string) {
  // Support names like 'Program 4', 'CBSE : Program 4', etc.
  // Extract the program number from the string
  const match = className.match(/Program\s*(\d+)/);
  const programNum = match ? match[1] : null;
  switch (programNum) {
    case '4':
      return '🦉';
    case '5':
      return '🦁';
    case '6':
      return '🐯';
    case '7':
      return '🐬';
    case '8':
      return '🦅';
    default:
      return '📚';
  }
}

interface BaseProgramData {
  id: number;
  name: string;
  description: string;
  price?: number;
}

interface DashboardProgramData extends BaseProgramData {
  schoolAccess?: boolean;
  subscriptionAccess?: boolean;
  hasPartialAccess?: boolean;
  subjects?: Array<{
    chapters?: Array<{ id: string; name: string; topics?: Array<{ id: string }> }>;
  }>;
}

interface DemoProgramData extends BaseProgramData {
  subjectCount: number;
  chapterCount: number;
  subjects: Array<{
    chapters: Array<{
      topics: Array<{
        completed: boolean;
      }>;
    }>;
  }>;
}

interface ProgramCardProps {
  variant: 'dashboard' | 'demo';
  programData: DashboardProgramData | DemoProgramData;
  progress: number;
  onClick: () => void;
  onUpgrade?: (e: React.MouseEvent) => void;
  className?: string;
}

const AccessBadge: React.FC<{ programData: DashboardProgramData }> = ({ programData }) => {
  if ('schoolAccess' in programData && programData.schoolAccess) {
    return (
      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
        School Access
      </div>
    );
  }
  
  if ('subscriptionAccess' in programData && programData.subscriptionAccess) {
    return (
      <div className="bg-theo-yellow text-theo-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
        Full Access
      </div>
    );
  }
  
  if ('hasPartialAccess' in programData && programData.hasPartialAccess) {
    return (
      <div className="bg-theo-black text-theo-yellow px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
        Partial Access
      </div>
    );
  }
  
  if (programData.price && programData.price > 0) {
    return (
      <div className="bg-white text-theo-black border border-gray-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
        ₹{Math.round(programData.price / 100)}
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
      Free
    </div>
  );
};

const DashboardActionButton: React.FC<{ programData: DashboardProgramData }> = ({ programData }) => {
  const getButtonStyles = () => {
    if (('schoolAccess' in programData && programData.schoolAccess) || 
        ('subscriptionAccess' in programData && programData.subscriptionAccess)) {
      return {
        container: 'bg-green-50 border-green-100 group-hover:bg-green-100',
        icon: 'bg-green-200',
        iconColor: 'text-green-700',
        text: 'text-green-800',
        chevron: 'text-green-400'
      };
    }
    
    if ('hasPartialAccess' in programData && programData.hasPartialAccess) {
      return {
        container: 'bg-theo-yellow/10 border-theo-yellow/20 group-hover:bg-theo-yellow/20',
        icon: 'bg-theo-yellow/30',
        iconColor: 'text-theo-black',
        text: 'text-theo-black',
        chevron: 'text-theo-black/40'
      };
    }
    
    return {
      container: 'bg-theo-black text-theo-yellow border-theo-black group-hover:bg-theo-black/90',
      icon: 'bg-theo-yellow',
      iconColor: 'text-theo-black',
      text: 'text-theo-yellow',
      chevron: 'text-theo-yellow/50'
    };
  };

  const getButtonText = () => {
    if ('schoolAccess' in programData && programData.schoolAccess) return 'Access via School';
    if ('subscriptionAccess' in programData && programData.subscriptionAccess) return 'Full Access';
    if ('hasPartialAccess' in programData && programData.hasPartialAccess) return 'View Subjects';
    if (programData.price && programData.price > 0) return `Subscribe for ₹${Math.round(programData.price / 100)}`;
    return 'Start Learning';
  };

  const styles = getButtonStyles();

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${styles.container}`}>
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg transition-colors ${styles.icon}`}>
          <Play className={`h-3.5 w-3.5 ${styles.iconColor}`} />
        </div>
        <span className={`text-sm font-semibold transition-colors ${styles.text}`}>
          {getButtonText()}
        </span>
      </div>
      <ChevronRight className={`h-4 w-4 transition-all group-hover:translate-x-1 ${styles.chevron}`} />
    </div>
  );
};

const DemoActionButtons: React.FC<{ 
  onDemo: () => void; 
  onUpgrade: (e: React.MouseEvent) => void;
  programData: DashboardProgramData | DemoProgramData;
}> = ({ onDemo, onUpgrade, programData }) => {
  const router = useRouter();

  const hasAccess = (('schoolAccess' in programData && programData.schoolAccess) || ('subscriptionAccess' in programData && programData.subscriptionAccess));

  // If the demo program is already accessible via school/subscription, show Full Access action
  if (hasAccess) {
    const id = (programData as BaseProgramData).id;
    return (
      <div className="pt-2 space-y-2">
        <div
          className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100 hover:border-green-300 transition-all cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (id !== undefined) router.push(`/dashboard/program/${id}`);
          }}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">
              <Play className="h-3.5 w-3.5 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors">
              Full Access
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-green-400 hover:text-green-600 transition-all hover:translate-x-1" />
        </div>

        {/* Secondary Try Demo action for consistent UI */}
        <div 
          className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-blue-50 border-gray-100 group-hover:from-blue-50 group-hover:to-indigo-50 group-hover:border-blue-200 transition-all cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onDemo(); }}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
              <Play className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
              Try Demo
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 space-y-2">
      {/* Try Demo Button */}
      <div 
        className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-blue-50 border-gray-100 group-hover:from-blue-50 group-hover:to-indigo-50 group-hover:border-blue-200 transition-all cursor-pointer"
        onClick={onDemo}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
            <Play className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
            Try Demo
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
      </div>
      
      {/* Upgrade Button */}
      <div 
        className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-100 hover:from-orange-100 hover:to-yellow-100 hover:border-orange-200 transition-all cursor-pointer"
        onClick={onUpgrade}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors">
            <Crown className="h-3.5 w-3.5 text-orange-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700 hover:text-orange-700 transition-colors">
            Upgrade
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400 hover:text-orange-600 transition-all hover:translate-x-1" />
      </div>
    </div>
  );
};

export const ProgramCard: React.FC<ProgramCardProps> = ({
  variant,
  programData,
  progress,
  onClick,
  onUpgrade,
  className = ''
}) => {
  const isDashboard = variant === 'dashboard';
  const isDemo = variant === 'demo';

  // Calculate stats based on variant
  const getStats = () => {
    if (isDemo && 'subjectCount' in programData) {
      return {
        subjectCount: programData.subjectCount,
        chapterCount: programData.chapterCount
      };
    }
    
    if (isDashboard && 'subjects' in programData && programData.subjects) {
      return {
        subjectCount: programData.subjects.length,
        chapterCount: programData.subjects.reduce((acc, s) => acc + (s.chapters?.length || 0), 0)
      };
    }
    
    return { subjectCount: 0, chapterCount: 0 };
  };

  const { subjectCount, chapterCount } = getStats();

  const cardProgrames = `
    group relative overflow-hidden border-0 shadow-md hover:shadow-2xl 
    transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer
    ${isDashboard ? 'bg-white/80 backdrop-blur-sm' : 'bg-white'}
    ${className}
  `;

  const iconSectionProgrames = isDashboard 
    ? "w-full h-32 bg-theo-black rounded-[20px] shadow-inner"
    : "w-full h-32 bg-theo-black rounded-[20px] shadow-inner";

  const iconProgrames = isDashboard 
    ? "text-5xl z-10 filter drop-shadow-[0_0_15px_rgba(200,216,50,0.4)]" 
    : "text-5xl z-10 filter drop-shadow-[0_0_15px_rgba(200,216,50,0.4)]";

  const headerPadding = isDashboard ? "relative z-1 pb-4" : "relative z-1 pb-4";
  
  const contentPadding = isDashboard 
    ? "relative z-10 space-y-4 pt-4" 
    : "relative z-10 space-y-4 pt-4";

  const titleProgrames = isDashboard 
    ? "text-xl font-bold text-theo-black group-hover:text-theo-black transition-colors line-clamp-1"
    : "text-xl font-bold text-theo-black group-hover:text-theo-black transition-colors line-clamp-1";

  const descriptionProgrames = isDashboard
    ? "text-sm text-gray-500 leading-relaxed line-clamp-2 group-hover:text-gray-600 transition-colors"
    : "text-sm text-gray-500 leading-relaxed line-clamp-2 group-hover:text-gray-600 transition-colors";

  const statCardProgrames = isDashboard
    ? "flex items-center gap-2 p-3 bg-theo-white/50 rounded-2xl border border-gray-100 group-hover:bg-theo-white transition-colors"
    : "flex items-center gap-2 p-3 bg-theo-white/50 rounded-2xl border border-gray-100 group-hover:bg-theo-white transition-colors";

  const statIconProgrames = isDashboard
    ? "p-1.5 bg-theo-yellow/20 rounded-xl"
    : "p-1.5 bg-theo-yellow/20 rounded-xl";

  const iconSize = isDashboard ? "h-3.5 w-3.5" : "h-3.5 w-3.5";

  const progressLabel = isDemo ? "Demo Progress" : "Learning Progress";
  const progressBarHeight = isDashboard ? "h-2.5" : "h-2.5";

  return (
    <Card className={cardProgrames} onClick={onClick}>
      {/* Access Type Badge - Dashboard only */}
      {isDashboard && (
        <div className="absolute top-4 right-4 z-10">
          <AccessBadge programData={programData as DashboardProgramData} />
        </div>
      )}

      <CardHeader className={headerPadding}>
        {/* Icon Section */}
        <div className={`relative ${isDashboard ? 'mb-6' : 'mb-6'}`}>
          <div className={`${iconSectionProgrames} flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500 shadow-lg`}>
            <span className={iconProgrames}>{getProgramIcon(programData.name)}</span>
            
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
            <div className={`absolute ${isDashboard ? 'top-2 right-2 w-3 h-3' : 'top-2 right-2 w-3 h-3'} bg-white/20 rounded-full animate-pulse`} />
            <div className={`absolute ${isDashboard ? 'bottom-3 left-3 w-2 h-2' : 'bottom-3 left-3 w-2 h-2'} bg-white/30 rounded-full animate-pulse delay-300`} />
            {(isDashboard || isDemo) && (
              <div className="absolute top-1/2 left-2 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse delay-700" />
            )}

            {/* Progress indicator */}
            <div className={`absolute ${isDashboard ? 'bottom-2 left-2 right-2' : 'bottom-2 left-2 right-2'}`}>
              <div className={`w-full ${isDashboard ? 'h-1' : 'h-1'} bg-white/20 rounded-full overflow-hidden`}>
                <div 
                  className="h-full bg-white/60 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className={`space-y-${isDashboard ? '2' : '2'}`}>
          <CardTitle className={titleProgrames}>
            {programData.name}
          </CardTitle>
          <p className={descriptionProgrames}>
            {programData.description}
          </p>
        </div>
      </CardHeader>

      <CardContent className={contentPadding}>
        {/* Stats Grid */}
        <div className={`grid grid-cols-2 gap-${isDashboard ? '3' : '3'}`}>
          <div className={statCardProgrames}>
            <div className={statIconProgrames}>
              <Users className={`${iconSize} text-blue-600`} />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Subjects</div>
              <div className="text-sm font-bold text-gray-900">{subjectCount}</div>
            </div>
          </div>
          <div className={statCardProgrames}>
            <div className={`${statIconProgrames.replace('bg-blue-100', 'bg-purple-100')}`}>
              <Clock className={`${iconSize} text-purple-600`} />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Lessons</div>
              <div className="text-sm font-bold text-gray-900">{chapterCount}</div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className={`space-y-${isDashboard ? '3' : '3'}`}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">{progressLabel}</span>
            <span className="text-xs font-bold text-gray-900">{progress}%</span>
          </div>
          <div className={`w-full bg-gray-100 rounded-full ${progressBarHeight} overflow-hidden`}>
            <div 
              className="h-full bg-theo-yellow rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        {isDashboard && (
          <div className="pt-2">
            <DashboardActionButton programData={programData as DashboardProgramData} />
          </div>
        )}

        {isDemo && onUpgrade && (
          <DemoActionButtons 
            onDemo={onClick}
            onUpgrade={onUpgrade}
            programData={programData as DashboardProgramData}
          />
        )}
      </CardContent>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
    </Card>
  );
};

export default ProgramCard;