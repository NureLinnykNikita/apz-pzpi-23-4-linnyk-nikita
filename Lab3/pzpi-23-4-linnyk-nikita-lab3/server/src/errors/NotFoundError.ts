import {HttpError} from "./HttpError.js";

export class NotFoundError extends HttpError {
    status = 404;

    constructor(message = 'Not found') {
        super(message);
    }
}