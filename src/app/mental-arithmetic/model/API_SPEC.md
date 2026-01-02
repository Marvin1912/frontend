# Mental Arithmetic Backend API Specification

## Data Models

### Enums
```
Difficulty: EASY | MEDIUM | HARD
OperationType: ADDITION | SUBTRACTION | MULTIPLICATION | DIVISION
SessionStatus: CREATED | ACTIVE | PAUSED | COMPLETED | TIMED_OUT | CANCELLED
```

### ArithmeticSettings
```typescript
{
  operations: OperationType[]
  difficulty: Difficulty
  problemCount: number
  timeLimit: number | null
  showImmediateFeedback: boolean
  allowPause: boolean
  showProgress: boolean
  showTimer: boolean
  enableSound: boolean
  useKeypad: boolean
  sessionName?: string
  shuffleProblems: boolean
  repeatIncorrectProblems: boolean
  maxRetries: number
  showCorrectAnswer: boolean
  displaySettings?: {
    fontSize: 'small' | 'medium' | 'large'
    highContrast: boolean
  }
}
```

### ArithmeticProblem
```typescript
{
  id: string
  expression: string
  answer: number
  userAnswer: number | null
  isCorrect: boolean | null
  timeSpent: number
  presentedAt: Date
  answeredAt: Date | null
  operationType: OperationType
  difficulty: Difficulty
  operand1: number
  operand2: number
}
```

### ArithmeticSession
```typescript
{
  id: string
  createdAt: Date
  startTime: Date | null
  endTime: Date | null
  status: SessionStatus
  settings: ArithmeticSettings
  problems: ArithmeticProblem[]
  currentProblemIndex: number
  score: number
  correctAnswers: number
  incorrectAnswers: number
  totalTimeSpent: number
  problemsCompleted: number
  totalProblems: number
  accuracy: number
  averageTimePerProblem: number
  isCompleted: boolean
  isTimedOut: boolean
  notes?: string
}
```

## HTTP Endpoints

### Sessions

#### POST /api/sessions
Creates new session with generated problems.
- Request: `ArithmeticSettings`
- Response: `201 Created` → `ArithmeticSession`
- Problems generated server-side based on settings

#### PUT /api/sessions/:id
Updates session (answer submission, progress tracking).
- Request: `ArithmeticSession` (with updated problems/currentProblemIndex)
- Response: `200 OK` → `ArithmeticSession` (recalculated metrics)
- Recalculates: score, accuracy, averageTimePerProblem, isCompleted
- Auto-transitions to COMPLETED if all problems answered

#### GET /api/sessions
Returns all sessions.
- Response: `200 OK` → `ArithmeticSession[]`

#### GET /api/sessions/:id
Returns single session.
- Response: `200 OK` → `ArithmeticSession`
- `404 Not Found` if id invalid

#### DELETE /api/sessions/:id
Deletes session.
- Response: `204 No Content`

### Session State Transitions

#### POST /api/sessions/:id/start
- Response: `200 OK` → `ArithmeticSession`
- Sets `startTime = now`, `status = ACTIVE`

#### POST /api/sessions/:id/pause
- Response: `200 OK` → `ArithmeticSession`
- Sets `status = PAUSED`

#### POST /api/sessions/:id/resume
- Response: `200 OK` → `ArithmeticSession`
- Sets `status = ACTIVE`

#### POST /api/sessions/:id/complete
- Response: `200 OK` → `ArithmeticSession`
- Sets `endTime = now`, `status = COMPLETED`, `isCompleted = true`

### Settings

#### GET /api/settings
- Response: `200 OK` → `ArithmeticSettings` (or default settings if none saved)

#### PUT /api/settings
- Request: `ArithmeticSettings`
- Response: `200 OK` → `ArithmeticSettings`

## Calculated Fields (Server-Side)
- `score`: count of correct answers
- `accuracy`: (correctAnswers / problemsCompleted) * 100
- `averageTimePerProblem`: totalTimeSpent / problemsCompleted
- `isCompleted`: problemsCompleted === totalProblems
- Session auto-transitions to COMPLETED when all problems answered

## Problem Generation (Server-Side)

### Algorithm
For each of `problemCount` problems:
1. Randomly select operation from `settings.operations`
2. Generate problem based on selected operation and `difficulty`
3. Set `presentedAt = now`, `userAnswer = null`, `isCorrect = null`, `timeSpent = 0`

### Number Ranges by Difficulty
| Difficulty | Range |
|------------|-------|
| EASY | 10-99 (2-digit) |
| MEDIUM | 100-999 (3-digit) |
| HARD | 1000-9999 (4-digit) |

Formula: `Math.floor(Math.random() * (max - min + 1)) + min`

### Operations

**ADDITION**: `a + b = c`
- `a`, `b`: random in difficulty range
- `c`: calculated

**SUBTRACTION**: `a - b = c`
- `a`, `b`: random in difficulty range
- Swap if `a < b` to ensure positive result
- `minuend = max(a, b)`, `subtrahend = min(a, b)`

**MULTIPLICATION** / **DIVISION**: Not implemented (default to ADDITION)

### ID Generation
Problem ID: `problem_${timestamp}_${random}` (random = 9 char base36)

## Date Format
All dates as ISO 8601 strings (e.g., `"2025-01-15T10:30:00.000Z"`)
