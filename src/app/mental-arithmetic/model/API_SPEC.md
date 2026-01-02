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

## API Endpoints

### Sessions
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/sessions` | `ArithmeticSettings` | `ArithmeticSession` |
| PUT | `/api/sessions/:id` | `ArithmeticSession` | `ArithmeticSession` |
| GET | `/api/sessions` | - | `ArithmeticSession[]` |
| GET | `/api/sessions/:id` | - | `ArithmeticSession` |
| DELETE | `/api/sessions/:id` | - | `void` |

### Session State Transitions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions/:id/start` | Set startTime, status=ACTIVE |
| POST | `/api/sessions/:id/pause` | status=PAUSED |
| POST | `/api/sessions/:id/resume` | status=ACTIVE |
| POST | `/api/sessions/:id/complete` | endTime, status=COMPLETED |

### Settings
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/settings` | - | `ArithmeticSettings` |
| PUT | `/api/settings` | `ArithmeticSettings` | `ArithmeticSettings` |

## Calculated Fields (Server-Side)
- `score`: count of correct answers
- `accuracy`: (correctAnswers / problemsCompleted) * 100
- `averageTimePerProblem`: totalTimeSpent / problemsCompleted
- `isCompleted`: problemsCompleted === totalProblems
- Session auto-transitions to COMPLETED when all problems answered

## Storage Keys
- Sessions: `arithmetic_sessions`
- Settings: `arithmetic_settings`
