import express from 'express';
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizStats,
  getQuizTypes,
} from '../controllers/quizController';

const router = express.Router();

// All routes are public (no authentication required)
router.get('/types', getQuizTypes); // Get all quiz types/categories
router.get('/', getAllQuizzes); // Get all quizzes with filters and pagination
router.post('/', createQuiz); // Create a new quiz
router.get('/:id', getQuizById); // Get quiz by ID
router.put('/:id', updateQuiz); // Update quiz
router.delete('/:id', deleteQuiz); // Delete quiz
router.get('/:id/stats', getQuizStats); // Get quiz statistics

export default router;