export interface DictionaryError {
  message: string;
  statusCode: number;
  errorType: string;
}

export class WordNotFoundError implements DictionaryError {
  message: string;
  statusCode = 404;
  errorType = 'WORD_NOT_FOUND';

  constructor(word: string) {
    this.message = `The word "${word}" was not found in the dictionary.`;
  }
}

export class RateLimitExceededError implements DictionaryError {
  message: string;
  statusCode = 429;
  errorType = 'RATE_LIMIT_EXCEEDED';

  constructor() {
    this.message = 'Too many requests to the dictionary API. Please try again later.';
  }
}

export class DictionaryServiceUnavailableError implements DictionaryError {
  message: string;
  statusCode = 503;
  errorType = 'SERVICE_UNAVAILABLE';

  constructor() {
    this.message = 'The dictionary service is temporarily unavailable. Please try again later.';
  }
}

export class InvalidWordError implements DictionaryError {
  message: string;
  statusCode = 400;
  errorType = 'INVALID_WORD';

  constructor(word: string) {
    this.message = `The word "${word}" is invalid. Please enter a valid English word.`;
  }
}

export class DictionaryApiError implements DictionaryError {
  message: string;
  statusCode: number;
  errorType: string;

  constructor(message: string, statusCode: number, errorType: string) {
    this.message = message;
    this.statusCode = statusCode;
    this.errorType = errorType;
  }
}

export class UnexpectedDictionaryError implements DictionaryError {
  message: string;
  statusCode = 500;
  errorType = 'UNEXPECTED_ERROR';

  constructor(word: string) {
    this.message = `An unexpected error occurred while fetching the word "${word}". Please try again.`;
  }
}