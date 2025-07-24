import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticateToken as auth } from '@/middleware/auth';
import { validateRequest } from '@/utils/validation';
import instructorManagementController from '@/controllers/instructorManagementController';

const router = Router();

// ========================================
// ENHANCED PROFILE & MEDIA ROUTES
// ========================================

// Upload instructor media (videos, photos, documents)
router.post('/media',
  auth,
  [
    body('media_type')
      .isIn(['video', 'photo', 'document'])
      .withMessage('Media type must be video, photo, or document'),
    body('media_purpose')
      .isIn(['portfolio', 'teaching_demo', 'certification', 'profile_photo', 'gallery'])
      .withMessage('Invalid media purpose'),
    body('title')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    body('file_url')
      .isURL()
      .withMessage('File URL must be a valid URL'),
    body('thumbnail_url')
      .optional()
      .isURL()
      .withMessage('Thumbnail URL must be a valid URL'),
    body('file_size')
      .optional()
      .isInt({ min: 1 })
      .withMessage('File size must be a positive integer'),
    body('duration_seconds')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer'),
    body('is_featured')
      .optional()
      .isBoolean()
      .withMessage('Is featured must be a boolean'),
    body('is_public')
      .optional()
      .isBoolean()
      .withMessage('Is public must be a boolean')
  ],
  validateRequest,
  instructorManagementController.uploadInstructorMedia
);

// Get instructor media gallery
router.get('/media/:instructorId',
  [
    param('instructorId')
      .isUUID()
      .withMessage('Instructor ID must be a valid UUID'),
    query('media_type')
      .optional()
      .isIn(['video', 'photo', 'document'])
      .withMessage('Media type must be video, photo, or document'),
    query('media_purpose')
      .optional()
      .isIn(['portfolio', 'teaching_demo', 'certification', 'profile_photo', 'gallery'])
      .withMessage('Invalid media purpose'),
    query('is_public')
      .optional()
      .isBoolean()
      .withMessage('Is public must be a boolean')
  ],
  validateRequest,
  instructorManagementController.getInstructorMedia
);

// Update instructor skills
router.put('/skills',
  auth,
  [
    body('skills')
      .isArray({ min: 1 })
      .withMessage('Skills must be a non-empty array'),
    body('skills.*.skill_category')
      .isIn(['technique', 'safety', 'teaching', 'terrain'])
      .withMessage('Invalid skill category'),
    body('skills.*.skill_name')
      .isLength({ min: 1, max: 100 })
      .withMessage('Skill name must be between 1 and 100 characters'),
    body('skills.*.proficiency_level')
      .isInt({ min: 1, max: 5 })
      .withMessage('Proficiency level must be between 1 and 5')
  ],
  validateRequest,
  instructorManagementController.updateInstructorSkills
);

// ========================================
// CERTIFICATION VERIFICATION ROUTES
// ========================================

// Upload certification documents
router.post('/certifications/:certificationId/documents',
  auth,
  [
    param('certificationId')
      .isUUID()
      .withMessage('Certification ID must be a valid UUID'),
    body('documents')
      .isArray({ min: 1 })
      .withMessage('Documents must be a non-empty array'),
    body('documents.*.document_type')
      .isIn(['certificate', 'transcript', 'photo_id', 'supporting_doc'])
      .withMessage('Invalid document type'),
    body('documents.*.file_url')
      .isURL()
      .withMessage('File URL must be a valid URL'),
    body('documents.*.file_name')
      .isLength({ min: 1, max: 255 })
      .withMessage('File name must be between 1 and 255 characters'),
    body('documents.*.file_size')
      .optional()
      .isInt({ min: 1 })
      .withMessage('File size must be a positive integer')
  ],
  validateRequest,
  instructorManagementController.uploadCertificationDocuments
);

// Get certification verification status
router.get('/certifications/verification-status',
  auth,
  instructorManagementController.getCertificationVerificationStatus
);

// ========================================
// ONBOARDING ROUTES
// ========================================

// Get onboarding progress
router.get('/onboarding/progress',
  auth,
  instructorManagementController.getOnboardingProgress
);

// Update onboarding step status
router.put('/onboarding/steps/:stepId',
  auth,
  [
    param('stepId')
      .isUUID()
      .withMessage('Step ID must be a valid UUID'),
    body('status')
      .isIn(['pending', 'in_progress', 'completed', 'skipped'])
      .withMessage('Invalid status'),
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Notes must be less than 1000 characters')
  ],
  validateRequest,
  instructorManagementController.updateOnboardingStepStatus
);

// ========================================
// PERFORMANCE ANALYTICS ROUTES
// ========================================

// Get performance analytics
router.get('/analytics/performance',
  auth,
  [
    query('period')
      .optional()
      .isIn(['7days', '30days', '90days', '1year'])
      .withMessage('Period must be 7days, 30days, 90days, or 1year'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date')
  ],
  validateRequest,
  instructorManagementController.getPerformanceAnalytics
);

// Get seasonal analytics
router.get('/analytics/seasonal',
  auth,
  [
    query('year')
      .optional()
      .isInt({ min: 2020, max: 2030 })
      .withMessage('Year must be between 2020 and 2030')
  ],
  validateRequest,
  instructorManagementController.getSeasonalAnalytics
);

// ========================================
// PROFESSIONAL DEVELOPMENT ROUTES
// ========================================

// Get available courses
router.get('/courses/available',
  auth,
  [
    query('course_type')
      .optional()
      .isIn(['certification', 'continuing_education', 'workshop', 'webinar'])
      .withMessage('Invalid course type'),
    query('provider')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Provider must be between 1 and 100 characters')
  ],
  validateRequest,
  instructorManagementController.getAvailableCourses
);

// Enroll in course
router.post('/courses/:courseId/enroll',
  auth,
  [
    param('courseId')
      .isUUID()
      .withMessage('Course ID must be a valid UUID')
  ],
  validateRequest,
  instructorManagementController.enrollInCourse
);

// ========================================
// COMMUNITY FEATURES ROUTES
// ========================================

// Get forum categories
router.get('/community/forum/categories',
  auth,
  instructorManagementController.getForumCategories
);

// Create forum post
router.post('/community/forum/posts',
  auth,
  [
    body('category_id')
      .isUUID()
      .withMessage('Category ID must be a valid UUID'),
    body('title')
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters'),
    body('content')
      .isLength({ min: 10, max: 5000 })
      .withMessage('Content must be between 10 and 5000 characters'),
    body('post_type')
      .optional()
      .isIn(['discussion', 'question', 'tip', 'resource'])
      .withMessage('Invalid post type')
  ],
  validateRequest,
  instructorManagementController.createForumPost
);

// Get regional groups
router.get('/community/groups',
  auth,
  [
    query('region')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Region must be between 1 and 100 characters'),
    query('group_type')
      .optional()
      .isIn(['regional', 'specialty', 'experience_level'])
      .withMessage('Invalid group type')
  ],
  validateRequest,
  instructorManagementController.getRegionalGroups
);

// Submit peer review
router.post('/community/peer-reviews',
  auth,
  [
    body('reviewed_id')
      .isUUID()
      .withMessage('Reviewed ID must be a valid UUID'),
    body('review_type')
      .isIn(['peer_observation', 'collaboration', 'mentorship_feedback'])
      .withMessage('Invalid review type'),
    body('overall_rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Overall rating must be between 1 and 5'),
    body('teaching_technique_rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Teaching technique rating must be between 1 and 5'),
    body('communication_rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Communication rating must be between 1 and 5'),
    body('professionalism_rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Professionalism rating must be between 1 and 5'),
    body('safety_awareness_rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Safety awareness rating must be between 1 and 5'),
    body('feedback_text')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Feedback text must be less than 2000 characters'),
    body('strengths')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Strengths must be less than 1000 characters'),
    body('improvement_areas')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Improvement areas must be less than 1000 characters'),
    body('is_anonymous')
      .optional()
      .isBoolean()
      .withMessage('Is anonymous must be a boolean')
  ],
  validateRequest,
  instructorManagementController.submitPeerReview
);

export default router;