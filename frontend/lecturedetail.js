import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Calendar, Clock, Sparkles, BookOpen, FileText, Lightbulb, GraduationCap, Trash2 } from 'lucide-react';
import AudioPlayer from '../components/lectures/AudioPlayer';
import FlashcardViewer from '../components/study/FlashcardViewer';
import QuizViewer from '../components/study/QuizViewer';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function LectureDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const lectureId = urlParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: lecture, isLoading: lectureLoading } = useQuery({
    queryKey: ['lecture', lectureId],
    queryFn: async () => {
      const lectures = await base44.entities.Lecture.filter({ id: lectureId });
      return lectures[0];
    },
    enabled: !!lectureId
  });

  const { data: flashcards = [] } = useQuery({
    queryKey: ['flashcards', lectureId],
    queryFn: () => base44.entities.Flashcard.filter({ lecture_id: lectureId }),
    enabled: !!lectureId
  });

  const { data: quizQuestions = [] } = useQuery({
    queryKey: ['quiz', lectureId],
    queryFn: () => base44.entities.QuizQuestion.filter({ lecture_id: lectureId }),
    enabled: !!lectureId
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Delete associated flashcards
      await Promise.all(
        flashcards.map(fc => base44.entities.Flashcard.delete(fc.id))
      );
      
      // Delete associated quiz questions
      await Promise.all(
        quizQuestions.map(q => base44.entities.QuizQuestion.delete(q.id))
      );
      
      // Delete the lecture
      await base44.entities.Lecture.delete(lectureId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lectures']);
      navigate(createPageUrl('Dashboard'));
    }
  });

  if (lectureLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading lecture...</p>
        </div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Lecture not found</p>
          <Link to={createPageUrl('Dashboard')}>
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins % 60}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link to={createPageUrl('Dashboard')}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-3">
                {lecture.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(lecture.date), 'MMMM d, yyyy')}</span>
                </div>
                {lecture.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(lecture.duration)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lecture.category && (
                <Badge className="text-base px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200">
                  {lecture.category}
                </Badge>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {lecture.summary && (
            <p className="text-lg text-slate-700 leading-relaxed">
              {lecture.summary}
            </p>
          )}
        </div>

        {/* Audio Player */}
        {lecture.audio_url && (
          <div className="mb-8">
            <AudioPlayer audioUrl={lecture.audio_url} timestamps={lecture.key_points} />
          </div>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-slate-200 p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-100 data-[state=active]:to-blue-100">
              Overview
            </TabsTrigger>
            <TabsTrigger value="transcription">
              Transcription
            </TabsTrigger>
            <TabsTrigger value="keypoints">
              Key Points
            </TabsTrigger>
            <TabsTrigger value="flashcards">
              Flashcards
            </TabsTrigger>
            <TabsTrigger value="quiz">
              Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Key Points Preview */}
              {lecture.key_points && lecture.key_points.length > 0 && (
                <Card className="shadow-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      Key Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {lecture.key_points.slice(0, 5).map((kp, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={cn(
                            "h-2 w-2 rounded-full mt-2",
                            kp.importance === 'high' ? 'bg-red-500' :
                            kp.importance === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          )} />
                          <div className="flex-1">
                            <p className="text-sm text-slate-800">{kp.point}</p>
                            {kp.timestamp && (
                              <p className="text-xs text-slate-500 mt-1">{kp.timestamp}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Exam Hints */}
              {lecture.exam_hints && lecture.exam_hints.length > 0 && (
                <Card className="shadow-sm border-amber-200 bg-amber-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-amber-600" />
                      Exam Hints
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {lecture.exam_hints.map((hint, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-amber-200">
                          <p className="text-sm text-slate-800 font-medium">{hint.hint}</p>
                          {hint.timestamp && (
                            <p className="text-xs text-amber-600 mt-1 font-medium">{hint.timestamp}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Study Tools Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-sm border-slate-200 bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Flashcards Generated</p>
                      <p className="text-3xl font-bold text-slate-900">{flashcards.length}</p>
                    </div>
                    <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Lightbulb className="h-7 w-7 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Quiz Questions</p>
                      <p className="text-3xl font-bold text-slate-900">{quizQuestions.length}</p>
                    </div>
                    <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <GraduationCap className="h-7 w-7 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transcription">
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Full Transcription
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lecture.transcription ? (
                  <div className="prose max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {lecture.transcription}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">
                    Transcription is being processed...
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keypoints">
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  All Key Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lecture.key_points && lecture.key_points.length > 0 ? (
                  <div className="space-y-4">
                    {lecture.key_points.map((kp, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-start gap-4">
                          <Badge className={cn(
                            kp.importance === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                            kp.importance === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-blue-100 text-blue-700 border-blue-200'
                          )}>
                            {kp.importance}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-slate-800 mb-2">{kp.point}</p>
                            {kp.timestamp && (
                              <p className="text-sm text-slate-500 font-mono">{kp.timestamp}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">
                    No key points identified yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flashcards">
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                  Study Flashcards
                </CardTitle>
              </CardHeader>
              <CardContent className="py-8">
                <FlashcardViewer flashcards={flashcards} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Practice Quiz
                </CardTitle>
              </CardHeader>
              <CardContent className="py-8">
                <QuizViewer questions={quizQuestions} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Lecture</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{lecture.title}"? This will also delete all associated flashcards and quiz questions. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate()}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}