import {HttpError} from "./HttpError.js";

export class UnauthorizedError extends HttpError {
    status = 401;

    constructor(message = 'Unauthorized') {
        super(message);
    }
}