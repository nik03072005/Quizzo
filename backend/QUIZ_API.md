# Quiz API Documentation

This document describes the Quiz API endpoints for the Quizzo application.

## Base URL
```
/api/quizzes
```

## Quiz Model Structure

```typescript
{
  _id: string,
  name: string,                    // Quiz name (max 100 characters)
  description: string,             // Quiz description (max 500 characters)
  type: string,                    // Quiz category (see available types below)
  duration: number,                // Duration in minutes (1-180)
  numberOfQuestions: number,       // Number of questions (1-100)
  questions: [                     // Array of MCQ questions
    {
      question: string,            // Question text (max 500 characters)
      options: [string],           // Array of 4 options
      correctAnswer: number        // Index of correct option (0-3)
    }
  ],
  createdBy: ObjectId,            // User who created the quiz
  isPublic: boolean,              // Whether quiz is public (default: true)
  difficulty: string,             // 'easy' | 'medium' | 'hard'
  tags: [string],                 // Array of tags (max 10)
  totalAttempts: number,          // Number of times quiz was attempted
  averageScore: number,           // Average score (0-100)
  createdAt: Date,
  updatedAt: Date
}
```

## Available Quiz Types
- general-knowledge
- science
- history
- technology
- sports
- entertainment
- geography
- literature
- mathematics
- other

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Get Quiz Types
```
GET /api/quizzes/types
```
Returns all available quiz categories/types.

**Response:**
```json
{
  "success": true,
  "types": ["general-knowledge", "science", "history", ...]
}
```

#### Get All Public Quizzes
```
GET /api/quizzes?page=1&limit=10&type=science&difficulty=medium&search=physics&tags=education
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): Filter by quiz type
- `difficulty` (optional): Filter by difficulty (easy/medium/hard)
- `search` (optional): Search in quiz name and description
- `tags` (optional): Filter by tags

**Response:**
```json
{
  "success": true,
  "quizzes": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalQuizzes": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Quiz by ID
```
GET /api/quizzes/:id?includeAnswers=false
```

**Query Parameters:**
- `includeAnswers` (optional): Include correct answers (default: false)

**Response:**
```json
{
  "success": true,
  "quiz": { ... }
}
```

#### Get Quiz Statistics
```
GET /api/quizzes/:id/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "name": "Quiz Name",
    "totalAttempts": 150,
    "averageScore": 85.5,
    "difficulty": "medium",
    "type": "science"
  }
}
```

### Protected Endpoints (Authentication Required)

#### Create Quiz
```
POST /api/quizzes
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "My Science Quiz",
  "description": "A quiz about basic science concepts",
  "type": "science",
  "duration": 30,
  "numberOfQuestions": 5,
  "questions": [
    {
      "question": "What is the chemical symbol for water?",
      "options": ["H2O", "CO2", "NaCl", "O2"],
      "correctAnswer": 0
    }
  ],
  "isPublic": true,
  "difficulty": "medium",
  "tags": ["chemistry", "basics"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quiz created successfully",
  "quiz": { ... }
}
```

#### Get My Quizzes
```
GET /api/quizzes/user/my-quizzes?page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "quizzes": [...],
  "pagination": { ... }
}
```

#### Update Quiz
```
PUT /api/quizzes/:id
Authorization: Bearer <token>
```

**Request Body:** Same as create quiz (partial updates allowed)

**Response:**
```json
{
  "success": true,
  "message": "Quiz updated successfully",
  "quiz": { ... }
}
```

#### Delete Quiz
```
DELETE /api/quizzes/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Quiz deleted successfully"
}
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (access denied)
- `404`: Not found
- `500`: Internal server error

## Validation Rules

### Quiz Validation
- Name: Required, 1-100 characters
- Description: Required, 1-500 characters
- Type: Required, must be one of the available types
- Duration: Required, 1-180 minutes
- Number of questions: Required, 1-100
- Questions array: Must match numberOfQuestions

### Question Validation
- Question text: Required, max 500 characters
- Options: Required, exactly 4 options
- Correct answer: Required, must be 0-3 (index of correct option)

### Authorization
- Protected endpoints require `Authorization: Bearer <jwt_token>` header
- Users can only update/delete their own quizzes
- Private quizzes can only be accessed by their creators