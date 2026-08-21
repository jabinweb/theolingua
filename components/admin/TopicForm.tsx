'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/FileUpload';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface TopicContentData {
  contentType: string;
  url?: string;
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  iframeHtml?: string;
  widgetConfig?: Record<string, unknown>;
}

interface TopicFormData {
  id?: string;
  name: string;
  type: string;
  duration: string;
  description?: string;
  orderIndex: number;
  chapterId: string;
  pdfUrl?: string;
  requiresPass?: boolean;
  masteryScore?: number | null;
  maxAttempts?: number | null;
  content?: TopicContentData;
}

interface TopicFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TopicFormData) => Promise<void>;
  initialData?: TopicFormData;
  mode: 'create' | 'edit';
  chapterId: string;
}

const TOPIC_TYPES = ['video', 'interactive', 'exercise', 'audio'] as const;
const CONTENT_TYPES = [
  'external_link',
  'video',
  'pdf',
  'text',
  'interactive_widget',
  'iframe',
] as const;

function normalizeTopicType(type?: string | null): string {
  const value = (type || 'video').toLowerCase().trim();
  return (TOPIC_TYPES as readonly string[]).includes(value) ? value : 'video';
}

function normalizeContentType(contentType?: string | null): string {
  const raw = (contentType || 'external_link').toLowerCase().trim();
  const aliases: Record<string, string> = {
    external_link: 'external_link',
    externallink: 'external_link',
    link: 'external_link',
    video: 'video',
    pdf: 'pdf',
    text: 'text',
    interactive_widget: 'interactive_widget',
    interactivewidget: 'interactive_widget',
    widget: 'interactive_widget',
    iframe: 'iframe',
  };
  return aliases[raw] || aliases[raw.replace(/[\s-]/g, '_')] || 'external_link';
}

function emptyContent(): TopicContentData {
  return {
    contentType: 'external_link',
    url: '',
    videoUrl: '',
    pdfUrl: '',
    textContent: '',
    iframeHtml: '',
  };
}

export function TopicForm({ isOpen, onClose, onSubmit, initialData, mode, chapterId }: TopicFormProps) {
  const [formData, setFormData] = useState<TopicFormData>({
    name: '',
    type: 'video',
    duration: '',
    description: '',
    orderIndex: 0,
    chapterId,
    requiresPass: false,
    masteryScore: 80,
    maxAttempts: null,
    content: emptyContent(),
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      let parsedContent = initialData.content;
      if (typeof initialData.content === 'string') {
        try {
          parsedContent = JSON.parse(initialData.content);
        } catch {
          parsedContent = emptyContent();
        }
      }

      setFormData({
        ...initialData,
        type: normalizeTopicType(initialData.type),
        duration: initialData.duration || '',
        description: initialData.description || '',
        chapterId: initialData.chapterId || chapterId,
        requiresPass: Boolean(initialData.requiresPass),
        masteryScore: initialData.masteryScore ?? 80,
        maxAttempts: initialData.maxAttempts ?? null,
        content: {
          contentType: normalizeContentType(parsedContent?.contentType),
          url: parsedContent?.url || '',
          videoUrl: parsedContent?.videoUrl || '',
          pdfUrl: parsedContent?.pdfUrl || '',
          textContent: parsedContent?.textContent || '',
          iframeHtml: parsedContent?.iframeHtml || '',
          widgetConfig: parsedContent?.widgetConfig || undefined,
        },
      });
      return;
    }

    setFormData({
      name: '',
      type: 'video',
      duration: '',
      description: '',
      orderIndex: 0,
      chapterId,
      requiresPass: false,
      masteryScore: 80,
      maxAttempts: null,
      content: emptyContent(),
    });
  }, [isOpen, initialData, chapterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.content?.contentType === 'iframe') {
      const iframeContent = formData.content?.iframeHtml || '';
      if (iframeContent && !iframeContent.includes('<iframe')) {
        toast.error('Please enter valid iframe HTML code starting with <iframe');
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        type: normalizeTopicType(formData.type),
        content: formData.content
          ? {
              ...formData.content,
              contentType: normalizeContentType(formData.content.contentType),
            }
          : undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error submitting topic:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save topic');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (
    field: keyof TopicFormData,
    value: string | number | boolean | object | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateContentData = (field: keyof TopicContentData, value: string | number | object) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        contentType: prev.content?.contentType || 'external_link',
        [field]: value,
      },
    }));
  };

  const contentType = normalizeContentType(formData.content?.contentType);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:w-full">
        <DialogHeader className="shrink-0 border-b border-gray-100 px-5 py-4 sm:px-6">
          <DialogTitle className="text-xl font-bold sm:text-2xl">
            {mode === 'edit' ? 'Edit Topic' : 'Create New Topic'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-5 py-4 sm:px-6">
            <div className="space-y-4 rounded-lg bg-gray-50 p-4 sm:p-5">
              <h3 className="text-base font-semibold">Topic Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Topic Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className="mt-1.5"
                    required
                  />
                </div>

                <div className="min-w-0">
                  <Label htmlFor="type" className="text-sm font-medium">
                    Type
                  </Label>
                  <Select
                    value={normalizeTopicType(formData.type)}
                    onValueChange={(value) => updateFormData('type', value)}
                  >
                    <SelectTrigger id="type" className="mt-1.5 w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="interactive">Interactive</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="min-w-0">
                <Label htmlFor="duration" className="text-sm font-medium">
                  Duration (Optional)
                </Label>
                <Input
                  id="duration"
                  value={formData.duration || ''}
                  onChange={(e) => updateFormData('duration', e.target.value)}
                  placeholder="e.g., 15 min"
                  className="mt-1.5"
                />
              </div>

              <div className="min-w-0">
                <Label htmlFor="description" className="text-sm font-medium">
                  Short Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Brief description of what this topic covers..."
                  rows={3}
                  className="mt-1.5"
                />
              </div>

              <div className="min-w-0">
                <Label htmlFor="orderIndex" className="text-sm font-medium">
                  Order Index
                </Label>
                <Input
                  id="orderIndex"
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) => updateFormData('orderIndex', parseInt(e.target.value) || 0)}
                  className="mt-1.5"
                  required
                />
              </div>
            </div>

            <div className="space-y-4 rounded-lg bg-gray-50 p-4 sm:p-5">
              <h3 className="text-base font-semibold">Scoring & Unlock</h3>
              <p className="break-words text-xs text-gray-500">
                For iframe/HTML activities, the content should post{' '}
                <code className="rounded bg-white px-1 text-[11px]">
                  {'{ type: "theo.score", score, maxScore }'}
                </code>{' '}
                to the parent window. Learners must reach the mastery score before the next topic
                unlocks.
              </p>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Label htmlFor="requiresPass" className="text-sm font-medium">
                    Require passing score
                  </Label>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Hides manual Complete; progress only when the activity reports a pass.
                  </p>
                </div>
                <Switch
                  id="requiresPass"
                  checked={Boolean(formData.requiresPass)}
                  onCheckedChange={(checked) => updateFormData('requiresPass', checked)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <Label htmlFor="masteryScore" className="text-sm font-medium">
                    Mastery score (%)
                  </Label>
                  <Input
                    id="masteryScore"
                    type="number"
                    min={0}
                    max={100}
                    value={formData.masteryScore ?? 80}
                    onChange={(e) =>
                      updateFormData(
                        'masteryScore',
                        e.target.value === ''
                          ? 80
                          : Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                      )
                    }
                    className="mt-1.5"
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="maxAttempts" className="text-sm font-medium">
                    Max attempts (optional)
                  </Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    min={1}
                    value={formData.maxAttempts ?? ''}
                    onChange={(e) =>
                      updateFormData(
                        'maxAttempts',
                        e.target.value === '' ? null : Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    placeholder="Unlimited"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-5">
              <h3 className="text-base font-semibold">Content Details</h3>
              <div className="min-w-0">
                <Label htmlFor="contentType" className="text-sm font-medium">
                  Content Type
                </Label>
                <Select
                  value={contentType}
                  onValueChange={(value) => updateContentData('contentType', value)}
                >
                  <SelectTrigger id="contentType" className="mt-1.5 w-full">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === 'external_link'
                          ? 'External Link'
                          : type === 'interactive_widget'
                            ? 'Interactive Widget'
                            : type === 'iframe'
                              ? 'IFrame'
                              : type === 'pdf'
                                ? 'PDF'
                                : type === 'text'
                                  ? 'Text Content'
                                  : 'Video'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {contentType === 'external_link' && (
                <div className="min-w-0">
                  <Label htmlFor="url" className="text-sm font-medium">
                    URL
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.content?.url || ''}
                    onChange={(e) => updateContentData('url', e.target.value)}
                    placeholder="https://example.com"
                    className="mt-1.5"
                  />
                </div>
              )}

              {contentType === 'video' && (
                <div className="space-y-4">
                  <div className="min-w-0">
                    <Label htmlFor="videoUrl" className="text-sm font-medium">
                      Video URL
                    </Label>
                    <Input
                      id="videoUrl"
                      type="url"
                      value={formData.content?.videoUrl || ''}
                      onChange={(e) => updateContentData('videoUrl', e.target.value)}
                      placeholder="https://youtube.com/watch?v=... or upload below"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Or Upload Video File</Label>
                    <FileUpload
                      folder="theolingua"
                      onUploadComplete={(file) => {
                        updateContentData('videoUrl', file.url);
                        toast.success('Video uploaded successfully');
                      }}
                      accept="video/*"
                    />
                  </div>
                </div>
              )}

              {contentType === 'pdf' && (
                <div className="space-y-4">
                  <div className="min-w-0">
                    <Label htmlFor="pdfUrl" className="text-sm font-medium">
                      PDF URL
                    </Label>
                    <Input
                      id="pdfUrl"
                      type="url"
                      value={formData.content?.pdfUrl || ''}
                      onChange={(e) => updateContentData('pdfUrl', e.target.value)}
                      placeholder="https://example.com/document.pdf or upload below"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Or Upload PDF File</Label>
                    <FileUpload
                      folder="theolingua"
                      onUploadComplete={(file) => {
                        updateContentData('pdfUrl', file.url);
                        toast.success('PDF uploaded successfully');
                      }}
                      accept=".pdf,application/pdf"
                    />
                  </div>
                </div>
              )}

              {contentType === 'text' && (
                <div className="min-w-0">
                  <Label htmlFor="textContent" className="text-sm font-medium">
                    Text Content
                  </Label>
                  <Textarea
                    id="textContent"
                    value={formData.content?.textContent || ''}
                    onChange={(e) => updateContentData('textContent', e.target.value)}
                    rows={4}
                    placeholder="Enter your text content here..."
                    className="mt-1.5"
                  />
                </div>
              )}

              {contentType === 'iframe' && (
                <div className="min-w-0">
                  <Label htmlFor="iframeHtml" className="text-sm font-medium">
                    IFrame HTML
                  </Label>
                  <Textarea
                    id="iframeHtml"
                    value={formData.content?.iframeHtml || ''}
                    onChange={(e) => updateContentData('iframeHtml', e.target.value)}
                    rows={5}
                    placeholder='<iframe allow="fullscreen; autoplay" allowfullscreen width="795" height="690" frameborder="0" src="https://example.com/embed"></iframe>'
                    className="mt-1.5 break-all font-mono text-xs"
                  />
                  <p className="mt-1 break-words text-xs text-gray-500">
                    Paste a full <code>&lt;iframe src=&quot;...&quot;&gt;</code> embed, or wrap HTML in
                    <code> srcdoc</code> using single quotes (
                    <code>srcdoc=&apos;...&apos;</code>) so inner double quotes do not break the
                    player.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:px-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[140px]">
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Topic' : 'Create Topic'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
