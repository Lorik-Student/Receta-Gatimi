type HttpErrorOptions = {
    code?: string;
    details?: unknown;
    expose?: boolean;
};

export class HttpError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown;
    readonly expose: boolean;

    constructor(statusCode: number, message: string, options: HttpErrorOptions = {}) {
        super(message);
        this.name = "HttpError";
        this.statusCode = statusCode;
        this.code = options.code ?? "HTTP_ERROR";
        this.details = options.details;
        this.expose = options.expose ?? statusCode < 500;
    }
}
