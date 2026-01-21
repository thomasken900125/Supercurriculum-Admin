// API Client for Admin Panel

import axios, { AxiosInstance } from 'axios';

class AdminApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        // Only access localStorage on client side
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('admin_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  // Year Groups
  async getYears() {
    const response = await this.client.get('/years');
    return response.data;
  }

  async getYearGroups() {
    const response = await this.client.get('/years');
    return response.data;
  }

  async createYear(data: any) {
    const response = await this.client.post('/years', data);
    return response.data;
  }

  async updateYear(id: string, data: any) {
    const response = await this.client.patch(`/years/${id}`, data);
    return response.data;
  }

  async deleteYear(id: string) {
    const response = await this.client.delete(`/years/${id}`);
    return response.data;
  }

  // Subjects
  async getSubjects(yearGroupId?: string) {
    const response = await this.client.get('/subjects', { params: { yearGroupId } });
    return response.data;
  }

  async createSubject(data: any) {
    const response = await this.client.post('/subjects', data);
    return response.data;
  }

  async updateSubject(id: string, data: any) {
    const response = await this.client.patch(`/subjects/${id}`, data);
    return response.data;
  }

  async deleteSubject(id: string) {
    const response = await this.client.delete(`/subjects/${id}`);
    return response.data;
  }

  // Skills
  async getSkills(subjectId?: string) {
    const response = await this.client.get('/skills', { params: { subjectId } });
    return response.data;
  }

  async createSkill(data: any) {
    const response = await this.client.post('/skills', data);
    return response.data;
  }

  async updateSkill(id: string, data: any) {
    const response = await this.client.patch(`/skills/${id}`, data);
    return response.data;
  }

  async deleteSkill(id: string) {
    const response = await this.client.delete(`/skills/${id}`);
    return response.data;
  }

  // Activities
  async getActivities(filters?: any) {
    const response = await this.client.get('/activities', { params: filters });
    return response.data;
  }

  // async createActivity(data: any) {
  //   const response = await this.client.post('/activities', data);
  //   return response.data;
  // }

  // async updateActivity(id: string, data: any) {
  //   const response = await this.client.patch(`/activities/${id}`, data);
  //   return response.data;
  // }

  // async deleteActivity(id: string) {
  //   const response = await this.client.delete(`/activities/${id}`);
  //   return response.data;
  // }

  // Feedback Tests
  async getFeedbackTests(filters?: any) {
    const response = await this.client.get('/feedback-tests', { params: filters });
    return response.data;
  }

  async createFeedbackTest(data: any) {
    const response = await this.client.post('/feedback-tests', data);
    return response.data;
  }

  async updateFeedbackTest(id: string, data: any) {
    const response = await this.client.patch(`/feedback-tests/${id}`, data);
    return response.data;
  }

  async deleteFeedbackTest(id: string) {
    const response = await this.client.delete(`/feedback-tests/${id}`);
    return response.data;
  }

  // Interventions
  async getInterventions(filters?: any) {
    const response = await this.client.get('/interventions', { params: filters });
    return response.data;
  }

  async createIntervention(data: any) {
    const response = await this.client.post('/interventions', data);
    return response.data;
  }

  async updateIntervention(id: string, data: any) {
    const response = await this.client.patch(`/interventions/${id}`, data);
    return response.data;
  }

  async deleteIntervention(id: string) {
    const response = await this.client.delete(`/interventions/${id}`);
    return response.data;
  }

  // Users
  async getUsers(role?: string) {
    const response = await this.client.get('/users', { params: { role } });
    return response.data;
  }

  async updateUser(id: string, data: any) {
    const response = await this.client.patch(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.client.delete(`/users/${id}`);
    return response.data;
  }

  // Teachers
  async getTeachers() {
    const response = await this.client.get('/users/teachers');
    return response.data;
  }

  async getTeacherProfile(id: string) {
    const response = await this.client.get(`/users/teachers/${id}/profile`);
    return response.data;
  }

  async createTeacher(data: any) {
    const response = await this.client.post('/users/teachers', data);
    return response.data;
  }

  async updateTeacher(id: string, data: any) {
    const response = await this.client.patch(`/users/teachers/${id}`, data);
    return response.data;
  }

  async deleteTeacher(id: string) {
    const response = await this.client.delete(`/users/${id}`);
    return response.data;
  }

  // Classes
  async getClasses(filters?: any) {
    const response = await this.client.get('/classes', { params: filters });
    return response.data;
  }

  async getClass(id: string) {
    const response = await this.client.get(`/classes/${id}`);
    return response.data;
  }

  async createClass(data: any) {
    const response = await this.client.post('/classes', data);
    return response.data;
  }

  async updateClass(id: string, data: any) {
    const response = await this.client.patch(`/classes/${id}`, data);
    return response.data;
  }

  async deleteClass(id: string) {
    const response = await this.client.delete(`/classes/${id}`);
    return response.data;
  }

  async addStudentsToClass(classId: string, studentIds: string[]) {
    const response = await this.client.post(`/classes/${classId}/students`, { studentIds });
    return response.data;
  }

  async removeStudentsFromClass(classId: string, studentIds: string[]) {
    const response = await this.client.delete(`/classes/${classId}/students`, { data: { studentIds } });
    return response.data;
  }

  async addTeachersToClass(classId: string, teacherIds: string[], makeMainTeacher?: boolean) {
    const response = await this.client.post(`/classes/${classId}/teachers`, { teacherIds, makeMainTeacher });
    return response.data;
  }

  async removeTeachersFromClass(classId: string, teacherIds: string[]) {
    const response = await this.client.delete(`/classes/${classId}/teachers`, { data: { teacherIds } });
    return response.data;
  }

  // Class Schedules
  async getClassSchedules(classId: string) {
    const response = await this.client.get(`/classes/${classId}/schedules`);
    return response.data;
  }

  async getClassTimetable(classId: string) {
    const response = await this.client.get(`/classes/${classId}/timetable`);
    return response.data;
  }

  async createClassSchedule(classId: string, data: any) {
    const response = await this.client.post(`/classes/${classId}/schedules`, data);
    return response.data;
  }

  async updateClassSchedule(scheduleId: string, data: any) {
    const response = await this.client.patch(`/classes/schedules/${scheduleId}`, data);
    return response.data;
  }

  async deleteClassSchedule(scheduleId: string) {
    const response = await this.client.delete(`/classes/schedules/${scheduleId}`);
    return response.data;
  }

  // Students
  async getStudents(filters?: { yearGroupId?: string; classId?: string; search?: string }) {
    const response = await this.client.get('/students', { params: filters });
    return response.data;
  }

  async getStudent(id: string) {
    const response = await this.client.get(`/students/${id}`);
    return response.data;
  }

  async createStudent(data: any) {
    const response = await this.client.post('/students', data);
    return response.data;
  }

  async updateStudent(id: string, data: any) {
    const response = await this.client.patch(`/students/${id}`, data);
    return response.data;
  }

  async deleteStudent(id: string) {
    const response = await this.client.delete(`/students/${id}`);
    return response.data;
  }

  async bulkImportStudents(students: any[]) {
    const response = await this.client.post('/students/bulk-import', { students });
    return response.data;
  }

  async bulkImportStudentsCSV(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/students/bulk-import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async uploadStudentAvatar(studentId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post(`/students/${studentId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async assignStudentToClasses(studentId: string, classIds: string[]) {
    const response = await this.client.post(`/students/${studentId}/assign-class`, { classIds });
    return response.data;
  }

  async unassignStudentFromClass(studentId: string, classId: string) {
    const response = await this.client.delete(`/students/${studentId}/unassign-class/${classId}`);
    return response.data;
  }

  // System Info
  async getSystemInfo() {
    const response = await this.client.get('/system-info');
    return response.data;
  }

  // Curriculum Management
  async getCurriculumTopics(filters?: { yearGroupId?: string; subjectId?: string; keyStage?: string }) {
    const response = await this.client.get('/curriculum/topics', { params: filters });
    return response.data;
  }

  async getCurriculumTopic(id: string) {
    const response = await this.client.get(`/curriculum/topics/${id}`);
    return response.data;
  }

  async createCurriculumTopic(data: any) {
    const response = await this.client.post('/curriculum/topics', data);
    return response.data;
  }

  async updateCurriculumTopic(id: string, data: any) {
    const response = await this.client.put(`/curriculum/topics/${id}`, data);
    return response.data;
  }

  async deleteCurriculumTopic(id: string) {
    const response = await this.client.delete(`/curriculum/topics/${id}`);
    return response.data;
  }

  // Supercurriculum Activities
  async getSupercurriculumActivities(filters?: any) {
    const response = await this.client.get('/curriculum/activities', { params: filters });
    return response.data;
  }

  async getPendingActivities() {
    const response = await this.client.get('/curriculum/activities/pending');
    return response.data;
  }

  async getActivity(id: string) {
    const response = await this.client.get(`/curriculum/activities/${id}`);
    return response.data;
  }

  async createActivity(data: any) {
    const response = await this.client.post('/curriculum/activities', data);
    return response.data;
  }

  async updateActivity(id: string, data: any) {
    const response = await this.client.put(`/curriculum/activities/${id}`, data);
    return response.data;
  }

  async approveActivity(id: string) {
    const response = await this.client.put(`/curriculum/activities/${id}/approve`);
    return response.data;
  }

  async bulkApproveActivities(ids: string[]) {
    const response = await this.client.put('/curriculum/activities/bulk/approve', { ids });
    return response.data;
  }

  async bulkRejectActivities(ids: string[]) {
    const response = await this.client.put('/curriculum/activities/bulk/reject', { ids });
    return response.data;
  }

  async rejectActivity(id: string) {
    const response = await this.client.put(`/curriculum/activities/${id}/reject`);
    return response.data;
  }

  async deleteActivity(id: string) {
    const response = await this.client.delete(`/curriculum/activities/${id}`);
    return response.data;
  }

  // Curriculum Coverage
  async getCurriculumCoverage() {
    const response = await this.client.get('/curriculum/coverage');
    return response.data;
  }

  async getCurriculumStats() {
    const response = await this.client.get('/curriculum/stats');
    return response.data;
  }

  // Curriculum Standards
  async getCurriculumStandards(filters?: { keyStage?: string; subjectId?: string }) {
    const response = await this.client.get('/curriculum/standards', { params: filters });
    return response.data;
  }

  async createCurriculumStandard(data: any) {
    const response = await this.client.post('/curriculum/standards', data);
    return response.data;
  }

  // Bulk Import
  async importTopicsCSV(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/curriculum/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async importTopicsJSON(topics: any[]) {
    const response = await this.client.post('/curriculum/import/json', { topics });
    return response.data;
  }

  async parseNCDocument(data: { documentText: string; yearGroupId?: string; subjectId?: string; keyStage?: string }) {
    const response = await this.client.post('/curriculum/parse/nc-document', data);
    return response.data;
  }

  async getCSVTemplate() {
    const response = await this.client.get('/curriculum/export/template');
    return response.data;
  }

  // Dashboard Statistics
  async getDashboardStats() {
    const response = await this.client.get('/teachers/dashboard/stats');
    return response.data;
  }

  async getRecentActivity(limit: number = 10) {
    const response = await this.client.get('/teachers/dashboard/activity', { params: { limit } });
    return response.data;
  }

  async getStudentsAtRisk() {
    const response = await this.client.get('/teachers/dashboard/at-risk');
    return response.data;
  }

  async getSubjectPerformance() {
    const response = await this.client.get('/teachers/dashboard/subject-performance');
    return response.data;
  }

  // Student Performance
  async getStudentPerformance(studentId: string) {
    const response = await this.client.get(`/students/${studentId}/performance`);
    return response.data;
  }

  // Class Analytics
  async getClassAnalytics(classId: string) {
    const response = await this.client.get(`/classes/${classId}/analytics`);
    return response.data;
  }

  // Visualization Data
  async getVisualizationData(filters?: { yearGroupId?: string; classId?: string; timeRange?: string }) {
    const response = await this.client.get('/analytics/visualizations', { params: filters });
    return response.data;
  }

  // Activity Assignments
  async assignActivity(data: {
    activityId: string;
    assignmentType: 'individual' | 'class' | 'group';
    studentIds?: string[];
    classIds?: string[];
    dueDate?: string;
    isRequired: boolean;
    notes?: string;
  }) {
    const response = await this.client.post('/activities/assign', data);
    return response.data;
  }

  async getAssignments(filters?: { studentId?: string; classId?: string; status?: string }) {
    const response = await this.client.get('/activities/assignments', { params: filters });
    return response.data;
  }

  // ============================================
  // DIAGNOSTIC TESTS MANAGEMENT
  // ============================================

  /**
   * Create a new diagnostic test schedule
   */
  async createDiagnosticTestSchedule(data: {
    title: string;
    description?: string;
    testType: 'PRE_TEST' | 'MID_YEAR' | 'POST_TEST' | 'END_OF_YEAR' | 'CUSTOM';
    yearGroupId: string;
    classIds: string[];
    studentIds?: string[];
    startDate: string;
    endDate: string;
  }) {
    const response = await this.client.post('/diagnostic-tests/schedules', data);
    return response.data;
  }

  /**
   * Get all diagnostic test schedules
   */
  async getDiagnosticTestSchedules(filters?: {
    yearGroupId?: string;
    status?: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  }) {
    const response = await this.client.get('/diagnostic-tests/schedules', { params: filters });
    return response.data;
  }

  /**
   * Get a specific diagnostic test schedule by ID
   */
  async getDiagnosticTestSchedule(scheduleId: string) {
    const response = await this.client.get(`/diagnostic-tests/schedules/${scheduleId}`);
    return response.data;
  }

  /**
   * Update a diagnostic test schedule
   */
  async updateDiagnosticTestSchedule(scheduleId: string, data: {
    title?: string;
    description?: string;
    testType?: 'PRE_TEST' | 'MID_YEAR' | 'POST_TEST' | 'END_OF_YEAR' | 'CUSTOM';
    status?: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    classIds?: string[];
    studentIds?: string[];
    startDate?: string;
    endDate?: string;
  }) {
    const response = await this.client.put(`/diagnostic-tests/schedules/${scheduleId}`, data);
    return response.data;
  }

  /**
   * Delete a diagnostic test schedule
   */
  async deleteDiagnosticTestSchedule(scheduleId: string) {
    const response = await this.client.delete(`/diagnostic-tests/schedules/${scheduleId}`);
    return response.data;
  }

  /**
   * Get diagnostic test results with analytics
   */
  async getDiagnosticTestResults(filters?: {
    scheduleId?: string;
    studentId?: string;
    classId?: string;
    yearGroupId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await this.client.get('/diagnostic-tests/results', { params: filters });
    return response.data;
  }

  /**
   * Get class averages for diagnostic tests
   */
  async getDiagnosticClassAverages(classId: string, scheduleId?: string) {
    const response = await this.client.get(`/diagnostic-tests/analytics/class/${classId}`, {
      params: { scheduleId },
    });
    return response.data;
  }

  /**
   * Compare pre/post test scores
   */
  async compareDiagnosticScores(preTestId: string, postTestId: string) {
    const response = await this.client.get('/diagnostic-tests/analytics/compare', {
      params: { preTestId, postTestId },
    });
    return response.data;
  }

  /**
   * Identify skill gaps from test results
   */
  async identifySkillGaps(filters?: {
    scheduleId?: string;
    studentId?: string;
    classId?: string;
    yearGroupId?: string;
  }) {
    const response = await this.client.get('/diagnostic-tests/analytics/skill-gaps', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get year-on-year comparison for a year group
   */
  async getYearOnYearComparison(yearGroupId: string) {
    const response = await this.client.get(
      `/diagnostic-tests/analytics/year-on-year/${yearGroupId}`
    );
    return response.data;
  }

  // ============================================
  // CUSTOM ASSIGNMENTS (AI-GENERATED)
  // ============================================

  /**
   * Generate a new custom assignment using AI
   */
  async generateCustomAssignment(data: {
    aiPrompt: string;
    title?: string;
    description?: string;
    subjectId?: string;
    yearGroupId?: string;
    topic?: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
    duration?: number;
    questionCount?: number;
    tags?: string[];
  }) {
    const response = await this.client.post('/custom-assignments/generate', data);
    return response.data;
  }

  /**
   * Get all custom assignments
   */
  async getCustomAssignments(filters?: {
    createdById?: string;
    subjectId?: string;
    yearGroupId?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    visibility?: 'PRIVATE' | 'SHARED_WITH_SCHOOL' | 'PUBLIC';
    tag?: string;
    search?: string;
  }) {
    const response = await this.client.get('/custom-assignments', { params: filters });
    return response.data;
  }

  /**
   * Get assignments shared with me
   */
  async getSharedCustomAssignments() {
    const response = await this.client.get('/custom-assignments/shared');
    return response.data;
  }

  /**
   * Get a specific custom assignment
   */
  async getCustomAssignment(assignmentId: string) {
    const response = await this.client.get(`/custom-assignments/${assignmentId}`);
    return response.data;
  }

  /**
   * Update a custom assignment
   */
  async updateCustomAssignment(assignmentId: string, data: {
    title?: string;
    description?: string;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    visibility?: 'PRIVATE' | 'SHARED_WITH_SCHOOL' | 'PUBLIC';
    duration?: number;
    isTemplate?: boolean;
    tags?: string[];
  }) {
    const response = await this.client.put(`/custom-assignments/${assignmentId}`, data);
    return response.data;
  }

  /**
   * Delete a custom assignment
   */
  async deleteCustomAssignment(assignmentId: string) {
    const response = await this.client.delete(`/custom-assignments/${assignmentId}`);
    return response.data;
  }

  /**
   * Assign custom assignment to students
   */
  async assignCustomAssignmentToStudents(
    assignmentId: string,
    studentIds: string[],
    dueDate?: string
  ) {
    const response = await this.client.post(`/custom-assignments/${assignmentId}/assign`, {
      studentIds,
      dueDate,
    });
    return response.data;
  }

  /**
   * Share custom assignment with teachers
   */
  async shareCustomAssignment(
    assignmentId: string,
    teacherIds: string[],
    canEdit: boolean = false
  ) {
    const response = await this.client.post(`/custom-assignments/${assignmentId}/share`, {
      teacherIds,
      canEdit,
    });
    return response.data;
  }

  /**
   * Get assignment statistics
   */
  async getCustomAssignmentStats(assignmentId: string) {
    const response = await this.client.get(`/custom-assignments/${assignmentId}/stats`);
    return response.data;
  }

  // ============================================
  // INTERVENTION MANAGEMENT
  // ============================================

  /**
   * Scan assessments and identify skill gaps
   */
  async scanForSkillGaps(threshold?: number) {
    const params = threshold ? { threshold } : {};
    const response = await this.client.post('/interventions/management/scan-gaps', null, { params });
    return response.data;
  }

  /**
   * Get all skill gaps with filters
   */
  async getSkillGaps(filters?: {
    studentId?: string;
    classId?: string;
    subjectId?: string;
    skillId?: string;
    severity?: 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
    isResolved?: boolean;
  }) {
    const response = await this.client.get('/interventions/management/gaps', { params: filters });
    return response.data;
  }

  /**
   * Get students with gaps in a specific skill
   */
  async getStudentsWithSkillGaps(skillId: string, subjectId?: string) {
    const response = await this.client.get(`/interventions/management/gaps/skill/${skillId}`, {
      params: { subjectId },
    });
    return response.data;
  }

  /**
   * Create a skill gap manually
   */
  async createSkillGap(data: {
    studentId: string;
    subjectId: string;
    skillId: string;
    yearGroupId: string;
    severity: 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
    percentageScore: number;
    assessmentId?: string;
    notes?: string;
  }) {
    const response = await this.client.post('/interventions/management/gaps', data);
    return response.data;
  }

  /**
   * Resolve a skill gap
   */
  async resolveSkillGap(gapId: string) {
    const response = await this.client.patch(`/interventions/management/gaps/${gapId}/resolve`);
    return response.data;
  }

  /**
   * Get skill gap dashboard
   */
  async getSkillGapDashboard(filters?: {
    classId?: string;
    subjectId?: string;
    yearGroupId?: string;
  }) {
    const response = await this.client.get('/interventions/management/dashboard', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Assign intervention to student
   */
  async assignIntervention(data: {
    studentId: string;
    teacherId: string;
    skillGapId?: string;
    interventionId?: string;
    title: string;
    description: string;
    targetSubjectId: string;
    targetSkillId: string;
    targetYearGroupId?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string;
    microLessons?: any[];
    activities?: any;
    preScore?: number;
  }) {
    const response = await this.client.post('/interventions/management/assignments', data);
    return response.data;
  }

  /**
   * Assign backfill intervention
   */
  async assignBackfillIntervention(data: {
    studentId: string;
    teacherId: string;
    targetYearGroupId: string;
    subjectId: string;
    skillId: string;
    reason: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string;
  }) {
    const response = await this.client.post('/interventions/management/assignments/backfill', data);
    return response.data;
  }

  /**
   * Get intervention assignments
   */
  async getInterventionAssignments(filters?: {
    studentId?: string;
    teacherId?: string;
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ESCALATED';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }) {
    const response = await this.client.get('/interventions/management/assignments', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get intervention assignment by ID
   */
  async getInterventionAssignment(assignmentId: string) {
    const response = await this.client.get(`/interventions/management/assignments/${assignmentId}`);
    return response.data;
  }

  /**
   * Update intervention assignment
   */
  async updateInterventionAssignment(
    assignmentId: string,
    data: {
      status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ESCALATED';
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      postScore?: number;
      dueDate?: string;
      escalationNotes?: string;
    }
  ) {
    const response = await this.client.patch(
      `/interventions/management/assignments/${assignmentId}`,
      data
    );
    return response.data;
  }

  /**
   * Log progress on intervention
   */
  async logInterventionProgress(data: {
    assignmentId: string;
    activityCompleted?: string;
    score?: number;
    timeSpent: number;
    notes?: string;
    wasSuccessful: boolean;
  }) {
    const response = await this.client.post('/interventions/management/progress', data);
    return response.data;
  }

  /**
   * Escalate intervention
   */
  async escalateIntervention(assignmentId: string, reason: string, escalationNotes?: string) {
    const response = await this.client.post(`/interventions/management/assignments/${assignmentId}/escalate`, {
      assignmentId,
      reason,
      escalationNotes,
    });
    return response.data;
  }

  /**
   * Get skill gap alerts
   */
  async getSkillGapAlerts(filters?: {
    teacherId?: string;
    studentId?: string;
    unreadOnly?: boolean;
  }) {
    const response = await this.client.get('/interventions/management/alerts', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get my alerts (for teachers)
   */
  async getMySkillGapAlerts() {
    const response = await this.client.get('/interventions/management/alerts/my-alerts');
    return response.data;
  }

  /**
   * Update alert
   */
  async updateSkillGapAlert(
    alertId: string,
    data: {
      isRead?: boolean;
      isSnoozed?: boolean;
      snoozedUntil?: string;
    }
  ) {
    const response = await this.client.patch(`/interventions/management/alerts/${alertId}`, data);
    return response.data;
  }

  /**
   * Mark alert as read
   */
  async markSkillGapAlertAsRead(alertId: string) {
    const response = await this.client.patch(`/interventions/management/alerts/${alertId}/read`);
    return response.data;
  }

  /**
   * Snooze alert
   */
  async snoozeSkillGapAlert(alertId: string, until: string) {
    const response = await this.client.patch(`/interventions/management/alerts/${alertId}/snooze`, {
      until,
    });
    return response.data;
  }

  // ============================================
  // TEACHER NOTES
  // ============================================

  /**
   * Create teacher note
   */
  async createTeacherNote(data: {
    studentId: string;
    teacherId: string;
    subjectId?: string;
    skillId?: string;
    noteCategory: 'BEHAVIORAL' | 'ACADEMIC' | 'GENERAL';
    noteType: string;
    content: string;
    isVisibleToStudent?: boolean;
    isVisibleToParent?: boolean;
    flaggedForFollowUp?: boolean;
    followUpDate?: string;
    attachments?: Array<any>;
    tags?: string[];
  }) {
    const response = await this.client.post('/teacher-controls/notes', data);
    return response.data;
  }

  /**
   * Get teacher notes with filters
   */
  async getTeacherNotes(filters?: {
    studentId?: string;
    teacherId?: string;
    subjectId?: string;
    skillId?: string;
    noteCategory?: 'BEHAVIORAL' | 'ACADEMIC' | 'GENERAL';
    noteType?: string;
    flaggedForFollowUp?: boolean;
    followUpCompleted?: boolean;
    visibleToStudentOnly?: boolean;
  }) {
    const response = await this.client.get('/teacher-controls/notes', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get teacher note by ID
   */
  async getTeacherNoteById(noteId: string) {
    const response = await this.client.get(`/teacher-controls/notes/${noteId}`);
    return response.data;
  }

  /**
   * Update teacher note
   */
  async updateTeacherNote(
    noteId: string,
    data: {
      noteCategory?: 'BEHAVIORAL' | 'ACADEMIC' | 'GENERAL';
      noteType?: string;
      content?: string;
      isVisibleToStudent?: boolean;
      isVisibleToParent?: boolean;
      flaggedForFollowUp?: boolean;
      followUpDate?: string;
      followUpCompleted?: boolean;
      attachments?: Array<any>;
      tags?: string[];
    }
  ) {
    const response = await this.client.patch(`/teacher-controls/notes/${noteId}`, data);
    return response.data;
  }

  /**
   * Delete teacher note
   */
  async deleteTeacherNote(noteId: string) {
    const response = await this.client.delete(`/teacher-controls/notes/${noteId}`);
    return response.data;
  }

  /**
   * Get notes flagged for follow-up
   */
  async getFollowUpNotes() {
    const response = await this.client.get('/teacher-controls/notes/follow-up/pending');
    return response.data;
  }

  /**
   * Mark follow-up as completed
   */
  async completeFollowUp(noteId: string) {
    const response = await this.client.patch(`/teacher-controls/notes/${noteId}/complete-follow-up`);
    return response.data;
  }

  /**
   * Add attachment to note
   */
  async addNoteAttachment(noteId: string, attachment: any) {
    const response = await this.client.post(`/teacher-controls/notes/${noteId}/attachments`, attachment);
    return response.data;
  }

  /**
   * Remove attachment from note
   */
  async removeNoteAttachment(noteId: string, attachmentUrl: string) {
    const response = await this.client.delete(`/teacher-controls/notes/${noteId}/attachments`, {
      data: { attachmentUrl },
    });
    return response.data;
  }

  // ============================================
  // MINI-ASSESSMENTS
  // ============================================

  /**
   * Create mini-assessment
   */
  async createMiniAssessment(data: {
    interventionAssignmentId?: string;
    studentId: string;
    teacherId?: string;
    skillGapId?: string;
    title: string;
    description?: string;
    targetSkillId: string;
    targetSubjectId: string;
    questions: Array<any>;
    totalQuestions: number;
    passingScore?: number;
  }) {
    const response = await this.client.post('/interventions/management/mini-assessments', data);
    return response.data;
  }

  /**
   * Generate mini-assessment from skill gap
   */
  async generateMiniAssessmentFromGap(skillGapId: string) {
    const response = await this.client.post(
      `/interventions/management/mini-assessments/generate/${skillGapId}`
    );
    return response.data;
  }

  /**
   * Get mini-assessments with filters
   */
  async getMiniAssessments(filters?: {
    studentId?: string;
    teacherId?: string;
    interventionAssignmentId?: string;
    skillGapId?: string;
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PASSED' | 'FAILED';
  }) {
    const response = await this.client.get('/interventions/management/mini-assessments', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get my mini-assessments (student)
   */
  async getMyMiniAssessments() {
    const response = await this.client.get('/interventions/management/mini-assessments/my-assessments');
    return response.data;
  }

  /**
   * Get mini-assessment by ID
   */
  async getMiniAssessmentById(assessmentId: string) {
    const response = await this.client.get(`/interventions/management/mini-assessments/${assessmentId}`);
    return response.data;
  }

  /**
   * Start mini-assessment
   */
  async startMiniAssessment(assessmentId: string) {
    const response = await this.client.post(
      `/interventions/management/mini-assessments/${assessmentId}/start`
    );
    return response.data;
  }

  /**
   * Submit mini-assessment
   */
  async submitMiniAssessment(data: {
    assessmentId: string;
    studentAnswers: Record<string, string>;
    timeSpent?: number;
  }) {
    const response = await this.client.post('/interventions/management/mini-assessments/submit', data);
    return response.data;
  }

  /**
   * Update mini-assessment
   */
  async updateMiniAssessment(
    assessmentId: string,
    data: {
      status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PASSED' | 'FAILED';
      score?: number;
      passed?: boolean;
      feedback?: string;
    }
  ) {
    const response = await this.client.patch(
      `/interventions/management/mini-assessments/${assessmentId}`,
      data
    );
    return response.data;
  }

  /**
   * Delete mini-assessment
   */
  async deleteMiniAssessment(assessmentId: string) {
    const response = await this.client.delete(`/interventions/management/mini-assessments/${assessmentId}`);
    return response.data;
  }

  // ============================================
  // REPORTS
  // ============================================

  /**
   * Generate report (returns JSON data)
   */
  async generateReport(data: {
    reportType: 'STUDENT' | 'CLASS' | 'PARENT_FRIENDLY' | 'CUSTOM';
    studentId?: string;
    classId?: string;
    startDate?: string;
    endDate?: string;
    subjectIds?: string[];
    metrics?: string[];
    teacherCommentary?: string;
    format?: 'PDF' | 'CSV' | 'EXCEL' | 'JSON';
    includeCharts?: boolean;
    includeRecommendations?: boolean;
  }) {
    const response = await this.client.post('/reports/generate', data);
    return response.data;
  }

  /**
   * Export report as file (downloads file)
   */
  async exportReport(data: {
    reportType: 'STUDENT' | 'CLASS' | 'PARENT_FRIENDLY' | 'CUSTOM';
    studentId?: string;
    classId?: string;
    startDate?: string;
    endDate?: string;
    subjectIds?: string[];
    metrics?: string[];
    teacherCommentary?: string;
    format: 'PDF' | 'CSV' | 'EXCEL';
    includeCharts?: boolean;
    includeRecommendations?: boolean;
  }) {
    const response = await this.client.post('/reports/export', data, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const extension = data.format.toLowerCase();
    const reportType = data.reportType.toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `${reportType}_report_${timestamp}.${extension}`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  }

  /**
   * Get student report
   */
  async getStudentReport(
    studentId: string,
    startDate?: string,
    endDate?: string
  ) {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await this.client.get(`/reports/student/${studentId}`, { params });
    return response.data;
  }

  /**
   * Get class report
   */
  async getClassReport(
    classId: string,
    startDate?: string,
    endDate?: string
  ) {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await this.client.get(`/reports/class/${classId}`, { params });
    return response.data;
  }

  /**
   * Get parent-friendly report
   */
  async getParentFriendlyReport(
    studentId: string,
    startDate?: string,
    endDate?: string
  ) {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await this.client.get(`/reports/parent-friendly/${studentId}`, { params });
    return response.data;
  }

  /**
   * Email report to recipients
   */
  async emailReport(data: {
    reportId: string;
    recipientEmails: string[];
    subject?: string;
    message?: string;
  }) {
    const response = await this.client.post('/reports/email', data);
    return response.data;
  }

  /**
   * Schedule automated report
   */
  async scheduleReport(data: {
    reportType: 'STUDENT' | 'CLASS' | 'PARENT_FRIENDLY' | 'CUSTOM';
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
    studentId?: string;
    classId?: string;
    recipientEmails?: string[];
    subjectIds?: string[];
    metrics?: string[];
    format?: 'PDF' | 'CSV' | 'EXCEL';
    isActive?: boolean;
  }) {
    const response = await this.client.post('/reports/schedule', data);
    return response.data;
  }

  // ============================================
  // CURRICULUM PDF PARSER
  // ============================================

  /**
   * Get list of available PDFs in the pdfs folder
   */
  async getAvailableCurriculumPdfs() {
    const response = await this.client.get('/curriculum-parser/preview-existing');
    return response.data;
  }

  /**
   * Upload and analyze a curriculum PDF
   */
  async uploadCurriculumPdf(file: File, documentType: 'primary' | 'secondary' | 'full' = 'full', autoImport: boolean = false) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('autoImport', String(autoImport));
    
    const response = await this.client.post('/curriculum-parser/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 600000, // 10 minutes timeout for large PDFs
    });
    return response.data;
  }

  /**
   * Analyze a single PDF from the pdfs folder
   */
  async analyzeCurriculumPdf(fileName: string, documentType: 'primary' | 'secondary' | 'full' = 'full') {
    const response = await this.client.post('/curriculum-parser/analyze-single', {
      fileName,
      documentType,
    }, {
      timeout: 600000, // 10 minutes timeout
    });
    return response.data;
  }

  /**
   * Process all PDFs in the pdfs folder
   */
  async processAllCurriculumPdfs() {
    const response = await this.client.post('/curriculum-parser/process-existing', {}, {
      timeout: 1200000, // 20 minutes timeout for multiple PDFs
    });
    return response.data;
  }

  /**
   * Import extracted curriculum data to database
   */
  async importCurriculumData(extractedData: any) {
    const response = await this.client.post('/curriculum-parser/import', extractedData);
    return response.data;
  }
}

export default new AdminApiClient();

