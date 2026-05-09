export abstract class HttpError extends Error {
    abstract status: number;

    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}