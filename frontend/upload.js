import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload as UploadIcon, Mic, FileAudio, Loader2, ArrowLeft } from 'lucide-react';
import AudioRecorder from '../components/lectures/AudioRecorder';
import { Link } from 'react-router-dom';

export default function Upload() {
  const [mode, setMode] = useState(null); // 'record' or 'upload'
  const [audioFile, setAudioFile] = useState(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleAudioRecorded = (file) => {
    setAudioFile(file);
    if (!title) {
      setTitle(`Lecture ${new Date().toLocaleDateString()}`);
    }
  };

  const processLecture = async () => {
    if (!audioFile || !title) return;

    setIsProcessing(true);
    let lectureId = null;

    try {
      // Upload audio file
      const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFile });

      // Create initial lecture record
      const lecture = await base44.entities.Lecture.create({
        title,
        date,
        audio_url: file_url,
        processing_status: 'uploading'
      });
      lectureId = lecture.id;

      // Update to processing
      await base44.entities.Lecture.update(lectureId, {
        processing_status: 'processing'
      });

      // Process with AI - simpler approach with better error handling
      const analysisPrompt = `Transcribe this lecture audio file completely and provide:
1. Full word-for-word transcription of everything said
2. A 2-3 sentence summary
3. Academic category (Sociology, Science, Mathematics, History, Literature, Business, Psychology, Engineering, or Arts)
4. 5-8 key points with timestamps in MM:SS format and importance level (high/medium/normal)
5. Any exam hints mentioned with timestamps

Format as JSON.`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            transcription: { type: "string" },
            summary: { type: "string" },
            category: { type: "string" },
            key_points: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  point: { type: "string" },
                  timestamp: { type: "string" },
                  importance: { type: "string" }
                }
              }
            },
            exam_hints: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  hint: { type: "string" },
                  timestamp: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Validate analysis has transcription
      if (!analysis.transcription || analysis.transcription.length < 10) {
        throw new Error('Transcription failed - audio may be empty or format not supported');
      }

      // Update lecture with analysis
      await base44.entities.Lecture.update(lecture.id, {
        transcription: analysis.transcription,
        summary: analysis.summary || "No summary available",
        category: analysis.category || "General",
        key_points: analysis.key_points || [],
        exam_hints: analysis.exam_hints || [],
        processing_status: 'completed'
      });

      // Generate flashcards in background (non-blocking)
      if (analysis.transcription && analysis.transcription.length > 50) {
        base44.integrations.Core.InvokeLLM({
          prompt: `Create 8 flashcards from this lecture. Return as JSON with flashcards array containing question, answer, and difficulty (easy/medium/hard) fields:\n\n${analysis.transcription.substring(0, 3000)}`,
          response_json_schema: {
            type: "object",
            properties: {
              flashcards: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    answer: { type: "string" },
                    difficulty: { type: "string" }
                  }
                }
              }
            }
          }
        }).then(flashcardsData => {
          if (flashcardsData.flashcards && flashcardsData.flashcards.length > 0) {
            base44.entities.Flashcard.bulkCreate(
              flashcardsData.flashcards.map(fc => ({
                lecture_id: lecture.id,
                question: fc.question,
                answer: fc.answer,
                difficulty: fc.difficulty || 'medium',
                category: analysis.category
              }))
            );
          }
        }).catch(err => console.log('Flashcard generation skipped'));

        // Generate quiz questions in background (non-blocking)
        base44.integrations.Core.InvokeLLM({
          prompt: `Create 6 multiple choice questions from this lecture. Return as JSON with questions array containing question, options (array of 4), correct_answer, and explanation fields:\n\n${analysis.transcription.substring(0, 3000)}`,
          response_json_schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    correct_answer: { type: "string" },
                    explanation: { type: "string" }
                  }
                }
              }
            }
          }
        }).then(quizData => {
          if (quizData.questions && quizData.questions.length > 0) {
            base44.entities.QuizQuestion.bulkCreate(
              quizData.questions.map(q => ({
                lecture_id: lecture.id,
                question: q.question,
                options: q.options,
                correct_answer: q.correct_answer,
                explanation: q.explanation,
                category: analysis.category
              }))
            );
          }
        }).catch(err => console.log('Quiz generation skipped'));
      }

      queryClient.invalidateQueries(['lectures']);
      navigate(createPageUrl('LectureDetail') + '?id=' + lecture.id);
    } catch (error) {
      console.error('Error processing lecture:', error);
      
      // Update lecture status to failed if it was created
      if (lectureId) {
        try {
          await base44.entities.Lecture.update(lectureId, {
            processing_status: 'failed',
            transcription: 'Processing failed: ' + (error.message || 'Unknown error')
          });
        } catch (updateError) {
          console.error('Failed to update lecture status:', updateError);
        }
      }
      
      const errorMsg = error.message || error.toString() || 'Unknown error';
      alert('Failed to process lecture: ' + errorMsg + '\n\nPlease try again with a different audio file or format.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link to={createPageUrl('Dashboard')}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Upload Lecture
          </h1>
          <p className="text-slate-600">
            Record or upload an audio file to get AI-powered transcription and study materials
          </p>
        </div>

        {!mode ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-purple-300"
              onClick={() => setMode('record')}
            >
              <CardContent className="p-12 text-center">
                <div className="h-20 w-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mic className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Record Audio
                </h3>
                <p className="text-slate-600">
                  Record your lecture directly in the browser
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-blue-300"
              onClick={() => setMode('upload')}
            >
              <CardContent className="p-12 text-center">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <UploadIcon className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Upload File
                </h3>
                <p className="text-slate-600">
                  Upload an existing audio file (any format)
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="p-8">
              {mode === 'record' && !audioFile && (
                <div className="py-12">
                  <AudioRecorder onAudioReady={handleAudioRecorded} />
                </div>
              )}

              {mode === 'upload' && !audioFile && (
                <div className="py-12">
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <div className="h-32 w-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                      <FileAudio className="h-16 w-16 text-blue-600" />
                    </div>
                    <p className="text-lg font-medium text-slate-900 mb-2">
                      Click to upload audio file
                    </p>
                    <p className="text-sm text-slate-500">
                      Supports MP3, WAV, M4A, and more
                    </p>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {audioFile && (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <FileAudio className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-900 font-medium">
                      {audioFile.name}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Lecture Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter lecture title"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAudioFile(null);
                        setMode(null);
                      }}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={processLecture}
                      disabled={!title || isProcessing}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Process Lecture
                        </>
                      )}
                    </Button>
                  </div>

                  {isProcessing && (
                    <div className="text-center text-sm text-slate-600 pt-4">
                      <p>AI is transcribing and analyzing your lecture...</p>
                      <p className="text-xs text-slate-500 mt-2">This may take 1-2 minutes</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}