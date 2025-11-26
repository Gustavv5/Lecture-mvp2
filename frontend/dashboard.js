import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Calendar as CalendarIcon, LayoutGrid, BookOpen } from 'lucide-react';
import LectureCard from '../components/lectures/LectureCard';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: lectures = [], isLoading } = useQuery({
    queryKey: ['lectures'],
    queryFn: () => base44.entities.Lecture.list('-created_date', 100),
  });

  const filteredLectures = lectures.filter(lecture => {
    const matchesSearch = 
      lecture.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecture.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecture.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (viewMode === 'calendar') {
      return matchesSearch && lecture.date && isSameMonth(new Date(lecture.date), selectedDate);
    }
    
    return matchesSearch;
  });

  const getLecturesForDate = (date) => {
    return lectures.filter(lecture => 
      lecture.date && isSameDay(new Date(lecture.date), date)
    );
  };

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const recentLectures = lectures.slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Lecture Library
          </h1>
          <p className="text-slate-600">
            AI-powered transcription and study tools for your lectures
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Lectures</p>
                <p className="text-3xl font-bold text-slate-900">{lectures.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">This Month</p>
                <p className="text-3xl font-bold text-slate-900">
                  {lectures.filter(l => l.date && isSameMonth(new Date(l.date), new Date())).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <Link to={createPageUrl('Upload')}>
            <Button 
              size="lg" 
              className="w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Lecture
            </Button>
          </Link>
        </div>

        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search lectures by title, category, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 border-slate-200 bg-white rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              onClick={() => setViewMode('calendar')}
              className={viewMode === 'calendar' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar
            </Button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
              ))
            ) : filteredLectures.length > 0 ? (
              filteredLectures.map(lecture => (
                <Link key={lecture.id} to={createPageUrl('LectureDetail') + '?id=' + lecture.id}>
                  <LectureCard lecture={lecture} />
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-500">No lectures found. Upload your first lecture to get started!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {format(selectedDate, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                >
                  Next
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for days before month starts */}
              {Array(monthStart.getDay()).fill(0).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {daysInMonth.map(day => {
                const dayLectures = getLecturesForDate(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "aspect-square border rounded-lg p-2 hover:bg-slate-50 transition-colors",
                      isToday && "border-purple-500 bg-purple-50",
                      dayLectures.length > 0 && "border-blue-300"
                    )}
                  >
                    <div className="text-sm font-medium text-slate-700 mb-1">
                      {format(day, 'd')}
                    </div>
                    {dayLectures.length > 0 && (
                      <div className="space-y-1">
                        {dayLectures.slice(0, 2).map(lecture => (
                          <Link
                            key={lecture.id}
                            to={createPageUrl('LectureDetail') + '?id=' + lecture.id}
                          >
                            <div className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 rounded px-1 py-0.5 truncate hover:shadow-sm">
                              {lecture.title}
                            </div>
                          </Link>
                        ))}
                        {dayLectures.length > 2 && (
                          <div className="text-xs text-slate-500">+{dayLectures.length - 2} more</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}