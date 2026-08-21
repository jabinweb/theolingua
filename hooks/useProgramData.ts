'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Types
export interface UserProfile {
  id: string;
  grade?: string;
  school?: {
    name: string;
    isActive: boolean;
  };
}

export interface TopicContent {
  contentType: string;
  url?: string;
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  iframeHtml?: string;
  widgetConfig?: Record<string, unknown>;
}

export interface Topic {
  id: string; // Changed to string for consistency
  name: string;
  type: string;
  duration: string | null;
  description?: string | null;
  difficulty?: string;
  orderIndex: number;
  requiresPass?: boolean;
  masteryScore?: number | null;
  maxAttempts?: number | null;
  content?: TopicContent;
}

export interface Chapter {
  id: string; // Changed to string for consistency
  name: string;
  orderIndex: number;
  topics: Topic[];
}

export interface Unit {
  id: string; // Changed to string for consistency
  name: string;
  icon: string;
  color: string;
  isLocked: boolean;
  orderIndex: number;
  chapters: Chapter[];
}

export interface Program {
  id: number;
  name: string;
  slug?: string; // Add slug field
  description: string;
  logo?: string; // Add logo field
  isActive: boolean;
  price: number;
  units: Unit[];
  subjects?: Unit[]; // Alias for backward compatibility
  // API-added properties for access control
  accessType?: 'school' | 'subscription' | 'none';
  schoolAccess?: boolean;
  subscriptionAccess?: boolean;
  unitAccess?: Record<string, {
    hasAccess: boolean;
    accessType: 'school' | 'program_subscription' | 'unit_subscription' | 'none';
  }>;
  hasPartialAccess?: boolean;
}

// Legacy type aliases for backward compatibility
export type DbTopic = Topic;
export type DbChapter = Chapter;
export type DbUnit = Unit;
export type DbProgram = Program;

export function useProgramData(programId?: string) {
  const { data: session } = useSession();
  const user = session?.user;
  
  const [programs, setprograms] = useState<Program[]>([]);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [userProgress, setUserProgress] = useState<Map<string, boolean>>(new Map());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessMessage, setAccessMessage] = useState<string>('');
  const [accessType, setAccessType] = useState<'full' | 'demo' | 'none' | 'school' | 'subscription' | 'free'>('none');

  // Fetch accessible programs for the user
  useEffect(() => {
    const fetchAccessibleprograms = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching dashboard data for user:', user.id);
        
        const response = await fetch('/api/dashboard');
        const data = await response.json();

        console.log('Dashboard API response:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch dashboard data');
        }

        // Transform API response (API returns 'classes' with 'subjects', we use 'programs' with 'units' in UI)
        const rawClasses = data.classes || data.programs || [];
        const transformedPrograms = rawClasses.map((cls: Record<string, unknown>) => ({
          ...cls,
          units: cls.subjects || cls.units || [], // Map subjects to units
          subjects: cls.subjects || cls.units || [] // Keep subjects for compatibility
        }));

        setprograms(transformedPrograms);
        setUserProfile(data.userProfile || null);
        setAccessMessage(data.accessMessage || '');
        setAccessType(data.accessType || 'none');

        console.log('Set programs:', transformedPrograms.length);
        console.log('Programs data:', transformedPrograms);
        console.log('Access type:', data.accessType);
        console.log('Access message:', data.accessMessage);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setprograms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessibleprograms();
  }, [user?.id]);

  // Fetch specific program data
  useEffect(() => {
    if (!programId) return;

    const fetchProgram = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/programs/${programId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch program data');
        }

        // Transform data to ensure ID consistency (convert numbers to strings)
        const transformedProgram: Program = {
          ...data,
          units: data.units.map((unit: Record<string, unknown>) => ({
            ...unit,
            id: String(unit.id),
            chapters: (unit.chapters as Record<string, unknown>[]).map((chapter: Record<string, unknown>) => ({
              ...chapter,
              id: String(chapter.id),
              topics: (chapter.topics as Record<string, unknown>[]).map((topic: Record<string, unknown>) => ({
                ...topic,
                id: String(topic.id),
              }))
            }))
          })) as Unit[]
        };

        setCurrentProgram(transformedProgram);
        
      } catch (err) {
        console.error('Error fetching program:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId]);

  // Fetch user progress
  useEffect(() => {
    if (!user?.id) return;

    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/user/topic-progress');
        const data = await response.json();

        if (!response.ok) {
          console.error('Error fetching progress:', data.error);
          return;
        }

        const progressMap = new Map<string, boolean>();
        Object.entries(data.progress || {}).forEach(([topicId, completed]) => {
          progressMap.set(topicId, Boolean(completed));
        });

        setUserProgress(progressMap);
      } catch (err) {
        console.error('Error fetching progress:', err);
      }
    };

    fetchProgress();
  }, [user?.id]);

  // Mark topic as complete/incomplete
  const markTopicComplete = async (topicId: string, completed: boolean = true) => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/user/topic-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId,
          completed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error updating progress:', data.error);
        throw new Error(data.error || 'Failed to update progress');
      }

      // Update local state only if API call succeeded
      setUserProgress(prev => new Map(prev.set(topicId, completed)));
      
    } catch (err) {
      console.error('Error updating progress:', err);
      throw err;
    }
  };

  return {
    programs,
    currentProgram,
    userProgress,
    userProfile,
    loading,
    error,
    accessMessage,
    accessType,
    markTopicComplete,
  };
}
         