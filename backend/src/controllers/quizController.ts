import { Request, Response } from 'express';
import Quiz from '../models/Quiz';

// Create a new quiz
export const createQuiz = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      type,
      duration,
      numberOfQuestions,
      questions,
      difficulty = 'medium',
      tags = [],
    } = req.body;

    // Validation
    if (!name || !description || !type || !duration || !numberOfQuestions || !questions) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, description, type, duration, numberOfQuestions, questions' 
      });
    }

    // Validate questions array length
    if (questions.length !== numberOfQuestions) {
      return res.status(400).json({
        message: `Number of questions provided (${questions.length}) does not match numberOfQuestions (${numberOfQuestions})`,
      });
    }

    // Validate each question structure
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question || !question.options || question.correctAnswer === undefined) {
        return res.status(400).json({
          message: `Question ${i + 1} is missing required fields (question, options, correctAnswer)`,
        });
      }
      if (question.options.length !== 4) {
        return res.status(400).json({
          message: `Question ${i + 1} must have exactly 4 options`,
        });
      }
      if (question.correctAnswer < 0 || question.correctAnswer > 3) {
        return res.status(400).json({
          message: `Question ${i + 1} correctAnswer must be between 0 and 3`,
        });
      }
    }

    // Create quiz
    const quiz = await Quiz.create({
      name,
      description,
      type,
      duration,
      numberOfQuestions,
      questions,
      difficulty,
      tags,
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz,
    });
  } catch (error: any) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message,
    });
  }
};

// Get all quizzes with pagination and filters
export const getAllQuizzes = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const { type, difficulty, search, tags } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagsArray };
    }

    const quizzes = await Quiz.find(filter)
      .select('-questions') // Don't return questions in list view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Quiz.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      quizzes,
      pagination: {
        currentPage: page,
        totalPages,
        totalQuizzes: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error('Get all quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message,
    });
  }
};

// Get quiz by ID (with questions for taking quiz)
export const getQuizById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const includeAnswers = req.query.includeAnswers === 'true';

    let quiz;
    if (includeAnswers) {
      // Include correct answers
      quiz = await Quiz.findById(id);
    } else {
      // For quiz takers - exclude correct answers
      quiz = await Quiz.findById(id).select('-questions.correctAnswer');
    }

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error: any) {
    console.error('Get quiz by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: error.message,
    });
  }
};

// Update quiz
export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // If updating questions, validate them
    if (updates.questions && updates.numberOfQuestions) {
      if (updates.questions.length !== updates.numberOfQuestions) {
        return res.status(400).json({
          message: `Number of questions provided (${updates.questions.length}) does not match numberOfQuestions (${updates.numberOfQuestions})`,
        });
      }
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      quiz: updatedQuiz,
    });
  } catch (error: any) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz',
      error: error.message,
    });
  }
};

// Delete quiz
export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    await Quiz.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: error.message,
    });
  }
};

// Get quiz statistics
export const getQuizStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id).select('name totalAttempts averageScore difficulty type');
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        name: quiz.name,
        totalAttempts: quiz.totalAttempts,
        averageScore: quiz.averageScore,
        difficulty: quiz.difficulty,
        type: quiz.type,
      },
    });
  } catch (error: any) {
    console.error('Get quiz stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz statistics',
      error: error.message,
    });
  }
};

// Get quiz categories/types
export const getQuizTypes = async (req: Request, res: Response) => {
  try {
    const types = [
      'general-knowledge',
      'science', 
      'history',
      'technology',
      'sports',
      'entertainment',
      'geography',
      'literature',
      'mathematics',
      'other'
    ];

    res.status(200).json({
      success: true,
      types,
    });
  } catch (error: any) {
    console.error('Get quiz types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz types',
      error: error.message,
    });
  }
};