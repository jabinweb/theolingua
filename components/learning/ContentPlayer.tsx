'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Play, FileText, Monitor, RotateCcw, Check, ArrowRight, X } from 'lucide-react';
import { type DbTopic } from '@/hooks/useProgramData';
import { parseIframeHtml } from '@/lib/parse-iframe-html';
import {
  THEO_SCORE_MESSAGE_TYPE,
  defaultMasteryScore,
  isTheoScoreMessage,
  normalizeScorePayload,
} from '@/lib/score-bridge';
import { toast } from 'sonner';

interface TopicContent {
  contentType: string;
  url?: string;
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  iframeHtml?: string;
  widgetConfig?: object;
}

interface TopicMasteryMeta {
  requiresPass: boolean;
  masteryScore: number;
  maxAttempts: number | null;
  bestScore: number | null;
  lastScore: number | null;
  attemptCount: number;
}

function IframeHtmlPlayer({
  html,
  title,
  reloadKey,
}: {
  html: string;
  title: string;
  reloadKey: number;
}) {
  const parsed = parseIframeHtml(html);

  if (!parsed.src && !parsed.srcDoc) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-gray-300">
        This iframe content could not be parsed. Re-save the topic with a valid embed.
      </div>
    );
  }

  return (
    <div className="absolute inset-0 h-full w-full">
      <iframe
        key={reloadKey}
        title={title}
        src={parsed.src}
        srcDoc={parsed.srcDoc}
        sandbox={parsed.sandbox || 'allow-scripts allow-forms allow-popups allow-modals'}
        allow={parsed.allow}
        allowFullScreen={parsed.allowFullScreen}
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}

function normalizeContentType(contentType?: string) {
  return contentType?.toLowerCase() ?? '';
}

function resolvePdfUrl(content?: TopicContent | null) {
  if (!content) return null;
  return content.pdfUrl || content.url || null;
}

function normalizeTopicContent(raw: TopicContent): TopicContent {
  const fileUrl = raw.pdfUrl || raw.url || '';
  const looksLikePdf = /\.pdf(\?|#|$)/i.test(fileUrl);
  const isPdf = normalizeContentType(raw.contentType) === 'pdf' || looksLikePdf;
  const pdfUrl = isPdf ? raw.pdfUrl || raw.url : raw.pdfUrl;

  return {
    ...raw,
    contentType: isPdf ? 'PDF' : raw.contentType,
    pdfUrl: pdfUrl || undefined,
  };
}

function isPdfContent(content?: TopicContent | null) {
  const url = resolvePdfUrl(content);
  if (!content || !url) return false;
  const type = normalizeContentType(content.contentType);
  return type === 'pdf' || /\.pdf(\?|#|$)/i.test(url);
}

function PdfViewer({ url, title }: { url: string; title: string }) {
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-white">
      <iframe src={url} className="h-full w-full border-0" title={title} />
    </div>
  );
}

interface ContentPlayerProps {
  topic: DbTopic | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onIncomplete?: () => void;
  onNext?: () => void;
  isCompleted?: boolean;
  canGoNext?: boolean;
  isDemo?: boolean;
  demoContent?: TopicContent;
  isDemoLimitReached?: boolean;
}

export function ContentPlayer({
  topic,
  isOpen,
  onClose,
  onComplete,
  onIncomplete,
  onNext,
  isCompleted = false,
  canGoNext = true,
  isDemo = false,
  demoContent,
  isDemoLimitReached = false,
}: ContentPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [topicContent, setTopicContent] = useState<TopicContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [mastery, setMastery] = useState<TopicMasteryMeta | null>(null);
  const [lastResult, setLastResult] = useState<{
    percent: number;
    passed: boolean;
    canRetry: boolean;
  } | null>(null);
  const [scoreSubmitting, setScoreSubmitting] = useState(false);
  const [iframeReloadKey, setIframeReloadKey] = useState(0);

  const requiresPass = mastery?.requiresPass ?? Boolean(topic?.requiresPass);
  const masteryScore = mastery?.masteryScore ?? defaultMasteryScore(topic?.masteryScore);
  const showManualComplete = !requiresPass;

  useEffect(() => {
    if (!topic?.id || !isOpen) {
      return;
    }

    if (isDemo && demoContent) {
      setTopicContent(normalizeTopicContent(demoContent));
      setContentError(null);
      setMastery({
        requiresPass: Boolean(topic.requiresPass),
        masteryScore: defaultMasteryScore(topic.masteryScore),
        maxAttempts: topic.maxAttempts ?? null,
        bestScore: null,
        lastScore: null,
        attemptCount: 0,
      });
      return;
    }

    setTopicContent(null);
    setContentError(null);
    setContentLoading(true);
    setLastResult(null);

    fetch(`/api/content/topic/${topic.id}`)
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          if (response.status === 403) {
            setContentError(errorData.error || 'You need access to view this content.');
            setTopicContent(null);
            setContentLoading(false);
            return null;
          }
          throw new Error(
            `Failed to fetch content: ${response.status} - ${errorData.error || response.statusText}`
          );
        }
        return response.json();
      })
      .then((data) => {
        if (data?.content) {
          setTopicContent(normalizeTopicContent(data.content));
        }
        setMastery({
          requiresPass: Boolean(data?.requiresPass),
          masteryScore: defaultMasteryScore(data?.masteryScore),
          maxAttempts: data?.maxAttempts ?? null,
          bestScore: data?.progress?.bestScore ?? null,
          lastScore: data?.progress?.lastScore ?? null,
          attemptCount: data?.progress?.attemptCount ?? 0,
        });
        if (data?.progress?.completed) {
          setHasCompleted(true);
        }
        setContentLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching topic content:', error);
        setContentError('Failed to load content. Please try again.');
        setTopicContent(null);
        setContentLoading(false);
      });
  }, [topic?.id, isOpen, isDemo, demoContent, topic?.requiresPass, topic?.masteryScore, topic?.maxAttempts]);

  useEffect(() => {
    setHasCompleted(isCompleted);
    setLastResult(null);
    setIframeReloadKey(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic?.id]);

  const submitScore = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!topic?.id || isDemo || scoreSubmitting) return;

      setScoreSubmitting(true);
      try {
        const response = await fetch('/api/user/topic-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topicId: topic.id, ...payload }),
        });
        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || 'Failed to save score');
          return;
        }

        setLastResult({
          percent: data.percent,
          passed: data.passed,
          canRetry: Boolean(data.canRetry),
        });
        setMastery((prev) =>
          prev
            ? {
                ...prev,
                bestScore: data.progress?.bestScore ?? prev.bestScore,
                lastScore: data.progress?.lastScore ?? data.percent,
                attemptCount: data.progress?.attemptCount ?? prev.attemptCount,
              }
            : prev
        );

        if (data.passed || data.completed) {
          setHasCompleted(true);
          onComplete();
          toast.success(
            data.passed
              ? `Passed with ${Math.round(data.percent)}% (need ${data.masteryScore}%)`
              : 'Topic completed'
          );
        } else {
          toast.error(
            `Score ${Math.round(data.percent)}% — need ${data.masteryScore}% to pass this topic`
          );
        }
      } catch (error) {
        console.error('Score submit failed:', error);
        toast.error('Failed to save score');
      } finally {
        setScoreSubmitting(false);
      }
    },
    [topic?.id, isDemo, scoreSubmitting, onComplete]
  );

  useEffect(() => {
    if (!isOpen || !topic?.id) return;

    const onMessage = (event: MessageEvent) => {
      if (!isTheoScoreMessage(event.data)) return;
      const normalized = normalizeScorePayload(event.data, masteryScore);
      if (!normalized) return;

      void submitScore({
        type: THEO_SCORE_MESSAGE_TYPE,
        score: event.data.score,
        maxScore: event.data.maxScore,
        percent: event.data.percent,
        status: event.data.status,
      });
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [isOpen, topic?.id, masteryScore, submitScore]);

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isOpen && isMobile) {
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
        } catch {
          // Fullscreen is optional
        }
      };

      const timer = setTimeout(() => {
        void enterFullscreen();
      }, 300);

      return () => {
        clearTimeout(timer);
        try {
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
        } catch {
          // Ignore exit failures
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!topic) return null;

  const handleComplete = () => {
    if (requiresPass) {
      toast.message('Complete the activity to pass this topic');
      return;
    }
    if (!hasCompleted && !isCompleted) {
      setHasCompleted(true);
      onComplete();
    }
  };

  const handleIncomplete = () => {
    if ((hasCompleted || isCompleted) && onIncomplete) {
      setHasCompleted(false);
      onIncomplete();
    }
  };

  const handleRetry = () => {
    setLastResult(null);
    setIframeReloadKey((k) => k + 1);
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
      default:
        break;
    }

    setTimeout(() => setIsLoading(false), 1000);
  };

  const getContentIcon = () => {
    if (!topicContent) return <Play className="h-5 w-5" />;

    const contentType = topicContent.contentType?.toLowerCase();
    switch (contentType) {
      case 'external_link':
        return <ExternalLink className="h-5 w-5" />;
      case 'video':
        return <Play className="h-5 w-5" />;
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'text':
        return <FileText className="h-5 w-5" />;
      case 'interactive_widget':
        return <Monitor className="h-5 w-5" />;
      case 'iframe':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Play className="h-5 w-5" />;
    }
  };

  const getActionText = () => {
    if (!topicContent) return 'Start Learning';

    const contentType = topicContent.contentType?.toLowerCase();
    switch (contentType) {
      case 'external_link':
        return 'Open Link';
      case 'video':
        return 'Play Video';
      case 'pdf':
        return 'View PDF';
      case 'text':
        return 'Read Content';
      case 'interactive_widget':
        return 'Start Activity';
      case 'iframe':
        return 'Start Activity';
      default:
        return 'Start Learning';
    }
  };

  const completedNow = hasCompleted || isCompleted;
  const nextEnabled = Boolean(onNext) && (isDemo ? true : canGoNext);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="!fixed !inset-0 !w-screen !h-screen !max-w-none !max-h-none !p-0 !m-0 !gap-0 !border-0 !bg-black !translate-x-0 !translate-y-0 !left-0 !top-0 !flex flex-col overflow-hidden !rounded-none [&>button]:hidden">
        <DialogTitle className="sr-only">{topic.name}</DialogTitle>

        <div className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 flex items-center justify-between gap-3 border-b border-gray-700">
          <div className="flex items-center gap-2 text-white text-sm min-w-0 flex-1">
            <div className="flex-shrink-0">{getContentIcon()}</div>
            <div className="min-w-0">
              <span className="truncate font-medium block">{topic.name}</span>
              {requiresPass && (
                <span className="text-[11px] text-gray-400">
                  Pass {masteryScore}% to complete this topic
                  {mastery?.attemptCount ? ` · Attempts ${mastery.attemptCount}` : ''}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {lastResult && !lastResult.passed && lastResult.canRetry && (
              <Button
                onClick={handleRetry}
                size="sm"
                className="gap-1 text-white text-xs sm:text-sm px-3 py-1.5 h-8 bg-amber-600 hover:bg-amber-700"
                aria-label="Retry"
              >
                <RotateCcw className="h-4 w-4 sm:hidden" aria-hidden="true" />
                <span className="hidden sm:inline">Retry</span>
              </Button>
            )}

            {showManualComplete &&
              (completedNow && onIncomplete ? (
                <Button
                  onClick={handleIncomplete}
                  size="sm"
                  className="gap-1 text-white text-xs sm:text-sm px-3 py-1.5 bg-orange-600 hover:bg-orange-700 h-8"
                  aria-label="Mark Incomplete"
                >
                  <RotateCcw className="h-4 w-4 sm:hidden" aria-hidden="true" />
                  <span className="hidden sm:inline">Mark Incomplete</span>
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  size="sm"
                  disabled={completedNow}
                  className={`gap-1 text-white text-xs sm:text-sm px-3 py-1.5 h-8 ${
                    completedNow
                      ? 'bg-gray-600 cursor-not-allowed opacity-50'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  aria-label={completedNow ? 'Completed' : 'Complete'}
                >
                  <Check className="h-4 w-4 sm:hidden" aria-hidden="true" />
                  <span className="hidden sm:inline">
                    {completedNow ? 'Completed' : 'Complete'}
                  </span>
                </Button>
              ))}

            {requiresPass && completedNow && (
              <Button
                size="sm"
                disabled
                className="gap-1 text-white text-xs sm:text-sm px-3 py-1.5 h-8 bg-gray-600 cursor-not-allowed opacity-50"
                aria-label="Passed"
              >
                <Check className="h-4 w-4 sm:hidden" aria-hidden="true" />
                <span className="hidden sm:inline">Passed</span>
              </Button>
            )}

            {onNext && (
              <Button
                onClick={onNext}
                size="sm"
                disabled={!nextEnabled && !(isDemo && isDemoLimitReached)}
                className={`gap-1 text-white text-xs sm:text-sm px-3 py-1.5 h-8 ${
                  isDemo && isDemoLimitReached
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : nextEnabled
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-600 cursor-not-allowed opacity-50'
                }`}
                title={
                  isDemo && isDemoLimitReached
                    ? 'Upgrade to access more content'
                    : nextEnabled
                      ? 'Play the next topic'
                      : 'No more topics in this unit'
                }
                aria-label={isDemo && isDemoLimitReached ? 'Upgrade' : 'Play Next'}
              >
                <ArrowRight className="h-4 w-4 sm:hidden" aria-hidden="true" />
                <span className="hidden sm:inline">
                  {isDemo && isDemoLimitReached ? 'Upgrade' : 'Play Next'}
                </span>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onClose}
              size="sm"
              className="border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white text-xs sm:text-sm px-3 py-1.5 h-8"
              aria-label="Close"
            >
              <X className="h-4 w-4 sm:hidden" aria-hidden="true" />
              <span className="hidden sm:inline">Close</span>
            </Button>
          </div>
        </div>

        {lastResult && (
          <div
            className={`flex-shrink-0 px-4 py-2 text-sm ${
              lastResult.passed
                ? 'bg-emerald-900/80 text-emerald-100'
                : 'bg-rose-900/80 text-rose-100'
            }`}
          >
            {lastResult.passed
              ? `Passed with ${Math.round(lastResult.percent)}%`
              : `Scored ${Math.round(lastResult.percent)}% — retry to reach ${masteryScore}%`}
          </div>
        )}

        <div className="flex-1 overflow-hidden relative bg-black">
          <div className="absolute inset-0 w-full h-full bg-black">
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
                {topicContent.videoUrl.includes('youtube.com') ||
                topicContent.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={topicContent.videoUrl
                      .replace('watch?v=', 'embed/')
                      .replace('youtu.be/', 'youtube.com/embed/')}
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
            ) : (topicContent?.contentType?.toLowerCase() === 'iframe' ||
                topicContent?.contentType === 'IFRAME') &&
              topicContent.iframeHtml ? (
              <IframeHtmlPlayer
                html={topicContent.iframeHtml}
                title={topic?.name || 'Activity'}
                reloadKey={iframeReloadKey}
              />
            ) : contentError ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8">
                <div className="mb-4 p-3 sm:p-4 bg-gray-800 rounded-full">
                  <FileText className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-2 text-white">{topic?.name}</h3>
                <p className="text-sm sm:text-base text-red-300 mb-4">{contentError}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8">
                <div className="mb-4 p-3 sm:p-4 bg-gray-800 rounded-full">{getContentIcon()}</div>
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
