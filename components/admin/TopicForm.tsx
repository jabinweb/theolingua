'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/FileUpload';
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

export function TopicForm({ isOpen, onClose, onSubmit, initialData, mode, chapterId }: TopicFormProps) {
  const [formData, setFormData] = useState<TopicFormData>({
    name: '',
    type: 'video',
    duration: '',
    description: '',
    orderIndex: 0,
    chapterId,
    content: {
      contentType: 'external_link',
      url: '',
      videoUrl: '',
      pdfUrl: '',
      textContent: '',
      iframeHtml: '',
    }
  });
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    console.log('TopicForm useEffect triggered:', { isOpen, initialData });
    
    if (isOpen && initialData) {
      console.log('Initializing form with data:', initialData);
      
      // Parse content if it's a string
      let parsedContent = initialData.content;
      if (typeof initialData.content === 'string') {
        try {
          parsedContent = JSON.parse(initialData.content);
          console.log('Parsed content from string:', parsedContent);
        } catch (error) {
          console.error('Failed to parse content:', error);
          parsedContent = {
            contentType: 'external_link',
            url: '',
            videoUrl: '',
            pdfUrl: '',
            textContent: '',
          };
        }
      }

      // Ensure all content fields are properly set
      const contentData = {
        contentType: parsedContent?.contentType || 'external_link',
        url: parsedContent?.url || '',
        videoUrl: parsedContent?.videoUrl || '',
        pdfUrl: parsedContent?.pdfUrl || '',
        textContent: parsedContent?.textContent || '',
        iframeHtml: parsedContent?.iframeHtml || '',
        widgetConfig: parsedContent?.widgetConfig || undefined,
      };

      console.log('Setting form data:', {
        ...initialData,
        content: contentData
      });

      setFormData({
        ...initialData,
        content: contentData
      });
    } else if (isOpen && !initialData) {
      console.log('Resetting form for new topic');
      setFormData({
        name: '',
        type: 'video',
        duration: '',
        description: '',
        orderIndex: 0,
        chapterId,
        content: {
          contentType: 'external_link',
          url: '',
          videoUrl: '',
          pdfUrl: '',
          textContent: '',
          iframeHtml: '',
        }
      });
    }
  }, [isOpen, initialData, chapterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation for iframe content
    if (formData.content?.contentType === 'iframe') {
      const iframeContent = formData.content?.iframeHtml || '';
      if (iframeContent && !iframeContent.includes('<iframe')) {
        alert('Please enter valid iframe HTML code starting with <iframe');
        return;
      }
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof TopicFormData, value: string | number | object) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateContentData = (field: keyof TopicContentData, value: string | number | object) => {
    setFormData(prev => ({
      ...prev,
      content: { 
        ...prev.content,
        contentType: prev.content?.contentType || 'external_link', // Ensure contentType is always defined
        [field]: value 
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{mode === 'edit' ? 'Edit Topic' : 'Create New Topic'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-5 rounded-lg space-y-4">
            <h3 className="font-semibold text-base">Topic Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Topic Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-sm font-medium">Type</Label>
                <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
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

            <div>
              <Label htmlFor="duration" className="text-sm font-medium">Duration (Optional)</Label>
              <Input
                id="duration"
                value={formData.duration || ''}
                onChange={(e) => updateFormData('duration', e.target.value)}
                placeholder="e.g., 15 min"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Short Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Brief description of what this topic covers..."
                rows={3}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="orderIndex" className="text-sm font-medium">Order Index</Label>
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

          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h3 className="font-semibold text-base">Content Details</h3>
            <div>
              <Label htmlFor="contentType" className="text-sm font-medium">Content Type</Label>
              <Select 
                value={formData.content?.contentType || 'external_link'} 
                onValueChange={(value) => updateContentData('contentType', value)}
              >
                <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="external_link">External Link</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="text">Text Content</SelectItem>
                <SelectItem value="interactive_widget">Interactive Widget</SelectItem>
                <SelectItem value="iframe">IFrame</SelectItem>
              </SelectContent>
            </Select>
          </div>

            {/* Conditional Content Fields */}
            {formData.content?.contentType === 'external_link' && (
              <div>
                <Label htmlFor="url" className="text-sm font-medium">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.content?.url || ''}
                  onChange={(e) => {
                    console.log('URL changed to:', e.target.value);
                    updateContentData('url', e.target.value);
                  }}
                  placeholder="https://example.com"
                  className="mt-1.5"
                />
              </div>
            )}

            {formData.content?.contentType === 'video' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="videoUrl" className="text-sm font-medium">Video URL</Label>
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

            {formData.content?.contentType === 'pdf' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pdfUrl" className="text-sm font-medium">PDF URL</Label>
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

            {formData.content?.contentType === 'text' && (
              <div>
                <Label htmlFor="textContent" className="text-sm font-medium">Text Content</Label>
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

            {formData.content?.contentType === 'iframe' && (
              <div>
                <Label htmlFor="iframeHtml" className="text-sm font-medium">IFrame HTML</Label>
                <Textarea
                  id="iframeHtml"
                  value={formData.content?.iframeHtml || ''}
                  onChange={(e) => updateContentData('iframeHtml', e.target.value)}
                  rows={4}
                  placeholder='<iframe allow="fullscreen; autoplay" allowfullscreen width="795" height="690" frameborder="0" src="https://example.com/embed"></iframe>'
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">Paste the complete iframe HTML code here</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
