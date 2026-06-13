'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { ChapterForm } from '@/components/admin/ChapterForm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

interface Chapter {
  id: string;
  name: string;
  orderIndex: number;
  subjectId: string;
  created_at: string;
  updated_at: string;
}

interface ChapterFormData {
  id?: string;
  name: string;
  orderIndex: number;
  subjectId: string;
}

export default function ChaptersPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.programId as string;
  const unitId = params.unitId as string;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    fetchChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/chapters?subjectId=${unitId}`);
      const data = await response.json();
      setChapters(Array.isArray(data) ? data : []);
    } catch {
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChapter = async (formData: ChapterFormData) => {
    const response = await fetch('/api/admin/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (response.ok) fetchChapters();
    else throw new Error('Failed to create chapter');
  };

  const handleUpdateChapter = async (formData: ChapterFormData) => {
    const response = await fetch('/api/admin/chapters', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (response.ok) fetchChapters();
    else throw new Error('Failed to update chapter');
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Delete this lesson and all its topics?')) return;
    const response = await fetch(`/api/admin/chapters?id=${chapterId}`, { method: 'DELETE' });
    if (response.ok) fetchChapters();
  };

  const goToTopics = (chapterId: string) => {
    router.push(`/admin/programs/${programId}/units/${unitId}/chapters/${chapterId}/topics`);
  };

  return (
    <div className="min-w-0">
      <AdminPageHeader
        title="Unit lessons"
        badge="Content management"
        description="Manage structured lessons for this unit"
        onBack={() => router.push(`/admin/programs/${programId}`)}
        actions={
          <Button size="sm" variant="theo" onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add lesson
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : (
        <div className="admin-card-grid">
          {chapters.map((chapter) => (
            <Card key={chapter.id} className="min-w-0 overflow-hidden border border-gray-200 py-0 shadow-sm">
              <CardHeader className="gap-2 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base font-bold text-theo-black">{chapter.name}</CardTitle>
                    <p className="text-xs text-gray-500">Order {chapter.orderIndex}</p>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-theo-yellow/15 text-theo-black">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <Button variant="theo-black" size="sm" className="w-full" onClick={() => goToTopics(chapter.id)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Manage topics
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingChapter(chapter);
                      setFormOpen(true);
                    }}
                    className="min-w-0 flex-1"
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteChapter(chapter.id)}
                    className="min-w-0 flex-1 text-red-600 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ChapterForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingChapter(null);
        }}
        onSubmit={editingChapter ? handleUpdateChapter : handleCreateChapter}
        initialData={editingChapter || undefined}
        mode={editingChapter ? 'edit' : 'create'}
        subjectId={unitId}
      />
    </div>
  );
}
