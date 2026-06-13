'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useProgramData, type DbProgram } from '@/hooks/useProgramData';

interface UnitAccessData {
  id: string;
  name: string;
  hasAccess: boolean;
  accessType: string;
  accessibleChapters?: string[];
  daysRemaining?: number;
  dripLocked?: boolean;
}

interface ProgramAccessResponse {
  hasFullAccess: boolean;
  accessType: string;
  unitAccess: UnitAccessData[];
  error?: string;
}

interface UseProgramPageDataResult {
  currentProgram: DbProgram | null;
  userProgress: Map<string, boolean>;
  markTopicComplete: (topicId: string, completed?: boolean) => Promise<void>;
  unitAccess: Record<string, boolean>;
  unitAccessTypes: Record<string, string>;
  unitDaysRemaining: Record<string, number>;
  chapterAccess: Record<string, boolean>;
  accessType: string;
  accessMessage: string;
  loading: boolean;
  error: string | null;
}

export function useProgramPageData(programId: string): UseProgramPageDataResult {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const {
    currentProgram,
    userProgress,
    loading: programDataLoading,
    error: programDataError,
    markTopicComplete,
  } = useProgramData(programId);

  const [unitAccess, setUnitAccess] = useState<Record<string, boolean>>({});
  const [unitAccessTypes, setUnitAccessTypes] = useState<Record<string, string>>({});
  const [unitDaysRemaining, setUnitDaysRemaining] = useState<Record<string, number>>({});
  const [chapterAccess, setChapterAccess] = useState<Record<string, boolean>>({});
  const [accessType, setAccessType] = useState<string>('');
  const [accessMessage, setAccessMessage] = useState<string>('');
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  const loading = programDataLoading || accessLoading;
  const error = programDataError || accessError;

  useEffect(() => {
    const getUnitAccess = async () => {
      if (!user?.id || !programId) {
        setAccessLoading(false);
        return;
      }

      try {
        setAccessLoading(true);
        const response = await fetch(`/api/programs/${programId}/access?userId=${user.id}`);
        const data: ProgramAccessResponse = await response.json();

        if (response.ok) {
          setAccessType(data.accessType);
          setAccessMessage(
            data.hasFullAccess
              ? 'Full Access'
              : data.unitAccess.some((s) => s.hasAccess)
                ? 'Partial access - some units available'
                : 'Limited access'
          );

          const unitAccessMap: Record<string, boolean> = {};
          const unitAccessTypesMap: Record<string, string> = {};
          const unitDaysRemainingMap: Record<string, number> = {};
          const chapterAccessMap: Record<string, boolean> = {};

          data.unitAccess.forEach((unit) => {
            unitAccessMap[unit.id] = unit.hasAccess;
            unitAccessTypesMap[unit.id] = unit.accessType;
            unitDaysRemainingMap[unit.id] = unit.daysRemaining ?? 0;

            unit.accessibleChapters?.forEach((chapterId) => {
              chapterAccessMap[chapterId] = true;
            });
          });

          setUnitAccess(unitAccessMap);
          setUnitAccessTypes(unitAccessTypesMap);
          setUnitDaysRemaining(unitDaysRemainingMap);
          setChapterAccess(chapterAccessMap);
        } else {
          setAccessError(data.error || 'Failed to check access');
        }
      } catch {
        setAccessError('Network error while checking access');
      } finally {
        setAccessLoading(false);
      }
    };

    getUnitAccess();
  }, [user?.id, programId, router]);

  return {
    currentProgram,
    userProgress,
    markTopicComplete,
    unitAccess,
    unitAccessTypes,
    unitDaysRemaining,
    chapterAccess,
    accessType,
    accessMessage,
    loading,
    error,
  };
}
