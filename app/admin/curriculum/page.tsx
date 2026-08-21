'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FolderTree,
  GraduationCap,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { ContentLoader } from '@/components/ui/content-loader';

interface CurriculumTopic {
  id: string;
  name: string;
  orderIndex: number;
  type: string;
  contentType: string | null;
}

interface CurriculumChapter {
  id: string;
  name: string;
  orderIndex: number;
  topics: CurriculumTopic[];
}

interface CurriculumUnit {
  id: string;
  name: string;
  orderIndex: number;
  icon?: string;
  color?: string;
  chapters: CurriculumChapter[];
}

interface CurriculumProgram {
  id: number;
  name: string;
  slug: string | null;
  isActive: boolean;
  units: CurriculumUnit[];
}

type ReorderType = 'unit' | 'chapter' | 'topic';

function formatContentType(contentType: string | null, topicType: string): string {
  if (contentType) {
    return contentType
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  return topicType.charAt(0) + topicType.slice(1).toLowerCase();
}

export default function CurriculumPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role;
  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = status === 'loading' || (user && userRole === null);

  const [programs, setPrograms] = useState<CurriculumProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [expandedPrograms, setExpandedPrograms] = useState<Set<number>>(new Set());
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const fetchTree = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/curriculum/tree');
      if (!response.ok) {
        throw new Error('Failed to load curriculum');
      }
      const data = await response.json();
      setPrograms(Array.isArray(data.programs) ? data.programs : []);
    } catch (error) {
      console.error('Error fetching curriculum tree:', error);
      toast.error('Failed to load curriculum tree');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      window.location.href = '/';
      return;
    }
    if (isAdmin) {
      fetchTree();
    }
  }, [isAdmin, isLoadingAuth, user, userRole, fetchTree]);

  const toggleSet = <T,>(set: Set<T>, id: T): Set<T> => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  const moveItem = async (
    type: ReorderType,
    orderedIds: string[],
    index: number,
    direction: 'up' | 'down'
  ) => {
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= orderedIds.length) return;

    const nextIds = [...orderedIds];
    [nextIds[index], nextIds[swapWith]] = [nextIds[swapWith], nextIds[index]];

    try {
      setReordering(true);
      const response = await fetch('/api/admin/curriculum/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, orderedIds: nextIds }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to reorder');
      }

      await fetchTree();
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reorder');
    } finally {
      setReordering(false);
    }
  };


  if (!isAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 page-toolbar">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <FolderTree className="h-8 w-8" />
              Curriculum Builder
            </h1>
            <p className="text-muted-foreground">
              Browse and reorder programs, units, chapters, and topics
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/programs">
                <GraduationCap className="h-4 w-4 mr-2" />
                Programs
              </Link>
            </Button>
            <Button onClick={fetchTree} variant="outline" disabled={loading || reordering}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <ContentLoader variant="page" />
        ) : programs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No programs found. Create a program first, then add units and topics.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {programs.map((program) => {
              const programOpen = expandedPrograms.has(program.id);
              const previewSlug = program.slug || String(program.id);

              return (
                <Card key={program.id} className="overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-4 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setExpandedPrograms((s) => toggleSet(s, program.id))}
                    >
                      {programOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-theo-black">{program.name}</span>
                        <Badge variant={program.isActive ? 'theo' : 'secondary'} className="font-bold">
                          {program.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="font-medium">
                          {program.units.length} units
                        </Badge>
                      </div>
                      {program.slug && (
                        <p className="text-xs text-muted-foreground mt-0.5">/{program.slug}</p>
                      )}
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/programs/${previewSlug}`}>Manage</Link>
                    </Button>
                  </div>

                  {programOpen && (
                    <CardContent className="p-0">
                      {program.units.length === 0 ? (
                        <p className="px-6 py-4 text-sm text-muted-foreground">No units yet.</p>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {program.units.map((unit, unitIndex) => {
                            const unitOpen = expandedUnits.has(unit.id);
                            const unitIds = program.units.map((u) => u.id);

                            return (
                              <li key={unit.id}>
                                <div className="flex items-center gap-2 px-4 py-2.5 pl-8 hover:bg-gray-50/60">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => setExpandedUnits((s) => toggleSet(s, unit.id))}
                                  >
                                    {unitOpen ? (
                                      <ChevronDown className="h-3.5 w-3.5" />
                                    ) : (
                                      <ChevronRight className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-sm font-semibold">{unit.name}</span>
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      {unit.chapters.length} chapters
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      disabled={reordering || unitIndex === 0}
                                      onClick={() => moveItem('unit', unitIds, unitIndex, 'up')}
                                      title="Move up"
                                    >
                                      <ArrowUp className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      disabled={reordering || unitIndex === program.units.length - 1}
                                      onClick={() => moveItem('unit', unitIds, unitIndex, 'down')}
                                      title="Move down"
                                    >
                                      <ArrowDown className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>

                                {unitOpen && (
                                  <ul className="bg-white">
                                    {unit.chapters.length === 0 ? (
                                      <li className="px-6 py-2 pl-16 text-xs text-muted-foreground">
                                        No chapters yet.
                                      </li>
                                    ) : (
                                      unit.chapters.map((chapter, chapterIndex) => {
                                        const chapterOpen = expandedChapters.has(chapter.id);
                                        const chapterIds = unit.chapters.map((c) => c.id);

                                        return (
                                          <li key={chapter.id}>
                                            <div className="flex items-center gap-2 px-4 py-2 pl-14 hover:bg-gray-50/60">
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                                onClick={() =>
                                                  setExpandedChapters((s) => toggleSet(s, chapter.id))
                                                }
                                              >
                                                {chapterOpen ? (
                                                  <ChevronDown className="h-3.5 w-3.5" />
                                                ) : (
                                                  <ChevronRight className="h-3.5 w-3.5" />
                                                )}
                                              </Button>
                                              <div className="min-w-0 flex-1">
                                                <span className="text-sm font-medium">{chapter.name}</span>
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                  {chapter.topics.length} topics
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-7 w-7 p-0"
                                                  disabled={reordering || chapterIndex === 0}
                                                  onClick={() =>
                                                    moveItem('chapter', chapterIds, chapterIndex, 'up')
                                                  }
                                                  title="Move up"
                                                >
                                                  <ArrowUp className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-7 w-7 p-0"
                                                  disabled={
                                                    reordering || chapterIndex === unit.chapters.length - 1
                                                  }
                                                  onClick={() =>
                                                    moveItem(
                                                      'chapter',
                                                      chapterIds,
                                                      chapterIndex,
                                                      'down'
                                                    )
                                                  }
                                                  title="Move down"
                                                >
                                                  <ArrowDown className="h-3.5 w-3.5" />
                                                </Button>
                                              </div>
                                            </div>

                                            {chapterOpen && (
                                              <ul>
                                                {chapter.topics.length === 0 ? (
                                                  <li className="px-6 py-2 pl-24 text-xs text-muted-foreground">
                                                    No topics yet.
                                                  </li>
                                                ) : (
                                                  chapter.topics.map((topic, topicIndex) => {
                                                    const topicIds = chapter.topics.map((t) => t.id);
                                                    const previewHref = `/dashboard/program/${previewSlug}?topic=${topic.id}`;

                                                    return (
                                                      <li
                                                        key={topic.id}
                                                        className="flex items-center gap-2 px-4 py-2 pl-24 hover:bg-gray-50/60"
                                                      >
                                                        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2">
                                                          <span className="text-sm">{topic.name}</span>
                                                          <Badge
                                                            variant="outline"
                                                            className="text-[10px] font-semibold"
                                                          >
                                                            {formatContentType(
                                                              topic.contentType,
                                                              topic.type
                                                            )}
                                                          </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                          <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0"
                                                            disabled={reordering || topicIndex === 0}
                                                            onClick={() =>
                                                              moveItem(
                                                                'topic',
                                                                topicIds,
                                                                topicIndex,
                                                                'up'
                                                              )
                                                            }
                                                            title="Move up"
                                                          >
                                                            <ArrowUp className="h-3.5 w-3.5" />
                                                          </Button>
                                                          <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0"
                                                            disabled={
                                                              reordering ||
                                                              topicIndex === chapter.topics.length - 1
                                                            }
                                                            onClick={() =>
                                                              moveItem(
                                                                'topic',
                                                                topicIds,
                                                                topicIndex,
                                                                'down'
                                                              )
                                                            }
                                                            title="Move down"
                                                          >
                                                            <ArrowDown className="h-3.5 w-3.5" />
                                                          </Button>
                                                          <Button asChild variant="outline" size="sm">
                                                            <a
                                                              href={previewHref}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                            >
                                                              <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                                              Preview
                                                            </a>
                                                          </Button>
                                                        </div>
                                                      </li>
                                                    );
                                                  })
                                                )}
                                              </ul>
                                            )}
                                          </li>
                                        );
                                      })
                                    )}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
