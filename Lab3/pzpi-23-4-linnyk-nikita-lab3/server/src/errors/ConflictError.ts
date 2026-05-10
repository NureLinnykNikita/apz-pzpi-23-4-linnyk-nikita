import { HttpError } from './HttpError.js';

export class ConflictError extends HttpError {
    status = 409;

    constructor(message = 'Conflict') {
        super(message);
    }
}