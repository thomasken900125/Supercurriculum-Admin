'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  FileText,
  Upload,
  Play,
  Database,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  Loader2,
  FolderOpen,
  BookOpen,
  Users,
  Target,
  List,
} from 'lucide-react';

interface PdfFile {
  name: string;
  size: string;
  modified: string;
}

interface ExtractedData {
  keyStages: Array<{
    name: string;
    years: string[];
    description?: string;
  }>;
  subjects: Array<{
    name: string;
    keyStage: string;
    years: string[];
    description?: string;
    aims?: string[];
    skills: Array<{ name: string; description?: string }>;
    topics: Array<{
      name: string;
      year?: string;
      coreContent?: string;
      learningObjectives?: string[];
      keySkills?: string[];
    }>;
  }>;
}

interface AnalysisResult {
  success: boolean;
  fileName: string;
  extracted: {
    keyStagesCount: number;
    subjectsCount: number;
    totalSkills: number;
    totalTopics: number;
  };
  data: ExtractedData;
}

interface ImportResult {
  yearGroups: { created: number; existing: number };
  subjects: { created: number; existing: number };
  skills: { created: number; existing: number };
  topics: { created: number; existing: number };
  errors: string[];
}

export default function CurriculumPdfParserPage() {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'primary' | 'secondary' | 'full'>('full');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set());
  const [processingFile, setProcessingFile] = useState<string | null>(null);

  // Fetch available PDFs
  const { data: pdfData, isLoading: loadingPdfs, refetch: refetchPdfs } = useQuery({
    queryKey: ['available-pdfs'],
    queryFn: () => api.getAvailableCurriculumPdfs(),
  });

  // Upload and analyze mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.uploadCurriculumPdf(file, documentType, false),
    onSuccess: (data) => {
      setAnalysisResult(data);
      setImportResult(null);
    },
  });

  // Analyze existing PDF mutation
  const analyzeMutation = useMutation({
    mutationFn: ({ fileName, docType }: { fileName: string; docType: 'primary' | 'secondary' | 'full' }) => 
      api.analyzeCurriculumPdf(fileName, docType),
    onSuccess: (data) => {
      setAnalysisResult(data);
      setImportResult(null);
      setProcessingFile(null);
    },
    onError: () => {
      setProcessingFile(null);
    },
  });

  // Process all PDFs mutation
  const processAllMutation = useMutation({
    mutationFn: () => api.processAllCurriculumPdfs(),
    onSuccess: (data) => {
      setImportResult(data.results);
      queryClient.invalidateQueries({ queryKey: ['available-pdfs'] });
    },
  });

  // Import data mutation
  const importMutation = useMutation({
    mutationFn: (data: ExtractedData) => api.importCurriculumData(data),
    onSuccess: (data) => {
      setImportResult(data.result);
      queryClient.invalidateQueries({ queryKey: ['curriculum-coverage'] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setAnalysisResult(null);
      setImportResult(null);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleAnalyzeExisting = (fileName: string) => {
    setProcessingFile(fileName);
    setAnalysisResult(null);
    setImportResult(null);
    analyzeMutation.mutate({ fileName, docType: documentType });
  };

  const handleImport = () => {
    if (analysisResult?.data) {
      importMutation.mutate(analysisResult.data);
    }
  };

  const toggleSubjectExpand = (index: number) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSubjects(newExpanded);
  };

  const isProcessing = uploadMutation.isPending || analyzeMutation.isPending || processAllMutation.isPending || importMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Curriculum PDF Parser</h1>
          <p className="text-gray-500 mt-1">
            Upload and analyze National Curriculum PDFs to automatically create year groups, subjects, skills, and topics
          </p>
        </div>
        <button
          onClick={() => refetchPdfs()}
          disabled={loadingPdfs}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 ${loadingPdfs ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Processing Warning */}
      {isProcessing && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Loader2 className="h-5 w-5 text-amber-600 animate-spin mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Processing PDF</h3>
              <p className="text-sm text-amber-700 mt-1">
                This may take several minutes for large documents (300+ pages). Please do not close this page.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload New PDF */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-600" />
            Upload New PDF
          </h2>
          
          <div className="space-y-4">
            {/* Document Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as any)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="full">Full Curriculum (Primary + Secondary)</option>
                <option value="primary">Primary Only (KS1-KS2)</option>
                <option value="secondary">Secondary Only (KS3-KS4)</option>
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select PDF File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isProcessing}
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">Click to select a PDF file</p>
                      <p className="text-xs text-gray-400 mt-1">Max 50MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isProcessing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing PDF...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Analyze PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Available PDFs in pdfs/ folder */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-green-600" />
            PDFs in Server Folder
          </h2>

          {loadingPdfs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : pdfData?.files?.length > 0 ? (
            <div className="space-y-3">
              {pdfData.files.map((file: PdfFile) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAnalyzeExisting(file.name)}
                    disabled={isProcessing}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50"
                  >
                    {processingFile === file.name ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Analyze
                      </>
                    )}
                  </button>
                </div>
              ))}

              {/* Process All Button */}
              <button
                onClick={() => processAllMutation.mutate()}
                disabled={isProcessing}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
              >
                {processAllMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing All PDFs...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Process All PDFs & Import
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No PDF files found in the pdfs/ folder</p>
              <p className="text-sm mt-1">Place PDF files in the pdfs/ folder at the project root</p>
            </div>
          )}

          {pdfData?.directory && (
            <p className="text-xs text-gray-400 mt-4">
              Directory: {pdfData.directory}
            </p>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Analysis Results: {analysisResult.fileName}
            </h2>
            <button
              onClick={handleImport}
              disabled={importMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Import to Database
                </>
              )}
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              icon={BookOpen}
              label="Key Stages"
              value={analysisResult.extracted.keyStagesCount}
              color="bg-blue-500"
            />
            <SummaryCard
              icon={List}
              label="Subjects"
              value={analysisResult.extracted.subjectsCount}
              color="bg-green-500"
            />
            <SummaryCard
              icon={Target}
              label="Skills"
              value={analysisResult.extracted.totalSkills}
              color="bg-purple-500"
            />
            <SummaryCard
              icon={FileText}
              label="Topics"
              value={analysisResult.extracted.totalTopics}
              color="bg-orange-500"
            />
          </div>

          {/* Key Stages */}
          {analysisResult.data.keyStages.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Key Stages Found</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.data.keyStages.map((ks, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {ks.name} ({ks.years.join(', ')})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Subjects */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Subjects Found</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {analysisResult.data.subjects.map((subject, idx) => (
                <div key={idx} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSubjectExpand(idx)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{subject.name}</span>
                      <span className="text-xs text-gray-500">
                        {subject.keyStage} • {subject.skills.length} skills • {subject.topics.length} topics
                      </span>
                    </div>
                    {expandedSubjects.has(idx) ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedSubjects.has(idx) && (
                    <div className="p-3 border-t bg-white">
                      {subject.description && (
                        <p className="text-sm text-gray-600 mb-3">{subject.description}</p>
                      )}
                      
                      {subject.skills.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {subject.skills.map((skill, sIdx) => (
                              <span key={sIdx} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {subject.topics.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Topics:</p>
                          <div className="flex flex-wrap gap-1">
                            {subject.topics.slice(0, 10).map((topic, tIdx) => (
                              <span key={tIdx} className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">
                                {topic.name}
                              </span>
                            ))}
                            {subject.topics.length > 10 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                                +{subject.topics.length - 10} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            Import Results
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <ImportResultCard
              label="Year Groups"
              created={importResult.yearGroups.created}
              existing={importResult.yearGroups.existing}
            />
            <ImportResultCard
              label="Subjects"
              created={importResult.subjects.created}
              existing={importResult.subjects.existing}
            />
            <ImportResultCard
              label="Skills"
              created={importResult.skills.created}
              existing={importResult.skills.existing}
            />
            <ImportResultCard
              label="Topics"
              created={importResult.topics.created}
              existing={importResult.topics.existing}
            />
          </div>

          {importResult.errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4" />
                Errors ({importResult.errors.length})
              </h3>
              <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                {importResult.errors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {importResult.errors.length === 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                All data imported successfully!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {(uploadMutation.isError || analyzeMutation.isError || processAllMutation.isError || importMutation.isError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">
                {(uploadMutation.error as any)?.response?.data?.message ||
                  (analyzeMutation.error as any)?.response?.data?.message ||
                  (processAllMutation.error as any)?.response?.data?.message ||
                  (importMutation.error as any)?.response?.data?.message ||
                  'An error occurred while processing the PDF'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-3">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold mb-2">1</div>
            <div className="font-medium">Upload PDF</div>
            <div className="text-sm opacity-90">Upload a National Curriculum PDF or select from server folder</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold mb-2">2</div>
            <div className="font-medium">AI Analysis</div>
            <div className="text-sm opacity-90">GPT-4o extracts curriculum structure, subjects, skills & topics</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold mb-2">3</div>
            <div className="font-medium">Preview</div>
            <div className="text-sm opacity-90">Review extracted data before importing</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold mb-2">4</div>
            <div className="font-medium">Import</div>
            <div className="text-sm opacity-90">One-click import creates all database records</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
        <div className={`${color} rounded-lg p-2`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function ImportResultCard({ label, created, existing }: {
  label: string;
  created: number;
  existing: number;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-sm font-medium text-gray-900 mb-2">{label}</div>
      <div className="flex items-center gap-4">
        <div>
          <div className="text-lg font-bold text-green-600">+{created}</div>
          <div className="text-xs text-gray-500">Created</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-400">{existing}</div>
          <div className="text-xs text-gray-500">Existing</div>
        </div>
      </div>
    </div>
  );
}

