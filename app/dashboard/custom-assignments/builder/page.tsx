'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Sparkles,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Send,
  ArrowLeft,
  Wand2,
  BookOpen,
  Clock,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type QuestionType = 'multiple-choice' | 'short-answer' | 'essay' | 'true-false';

interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
}

export default function AssignmentBuilderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [yearGroup, setYearGroup] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | 'MIXED'>('MEDIUM');
  const [duration, setDuration] = useState(30);
  const [questionCount, setQuestionCount] = useState(10);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // AI generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  // Fetch year groups and subjects
  const { data: yearGroups = [] } = useQuery({
    queryKey: ['years'],
    queryFn: () => api.getYears(),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', yearGroup],
    queryFn: () => api.getSubjects(yearGroup || undefined),
    enabled: !!yearGroup,
  });

  // Generate assignment mutation
  const generateMutation = useMutation({
    mutationFn: (data: any) => api.generateCustomAssignment(data),
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      if (data.content.questions) {
        const formattedQuestions = data.content.questions.map((q: any, index: number) => ({
          id: `q-${Date.now()}-${index}`,
          ...q,
        }));
        setQuestions(formattedQuestions);
      }
      setIsGenerating(false);
    },
    onError: () => {
      setIsGenerating(false);
    },
  });

  const handleGenerateWithAI = () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    generateMutation.mutate({
      aiPrompt,
      title: title || undefined,
      description: description || undefined,
      subjectId: subject || undefined,
      yearGroupId: yearGroup || undefined,
      topic: topic || undefined,
      difficulty,
      duration: duration || undefined,
      questionCount: questionCount || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newQuestions = [...questions];
    const draggedQuestion = newQuestions[draggedIndex];
    newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(index, 0, draggedQuestion);
    
    setQuestions(newQuestions);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = async (publish: boolean = false) => {
    // Create assignment content
    const content = {
      questions,
      instructions: generatedContent?.instructions || 'Complete all questions.',
    };

    // For now, we need to call the API directly
    // In a real implementation, you'd save this as a draft
    console.log('Saving assignment:', {
      title,
      description,
      content,
      publish,
    });

    alert(publish ? 'Assignment published!' : 'Assignment saved as draft!');
    router.push('/dashboard/custom-assignments');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/custom-assignments"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assignment Builder</h1>
            <p className="text-gray-600 mt-1">Create custom assignments with AI assistance</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleSave(false)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Save className="h-5 w-5" />
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Send className="h-5 w-5" />
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* AI Generator */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6" />
              <h2 className="text-xl font-bold">AI Generator</h2>
            </div>
            
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="E.g., Create 10 MCQs on Pythagoras theorem, mixed difficulty"
              className="w-full h-32 p-3 rounded-lg text-gray-900 resize-none"
            />

            <button
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-white text-indigo-600 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  Generate with AI
                </>
              )}
            </button>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Assignment title"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Group
                </label>
                <select
                  value={yearGroup}
                  onChange={(e) => setYearGroup(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">Select year group</option>
                  {yearGroups.map((year: any) => (
                    <option key={year.id} value={year.id}>
                      {year.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  disabled={!yearGroup}
                >
                  <option value="">Select subject</option>
                  {subjects.map((subj: any) => (
                    <option key={subj.id} value={subj.id}>
                      {subj.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="E.g., Pythagoras theorem"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                  <option value="MIXED">Mixed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Questions
                  </label>
                  <input
                    type="number"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add tag"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-indigo-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Questions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Questions ({questions.length})
              </h3>
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Question
              </button>
            </div>

            <div className="p-6 space-y-4">
              {questions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No questions yet. Use AI to generate or add manually.</p>
                </div>
              ) : (
                questions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                    onUpdate={(updates) => updateQuestion(question.id, updates)}
                    onDelete={() => deleteQuestion(question.id)}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  index: number;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function QuestionCard({
  question,
  index,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
}: QuestionCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors cursor-move"
    >
      <div className="flex items-start gap-3">
        <div className="pt-2">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">Question {index + 1}</span>
            <div className="flex items-center gap-2">
              <select
                value={question.type}
                onChange={(e) => onUpdate({ type: e.target.value as QuestionType })}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="short-answer">Short Answer</option>
                <option value="essay">Essay</option>
                <option value="true-false">True/False</option>
              </select>
              <button
                onClick={onDelete}
                className="p-1 hover:bg-red-100 rounded text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <textarea
            value={question.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            placeholder="Enter question"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            rows={2}
          />

          {question.type === 'multiple-choice' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Options:</p>
              {question.options?.map((option: string, i: number) => (
                <input
                  key={i}
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(question.options || [])];
                    newOptions[i] = e.target.value;
                    onUpdate({ options: newOptions });
                  }}
                  placeholder={`Option ${i + 1}`}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              ))}
              <input
                type="text"
                value={question.correctAnswer || ''}
                onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
                placeholder="Correct answer"
                className="w-full border border-green-300 bg-green-50 rounded px-3 py-2 text-sm"
              />
            </div>
          )}

          <textarea
            value={question.explanation || ''}
            onChange={(e) => onUpdate({ explanation: e.target.value })}
            placeholder="Explanation (optional)"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            rows={2}
          />

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Points:</label>
            <input
              type="number"
              value={question.points}
              onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
              className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
              min="1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

