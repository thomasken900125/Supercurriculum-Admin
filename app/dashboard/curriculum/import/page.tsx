'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function CurriculumImportPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'csv' | 'json' | 'ai'>('csv');
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [jsonContent, setJsonContent] = useState('');
  const [aiDocument, setAIDocument] = useState('');
  const [aiFilters, setAIFilters] = useState({
    yearGroupId: '',
    subjectId: '',
    keyStage: 'KS3',
  });
  const [importResult, setImportResult] = useState<any>(null);

  const { data: years } = useQuery({
    queryKey: ['years'],
    queryFn: () => api.getYears(),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.getSubjects(),
  });

  const csvImportMutation = useMutation({
    mutationFn: (file: File) => api.importTopicsCSV(file),
    onSuccess: (data) => {
      setImportResult(data);
      queryClient.invalidateQueries({ queryKey: ['curriculum-topics'] });
      queryClient.invalidateQueries({ queryKey: ['curriculum-coverage'] });
      setCSVFile(null);
    },
  });

  const jsonImportMutation = useMutation({
    mutationFn: (topics: any[]) => api.importTopicsJSON(topics),
    onSuccess: (data) => {
      setImportResult(data);
      queryClient.invalidateQueries({ queryKey: ['curriculum-topics'] });
      queryClient.invalidateQueries({ queryKey: ['curriculum-coverage'] });
      setJsonContent('');
    },
  });

  const aiParseMutation = useMutation({
    mutationFn: (data: any) => api.parseNCDocument(data),
    onSuccess: (data) => {
      setImportResult(data);
    },
  });

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCSVFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleCSVImport = () => {
    if (csvFile) {
      csvImportMutation.mutate(csvFile);
    }
  };

  const handleJSONImport = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      jsonImportMutation.mutate(parsed.topics || parsed);
    } catch (error) {
      alert('Invalid JSON format. Please check your JSON and try again.');
    }
  };

  const handleAIParse = () => {
    aiParseMutation.mutate({
      documentText: aiDocument,
      ...aiFilters,
    });
  };

  const handleImportParsedTopics = () => {
    if (importResult?.topics) {
      jsonImportMutation.mutate(importResult.topics);
    }
  };

  const downloadTemplate = () => {
    const csv = `topicName,yearGroupId,subjectId,keyStage,nationalCurriculumRef,coreContent,extendedContent,learningObjectives,keySkills,priorKnowledge
"Photosynthesis","year-7-id","science-id","KS3","NC-KS3-SCI-02","Plants make food using light energy","Advanced cellular processes","Understand photosynthesis|Identify reactants and products","Scientific investigation|Data analysis","Plant structure|Basic chemistry"`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'curriculum_import_template.csv';
    a.click();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Import Curriculum Data</h1>
        <p className="text-gray-500 mt-1">Bulk import curriculum topics from multiple sources</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('csv')}
            className={`${
              activeTab === 'csv'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <FileText className="h-5 w-5" />
            CSV Import
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`${
              activeTab === 'json'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <FileText className="h-5 w-5" />
            JSON Import
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`${
              activeTab === 'ai'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <Upload className="h-5 w-5" />
            AI Parser
          </button>
        </nav>
      </div>

      {/* CSV Import Tab */}
      {activeTab === 'csv' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">CSV Bulk Import</h2>
          
          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Download className="h-5 w-5" />
              Download CSV Template
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Download a template with the correct format and example data
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV files only</p>
              </div>
            </div>
            {csvFile && (
              <p className="mt-2 text-sm text-gray-600">Selected: {csvFile.name}</p>
            )}
          </div>

          <button
            onClick={handleCSVImport}
            disabled={!csvFile || csvImportMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
          >
            {csvImportMutation.isPending ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Import CSV
              </>
            )}
          </button>
        </div>
      )}

      {/* JSON Import Tab */}
      {activeTab === 'json' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">JSON Bulk Import</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste JSON Data
            </label>
            <textarea
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              rows={15}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              placeholder={`{
  "topics": [
    {
      "topicName": "Photosynthesis",
      "yearGroupId": "year-7-id",
      "subjectId": "science-id",
      "keyStage": "KS3",
      "learningObjectives": ["Understand photosynthesis"],
      "keySkills": ["Scientific investigation"],
      "priorKnowledge": ["Plant structure"]
    }
  ]
}`}
            />
          </div>

          <button
            onClick={handleJSONImport}
            disabled={!jsonContent || jsonImportMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
          >
            {jsonImportMutation.isPending ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Import JSON
              </>
            )}
          </button>
        </div>
      )}

      {/* AI Parser Tab */}
      {activeTab === 'ai' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered NC Parser</h2>
          <p className="text-gray-600 mb-6">
            Paste National Curriculum documents and let AI extract curriculum topics automatically
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year Group (Optional)</label>
              <select
                value={aiFilters.yearGroupId}
                onChange={(e) => setAIFilters({ ...aiFilters, yearGroupId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Auto-detect</option>
                {years?.map((year: any) => (
                  <option key={year.id} value={year.id}>{year.displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject (Optional)</label>
              <select
                value={aiFilters.subjectId}
                onChange={(e) => setAIFilters({ ...aiFilters, subjectId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Auto-detect</option>
                {subjects?.map((subject: any) => (
                  <option key={subject.id} value={subject.id}>{subject.displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Key Stage</label>
              <select
                value={aiFilters.keyStage}
                onChange={(e) => setAIFilters({ ...aiFilters, keyStage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="KS2">KS2</option>
                <option value="KS3">KS3</option>
                <option value="KS4">KS4</option>
                <option value="KS5">KS5</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste NC Document Text
            </label>
            <textarea
              value={aiDocument}
              onChange={(e) => setAIDocument(e.target.value)}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Paste National Curriculum document here..."
            />
          </div>

          <button
            onClick={handleAIParse}
            disabled={!aiDocument || aiParseMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 mb-4"
          >
            {aiParseMutation.isPending ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Parsing with AI...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Parse Document
              </>
            )}
          </button>

          {importResult?.topics && importResult.topics.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                ✓ Extracted {importResult.topics.length} topics
              </h3>
              <button
                onClick={handleImportParsedTopics}
                disabled={jsonImportMutation.isPending}
                className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Import These Topics
              </button>
            </div>
          )}
        </div>
      )}

      {/* Import Results */}
      {importResult && (importResult.success !== undefined || importResult.failed !== undefined) && (
        <div className={`mt-6 p-6 rounded-lg border ${
          importResult.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-3">
            {importResult.failed === 0 ? (
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Import Results</h3>
              <div className="space-y-1 text-sm">
                <p className="text-green-700">✓ Successfully imported: {importResult.success} topics</p>
                {importResult.failed > 0 && (
                  <p className="text-red-700">✗ Failed: {importResult.failed} topics</p>
                )}
                {importResult.errors && importResult.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-gray-700 font-medium">View Errors</summary>
                    <ul className="mt-2 space-y-1 text-red-600">
                      {importResult.errors.map((error: string, i: number) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

