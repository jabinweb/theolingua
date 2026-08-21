'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { TopicForm } from '@/components/admin/TopicForm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ContentLoader } from '@/components/ui/content-loader';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

interface TopicContentData {
  contentType: string;
  url?: string;
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  iframeHtml?: string;
  widgetConfig?: Record<string, unknown>;
}

interface Topic {
  id: string;
  name: string;
  type: string;
  duration: string;
  description?: string;
  difficulty?: string;
  orderIndex: number;
  chapterId: string;
  requiresPass?: boolean;
  masteryScore?: number | null;
  maxAttempts?: number | null;
  created_at: string;
  updated_at: string;
  content?: TopicContentData;
}

interface TopicFormData {
  id?: string;
  name: string;
  type: string;
  duration: string;
  description?: string;
  orderIndex: number;
  chapterId: string;
  requiresPass?: boolean;
  masteryScore?: number | null;
  maxAttempts?: number | null;
  content?: TopicContentData;
}

export default function TopicsPage() {
  const params = useParams();
  const router = useRouter();
  const { confirm, dialog } = useConfirmDialog();
  const programId = params.programId as string;
  const unitId = params.unitId as string;
  const chapterId = params.chapterId as string;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  useEffect(() => {
    fetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/topics?chapterId=${chapterId}`);
      const data = await response.json();
      setTopics(Array.isArray(data) ? data : []);
    } catch {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (formData: TopicFormData) => {
    const response = await fetch('/api/admin/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (response.ok) fetchTopics();
    else throw new Error('Failed to create topic');
  };

  const handleUpdateTopic = async (formData: TopicFormData) => {
    const response = await fetch('/api/admin/topics', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (response.ok) fetchTopics();
    else throw new Error('Failed to update topic');
  };

  // When editing, ensure content is always an object or undefined, never a string
  const handleEditTopic = (topic: Topic) => {
    console.log('Editing topic:', topic);
    console.log('Topic content type:', typeof topic.content);
    console.log('Topic content value:', topic.content);
    
    // Parse content if it's a string (from database)
    let parsedContent;
    if (typeof topic.content === 'string') {
      try {
        parsedContent = JSON.parse(topic.content);
        console.log('Parsed content from string:', parsedContent);
      } catch (error) {
        console.error('Failed to parse content string:', error);
        parsedContent = {
          contentType: 'external_link',
          url: '',
          videoUrl: '',
          pdfUrl: '',
          textContent: '',
          iframeHtml: '',
        };
      }
    } else if (topic.content && typeof topic.content === 'object') {
      // Content is already an object, ensure all fields are present and convert contentType
      parsedContent = {
        contentType: topic.content.contentType?.toLowerCase() || 'external_link',
        url: topic.content.url || '',
        videoUrl: topic.content.videoUrl || '',
        pdfUrl: topic.content.pdfUrl || '',
        textContent: topic.content.textContent || '',
        iframeHtml: topic.content.iframeHtml || '',
        widgetConfig: topic.content.widgetConfig || undefined,
      };
      console.log('Content is object, normalized:', parsedContent);
    } else {
      // No content, create default
      parsedContent = {
        contentType: 'external_link',
        url: '',
        videoUrl: '',
        pdfUrl: '',
        textContent: '',
        iframeHtml: '',
      };
      console.log('No content, using default:', parsedContent);
    }

    const topicForEditing = {
      ...topic,
      type: (topic.type || 'video').toLowerCase(),
      duration: topic.duration || '',
      description: topic.description || '',
      requiresPass: Boolean(topic.requiresPass),
      masteryScore: topic.masteryScore ?? 80,
      maxAttempts: topic.maxAttempts ?? null,
      content: parsedContent,
    };
    
    console.log('Final topic for editing:', topicForEditing);
    setEditingTopic(topicForEditing);
    setFormOpen(true);
  };

  const handleDeleteTopic = async (topicId: string) => {
    const ok = await confirm({
      title: 'Delete topic?',
      description: 'Delete this topic?',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    const response = await fetch(`/api/admin/topics?id=${topicId}`, { method: 'DELETE' });
    if (response.ok) fetchTopics();
  };

  return (
    <div className="min-w-0">
      {dialog}
      <AdminPageHeader
        title="Lesson topics"
        badge="Content management"
        description="Manage educational topics and media"
        onBack={() => router.push(`/admin/programs/${programId}/units/${unitId}/chapters`)}
        actions={
          <Button size="sm" variant="theo" onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add topic
          </Button>
        }
      />

      {loading ? (
        <ContentLoader variant="cards" />
      ) : (
        <div className="admin-card-grid">
          {topics.map((topic) => (
            <Card key={topic.id} className="min-w-0 overflow-hidden border border-gray-200 shadow-sm">
              <CardHeader className="gap-2 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base font-bold text-theo-black">{topic.name}</CardTitle>
                    <p className="text-xs text-gray-500">Order {topic.orderIndex}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {topic.type || 'Topic'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button variant="theo-black" size="sm" onClick={() => handleEditTopic(topic)} className="min-w-0 flex-1">
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTopic(topic.id)}
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

      <TopicForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTopic(null);
        }}
        onSubmit={editingTopic ? handleUpdateTopic : handleCreateTopic}
        initialData={editingTopic || undefined}
        mode={editingTopic ? 'edit' : 'create'}
        chapterId={chapterId}
      />
    </div>
  );
}
