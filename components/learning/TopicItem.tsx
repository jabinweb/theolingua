'use client';

import { Play, CheckCircle, Video, FileText, Headphones, BookOpen, Lock } from 'lucide-react';
import { type DbTopic } from '@/hooks/useProgramData';

const getTopicIcon = (contentType: string | undefined) => {
  switch (contentType) {
    case 'VIDEO': return <Video className="h-4 w-4" />;
    case 'EXTERNAL_LINK': return <Play className="h-4 w-4" />;
    case 'PDF': return <FileText className="h-4 w-4" />;
    case 'TEXT': return <FileText className="h-4 w-4" />;
    case 'INTRACTIVE_WIGET': return <Play className="h-4 w-4" />;
    case 'AUDIO': return <Headphones className="h-4 w-4" />;
    default: return <BookOpen className="h-4 w-4" />;
  }
};

interface TopicItemProps {
  topic: DbTopic;
  isCompleted: boolean;
  isDisabled?: boolean;
  accentColor?: string;
  onClick: (topic: DbTopic) => void;
  onLockedClick?: () => void;
}

export function TopicItem({ 
  topic, 
  isCompleted, 
  isDisabled = false,
  accentColor: _accentColor = 'from-blue-500 to-blue-600',
  onClick,
  onLockedClick
}: TopicItemProps) {
  const contentType = topic.content?.contentType;
  
  const handleClick = () => {
    if (isDisabled && onLockedClick) {
      onLockedClick();
    } else if (!isDisabled) {
      onClick(topic);
    }
  };

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        isDisabled 
          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-pointer' 
          : isCompleted 
            ? 'border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer' 
            : 'border-gray-200 bg-white hover:border-theo-yellow/50 hover:bg-gray-50 cursor-pointer'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2.5">
        <div className={`rounded-md p-1.5 ${
          isDisabled 
            ? 'bg-gray-200' 
            : isCompleted 
              ? 'bg-green-100' 
              : 'bg-theo-yellow/20'
        }`}>
          {isDisabled ? <Lock className="h-3.5 w-3.5 text-gray-500" /> : getTopicIcon(contentType)}
        </div>
        <div className="min-w-0 flex-1">
          <div className={`truncate text-sm font-medium ${isDisabled ? 'text-gray-500' : 'text-gray-800'}`}>
            {topic.name}
          </div>
        </div>
        {isDisabled ? (
          <Lock className="h-4 w-4 shrink-0 text-gray-400" />
        ) : isCompleted ? (
          <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
        ) : (
          <Play className="h-4 w-4 shrink-0 text-gray-400" />
        )}
      </div>
    </div>
  );
}