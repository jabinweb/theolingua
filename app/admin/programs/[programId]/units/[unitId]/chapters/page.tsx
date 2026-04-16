'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowLeft, FileText } from 'lucide-react';
import { ChapterForm } from '@/components/admin/ChapterForm';

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
    <div className="p-8 bg-theo-white/30 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => router.push(`/admin/programs/${programId}`)}
                className="rounded-2xl h-12 w-12 border-theo-black/10 hover:bg-theo-yellow hover:border-theo-yellow transition-all shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-5xl font-bold text-theo-black tracking-tight mb-2">
                  Unit Lessons
                </h1>
                <div className="flex items-center gap-3">
                  <Badge variant="theo-black" className="rounded-full px-4 font-bold uppercase tracking-tighter text-[10px]">CONTENT MANAGEMENT</Badge>
                  <p className="text-gray-500 font-medium text-lg">Manage structured lessons for this unit</p>
                </div>
              </div>
            </div>
            <Button 
                onClick={() => setFormOpen(true)}
                variant="theo"
                className="rounded-2xl h-12 px-6 shadow-lg shadow-theo-yellow/20"
              >
              <Plus className="h-5 w-5 mr-2" />
              Add New Lesson
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter) => (
              <Card key={chapter.id} className="border-0 shadow-sm rounded-[32px] overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardHeader className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-theo-black">{chapter.name}</CardTitle>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ORDER INDEX: {chapter.orderIndex}</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-theo-yellow/10 flex items-center justify-center text-theo-black group-hover:scale-110 transition-transform">
                      <FileText className="h-6 w-6" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="space-y-4">
                    <Button
                      variant="theo-black"
                      className="w-full rounded-2xl h-12 shadow-sm font-bold"
                      onClick={() => goToTopics(chapter.id)}
                    >
                      <FileText className="h-5 w-5 mr-3" />
                      Manage Topics
                    </Button>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditingChapter(chapter); setFormOpen(true); }}
                        className="flex-1 rounded-xl h-10 border-theo-black/10 font-bold"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="flex-1 rounded-xl h-10 text-red-600 hover:bg-red-50 font-bold"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <ChapterForm
          isOpen={formOpen}
          onClose={() => { setFormOpen(false); setEditingChapter(null); }}
          onSubmit={editingChapter ? handleUpdateChapter : handleCreateChapter}
          initialData={editingChapter || undefined}
          mode={editingChapter ? 'edit' : 'create'}
          subjectId={unitId}
        />
      </div>
    </div>
  );
}
