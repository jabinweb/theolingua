'use client';

import { Play, Clock, CheckCircle, Video, FileText, Headphones, BookOpen, Lock } from 'lucide-react';
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
      className={`p-4 rounded-xl border-2 transition-all group ${
        isDisabled 
          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-pointer' 
          : isCompleted 
            ? 'border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer' 
            : 'border-blue-200 bg-blue-50 hover:border-blue-300 hover:shadow-md hover:bg-blue-100 cursor-pointer'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <div className={`p-2 rounded-lg ${
            isDisabled 
              ? 'bg-gray-200' 
              : isCompleted 
                ? 'bg-green-200' 
                : 'bg-blue-200 group-hover:bg-blue-300'
          }`}>
            {isDisabled ? <Lock className="h-4 w-4 text-gray-500" /> : getTopicIcon(contentType)}
          </div>
          <div className="flex-1">
            <div className={`font-medium text-sm ${isDisabled ? 'text-gray-500' : 'text-gray-700'}`}>
              {topic.name}
            </div>
          </div>
        </div>
        {isDisabled ? (
          <Lock className="h-5 w-5 text-gray-400" />
        ) : isCompleted ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
        )}
      </div>
      
      <h4 className="font-medium text-sm mb-2 line-clamp-2 text-muted-foreground">
        {topic.description || 'No description available'}
      </h4>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{topic.duration}</span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
          isDisabled 
            ? 'bg-gray-100 cursor-not-allowed' 
            : 'bg-blue-100 group-hover:bg-blue-200'
        }`}>
          {isDisabled ? (
            <Lock className="h-4 w-4 text-gray-500" />
          ) : (
            <Play className="h-4 w-4 text-blue-600 fill-blue-600" />
          )}
          <span className={`text-xs font-medium ${
            isDisabled ? 'text-gray-500' : 'text-blue-700'
          }`}>
            {isDisabled ? 'Locked' : 'Play'}
          </span>
        </div>
      </div>
    </div>
  );
}