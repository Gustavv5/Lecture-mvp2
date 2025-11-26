import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileAudio, Sparkles, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

const categoryColors = {
  Sociology: "bg-purple-100 text-purple-700 border-purple-200",
  Science: "bg-blue-100 text-blue-700 border-blue-200",
  Mathematics: "bg-green-100 text-green-700 border-green-200",
  History: "bg-amber-100 text-amber-700 border-amber-200",
  Literature: "bg-pink-100 text-pink-700 border-pink-200",
  Business: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Psychology: "bg-violet-100 text-violet-700 border-violet-200",
  Engineering: "bg-cyan-100 text-cyan-700 border-cyan-200",
  Arts: "bg-rose-100 text-rose-700 border-rose-200",
  default: "bg-slate-100 text-slate-700 border-slate-200"
};

export default function LectureCard({ lecture, onClick }) {
  const categoryColor = categoryColors[lecture.category] || categoryColors.default;
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins % 60}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden"
      onClick={onClick}
    >
      <div className="h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500" />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-1">
              {lecture.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(lecture.date), 'MMM d, yyyy')}</span>
              {lecture.duration && (
                <>
                  <span>•</span>
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(lecture.duration)}</span>
                </>
              )}
            </div>
          </div>
          {lecture.category && (
            <Badge className={cn("border", categoryColor)}>
              {lecture.category}
            </Badge>
          )}
        </div>

        {lecture.summary && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-4">
            {lecture.summary}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-500">
          {lecture.key_points?.length > 0 && (
            <div className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{lecture.key_points.length} key points</span>
            </div>
          )}
          {lecture.exam_hints?.length > 0 && (
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-amber-600 font-medium">{lecture.exam_hints.length} exam hints</span>
            </div>
          )}
          {lecture.processing_status === 'processing' && (
            <div className="flex items-center gap-1 text-blue-600">
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
              <span>Processing...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}