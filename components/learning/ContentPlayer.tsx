'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Play, FileText, Monitor } from 'lucide-react';
import { type DbTopic } from '@/hooks/useProgramData';

interface TopicContent {
  contentType: string;
  url?: string;
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  iframeHtml?: string;
  widgetConfig?: object;
}

function normalizeContentType(contentType?: string) {
  return contentType?.toLowerCase() ?? '';
}

function resolvePdfUrl(content?: TopicContent | null) {
  if (!content) return null;
  return content.pdfUrl || content.url || null;
}

function isPdfContent(content?: TopicContent | null) {
  return normalizeContentType(content?.contentType) === 'pdf' && !!resolvePdfUrl(content);
}

function PdfViewer({ url, title }: { url: string; title: string }) {
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-gray-100">
      <object data={url} type="application/pdf" className="h-full w-full" aria-label={title}>
        <embed src={url} type="application/pdf" className="h-full w-full" title={title} />
      </object>
    </div>
  );
}

interface ContentPlayerProps {
  topic: DbTopic | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onIncomplete?: () => void; // New prop for marking as incomplete
  onNext?: () => void;
  isCompleted?: boolean;
  isDemo?: boolean; // Flag to indicate this is demo mode
  demoContent?: TopicContent; // Pre-loaded demo content
  isDemoLimitReached?: boolean; // Flag to indicate demo user has reached access limit
}

export function ContentPlayer({ 
  topic, 
  isOpen, 
  onClose, 
  onComplete, 
  onIncomplete, // New prop
  onNext, 
  isCompleted = false, 
  isDemo = false,
  demoContent,
  isDemoLimitReached = false
}: ContentPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [topicContent, setTopicContent] = useState<TopicContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  // Fetch content from secure endpoint when topic opens
  useEffect(() => {
    if (topic?.id && isOpen) {
      // If demo mode and demo content is provided, use it directly
      if (isDemo && demoContent) {
        setTopicContent(demoContent);
        return;
      }
      
      // Otherwise fetch from API (for dashboard/authenticated users)
      setContentLoading(true);
      fetch(`/api/content/topic/${topic.id}`)
        .then(async response => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            // For 403 errors (access denied), just set content to null - the UI will handle it
            if (response.status === 403) {
              console.warn('Access denied for topic:', topic.id);
              setTopicContent(null);
              setContentLoading(false);
              return null;
            }
            throw new Error(`Failed to fetch content: ${response.status} - ${errorData.error || response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          if (data) {
            console.log('ContentPlayer: Fetched content from API:', data.content);
            setTopicContent(data.content);
          }
          setContentLoading(false);
        })
        .catch(error => {
          console.error('Error fetching topic content:', error);
          setTopicContent(null);
          setContentLoading(false);
        });
    }
  }, [topic?.id, isOpen, isDemo, demoContent]);

  // Reset content when topic changes (but not in demo mode where content is passed directly)
  useEffect(() => {
    if (!isDemo) {
      setTopicContent(null);
    }
  }, [topic?.id, isDemo]);

  // Only reset state when topic actually changes (by ID), not when completion status changes
  useEffect(() => {
    setHasCompleted(isCompleted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic?.id]); // Intentionally only depend on topic ID to avoid resetting on completion changes

  // Handle fullscreen mode on mobile to hide browser address bar
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isOpen && isMobile) {
      // Request fullscreen on mobile devices
      const enterFullscreen = async () => {
        try {
          const docElement = document.documentElement as HTMLElement & {
            webkitRequestFullscreen?: () => Promise<void>;
            msRequestFullscreen?: () => Promise<void>;
          };
          
          if (docElement.requestFullscreen) {
            await docElement.requestFullscreen();
          } else if (docElement.webkitRequestFullscreen) {
            await docElement.webkitRequestFullscreen();
          } else if (docElement.msRequestFullscreen) {
            await docElement.msRequestFullscreen();
          }
        } catch (error) {
          console.log('Fullscreen request failed:', error);
        }
      };

      // Small delay to ensure dialog is rendered
      const timer = setTimeout(enterFullscreen, 300);
      
      return () => {
        clearTimeout(timer);
        // Exit fullscreen when dialog closes
        const doc = document as Document & {
          webkitFullscreenElement?: Element;
          msFullscreenElement?: Element;
          webkitExitFullscreen?: () => void;
          msExitFullscreen?: () => void;
        };
        
        if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement) {
          if (doc.exitFullscreen) {
            doc.exitFullscreen().catch(() => {});
          } else if (doc.webkitExitFullscreen) {
            doc.webkitExitFullscreen();
          } else if (doc.msExitFullscreen) {
            doc.msExitFullscreen();
          }
        }
      };
    }
  }, [isOpen]);

  if (!topic) return null;

  const handleComplete = () => {
    if (!hasCompleted && !isCompleted) {
      console.log('Completing topic:', topic?.name);
      setHasCompleted(true);
      onComplete();
    }
  };

  const handleIncomplete = () => {
    if ((hasCompleted || isCompleted) && onIncomplete) {
      console.log('Marking topic as incomplete:', topic?.name);
      setHasCompleted(false);
      onIncomplete();
    }
  };

  const handleContentAction = () => {
    if (!topicContent) return;
    
    setIsLoading(true);
    
    switch (topicContent.contentType?.toLowerCase()) {
      case 'external_link':
        if (topicContent.url) {
          window.open(topicContent.url, '_blank');
        }
        break;
      case 'video':
        // Video is embedded inline in the player
        break;
      case 'pdf':
        // PDF is embedded inline in the player
        break;
      case 'text':
        // Text content is displayed inline
        break;
      case 'interactive_widget':
        // Handle interactive widget
        console.log('Loading widget:', topicContent.widgetConfig);
        break;
      case 'iframe':
        // Iframe content is displayed inline
        console.log('Iframe content displayed inline');
        break;
      default:
        console.warn('Unknown content type:', topicContent.contentType);
        break;
    }
    
    setTimeout(() => setIsLoading(false), 1000);
  };

  const getContentIcon = () => {
    if (!topicContent) return <Play className="h-5 w-5" />;
    
    const contentType = topicContent.contentType?.toLowerCase();
    switch (contentType) {
      case 'external_link': return <ExternalLink className="h-5 w-5" />;
      case 'video': return <Play className="h-5 w-5" />;
      case 'pdf': return <FileText className="h-5 w-5" />;
      case 'text': return <FileText className="h-5 w-5" />;
      case 'interactive_widget': return <Monitor className="h-5 w-5" />;
      case 'iframe': return <Monitor className="h-5 w-5" />;
      default: return <Play className="h-5 w-5" />;
    }
  };

  const getActionText = () => {
    if (!topicContent) return 'Start Learning';
    
    const contentType = topicContent.contentType?.toLowerCase();
    switch (contentType) {
      case 'external_link': return 'Open Link';
      case 'video': return 'Play Video';
      case 'pdf': return 'View PDF';
      case 'text': return 'Read Content';
      case 'interactive_widget': return 'Start Activity';
      case 'iframe': return 'Start Activity';
      default: return 'Start Learning';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="!fixed !inset-0 !w-screen !h-screen !max-w-none !max-h-none !p-0 !m-0 !gap-0 !border-0 !bg-black !translate-x-0 !translate-y-0 !left-0 !top-0 !flex flex-col overflow-hidden !rounded-none [&>button]:hidden">
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">{topic.name}</DialogTitle>
        
        {/* Header - Compact and clean */}
        <div className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 flex items-center justify-between gap-3 border-b border-gray-700">
          <div className="flex items-center gap-2 text-white text-sm min-w-0 flex-1">
            <div className="flex-shrink-0">
              {getContentIcon()}
            </div>
            <span className="truncate font-medium">{topic.name}</span>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            {/* Complete/Incomplete Toggle Button */}
            {(hasCompleted || isCompleted) && onIncomplete ? (
              <Button 
                onClick={handleIncomplete} 
                size="sm" 
                className="gap-1 text-white text-xs sm:text-sm px-3 py-1.5 bg-orange-600 hover:bg-orange-700 h-8"
              >
                <span className="hidden sm:inline">Mark Incomplete</span>
                <span className="sm:hidden">↺</span>
              </Button>
            ) : (
              <Button 
                onClick={handleComplete} 
                size="sm" 
                disabled={hasCompleted || isCompleted}
                className={`gap-1 text-white text-xs sm:text-sm px-3 py-1.5 h-8 ${
                  hasCompleted || isCompleted 
                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <span className="hidden sm:inline">{hasCompleted || isCompleted ? 'Completed' : 'Complete'}</span>
                <span className="sm:hidden">✓</span>
              </Button>
            )}
            {onNext && (
              <Button 
                onClick={onNext} 
                size="sm" 
                disabled={false}
                className={`gap-1 text-white text-xs sm:text-sm px-3 py-1.5 h-8 ${
                  isDemo && isDemoLimitReached 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title={isDemo && isDemoLimitReached ? "Upgrade to access more content" : "Play the next game/topic"}
              >
                <span className="hidden sm:inline">
                  {isDemo && isDemoLimitReached ? 'Upgrade' : 'Play Next'}
                </span>
                <span className="sm:hidden">
                  {isDemo && isDemoLimitReached ? '⬆' : '→'}
                </span>
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={onClose} 
              size="sm" 
              className="border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white text-xs sm:text-sm px-3 py-1.5 h-8"
            >
              <span className="hidden sm:inline">Close</span>
              <span className="sm:hidden">×</span>
            </Button>
          </div>
        </div>
        
        {/* Content Area - Takes all remaining space */}
        <div className="flex-1 overflow-hidden relative bg-black">
          <div className="absolute inset-0 w-full h-full bg-black">
            {(() => {
              console.log('ContentPlayer: Current state:', {
                isOpen,
                isDemo,
                hasTopicContent: !!topicContent,
                topicContentType: topicContent?.contentType,
                hasIframeHtml: !!topicContent?.iframeHtml,
                contentLoading,
                topicName: topic?.name
              });
              return null;
            })()}
            {contentLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="mb-4 p-4 bg-gray-800 rounded-full animate-pulse">
                  <Play className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-white">Loading Content...</h3>
                <p className="text-gray-400">Please wait while we fetch the content.</p>
              </div>
            ) : topicContent?.contentType?.toLowerCase() === 'text' && topicContent.textContent ? (
              <div className="prose prose-invert max-w-4xl h-full overflow-auto p-4">
                <p className="text-gray-200">{topicContent.textContent}</p>
              </div>
            ) : topicContent?.contentType?.toLowerCase() === 'video' && topicContent.videoUrl ? (
              <div className="w-full h-full absolute inset-0">
                {/* Handle different video URL formats */}
                {topicContent.videoUrl.includes('youtube.com') || topicContent.videoUrl.includes('youtu.be') ? (
                  <iframe 
                    src={topicContent.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    className="w-full h-full absolute inset-0"
                    style={{ border: 'none', margin: 0, padding: 0 }}
                    allowFullScreen
                    title={topic.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : topicContent.videoUrl.includes('vimeo.com') ? (
                  <iframe 
                    src={topicContent.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="w-full h-full absolute inset-0"
                    style={{ border: 'none', margin: 0, padding: 0 }}
                    allowFullScreen
                    title={topic.name}
                    allow="autoplay; fullscreen; picture-in-picture"
                  />
                ) : (
                  <video 
                    controls
                    className="w-full h-full object-contain"
                    title={topic.name}
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  >
                    <source src={topicContent.videoUrl} type="video/mp4" />
                    <source src={topicContent.videoUrl} type="video/webm" />
                    <source src={topicContent.videoUrl} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ) : isPdfContent(topicContent) ? (
              <PdfViewer url={resolvePdfUrl(topicContent)!} title={topic.name} />
            ) : topicContent?.contentType?.toLowerCase() === 'interactive_widget' ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="mb-4 p-4 bg-gray-800 rounded-full">
                  <Monitor className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-white">Interactive Widget</h3>
                <p className="text-gray-400 mb-4">
                  This content will load an interactive learning experience.
                </p>
                {topicContent?.widgetConfig && (
                  <pre className="text-xs bg-gray-800 text-green-400 p-2 rounded max-w-md overflow-auto">
                    {JSON.stringify(topicContent.widgetConfig, null, 2)}
                  </pre>
                )}
              </div>
            ) : (topicContent?.contentType?.toLowerCase() === 'iframe' || topicContent?.contentType === 'IFRAME') && topicContent.iframeHtml ? (
              <div className="w-full h-full absolute inset-0">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: topicContent.iframeHtml
                      .replace(/width\s*=\s*["']\d+["']/gi, 'width="100%"')
                      .replace(/height\s*=\s*["']\d+["']/gi, 'height="100%"')
                      .replace(/frameborder\s*=\s*["']\d+["']/gi, 'frameborder="0"')
                      .replace(/style\s*=\s*["'][^"']*["']/gi, '')
                      .replace(/<iframe/gi, '<iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"')
                  }}
                  className="w-full h-full absolute inset-0"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8">
                <div className="mb-4 p-3 sm:p-4 bg-gray-800 rounded-full">
                  {getContentIcon()}
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-2 text-white">{topic?.name}</h3>
                <p className="text-sm sm:text-base text-gray-400 mb-4">
                  Duration: {topic?.duration} • Type: {topicContent?.contentType || 'content'}
                </p>
                <Button 
                  onClick={handleContentAction}
                  disabled={isLoading || contentLoading}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 text-sm sm:text-base px-4 py-2"
                >
                  {getContentIcon()}
                  {contentLoading ? 'Loading...' : getActionText()}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
