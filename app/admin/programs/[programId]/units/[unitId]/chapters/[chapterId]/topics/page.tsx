'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { TopicForm } from '@/components/admin/TopicForm';

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
  difficulty?: string;
  orderIndex: number;
  chapterId: string;
  created_at: string;
  updated_at: string;
  content?: TopicContentData;
}

interface TopicFormData {
  id?: string;
  name: string;
  type: string;
  duration: string;
  orderIndex: number;
  chapterId: string;
  content?: TopicContentData;
}

export default function TopicsPage() {
  const params = useParams();
  const router = useRouter();
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
      content: parsedContent,
    };
    
    console.log('Final topic for editing:', topicForEditing);
    setEditingTopic(topicForEditing);
    setFormOpen(true);
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Delete this topic?')) return;
    const response = await fetch(`/api/admin/topics?id=${topicId}`, { method: 'DELETE' });
    if (response.ok) fetchTopics();
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
                onClick={() => router.push(`/admin/programs/${programId}/units/${unitId}/chapters`)}
                className="rounded-2xl h-12 w-12 border-theo-black/10 hover:bg-theo-yellow hover:border-theo-yellow transition-all shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-5xl font-bold text-theo-black tracking-tight mb-2">
                  Lesson Topics
                </h1>
                <div className="flex items-center gap-3">
                  <Badge variant="theo-black" className="rounded-full px-4 font-bold uppercase tracking-tighter text-[10px]">CONTENT MANAGEMENT</Badge>
                  <p className="text-gray-500 font-medium text-lg">Manage educational topics and media</p>
                </div>
              </div>
            </div>
            <Button 
                onClick={() => setFormOpen(true)}
                variant="theo"
                className="rounded-2xl h-12 px-6 shadow-lg shadow-theo-yellow/20"
              >
              <Plus className="h-5 w-5 mr-2" />
              Add New Topic
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Card key={topic.id} className="border-0 shadow-sm rounded-[32px] overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardHeader className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-theo-black">{topic.name}</CardTitle>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ORDER INDEX: {topic.orderIndex}</p>
                    </div>
                    <Badge variant="theo-black" className="rounded-full px-3 font-bold uppercase tracking-tighter text-[9px] h-fit">
                      {topic.type || 'TOPIC'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Button
                        variant="theo-black"
                        size="sm"
                        onClick={() => handleEditTopic(topic)}
                        className="flex-1 rounded-xl h-10 font-bold"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTopic(topic.id)}
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

        <TopicForm
          isOpen={formOpen}
          onClose={() => { setFormOpen(false); setEditingTopic(null); }}
          onSubmit={editingTopic ? handleUpdateTopic : handleCreateTopic}
          initialData={editingTopic || undefined}
          mode={editingTopic ? 'edit' : 'create'}
          chapterId={chapterId}
        />
      </div>
    </div>
  );
}
