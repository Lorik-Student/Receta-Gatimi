type HttpErrorOptions = {
    details?: unknown;
    expose?: boolean;
};

export class HttpError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown;
    readonly expose: boolean;

    constructor(statusCode: number, code: string, message: string, options: HttpErrorOptions = {}) {
        super(message);
        this.name = "HttpError";
        this.statusCode = statusCode;
        this.code = code;
        this.details = options.details;
        this.expose = options.expose ?? statusCode < 500;
    }
}

export class BadRequestError extends HttpError {
    constructor(code: string = "BAD_REQUEST", message: string = "Kërkesa e pasaktë.", options: HttpErrorOptions = {}) {
        super(400, code, message, { ...options });
    }
}

export class UnauthorizedError extends HttpError { 
    constructor(code: string = "UNAUTHORIZED", message: string = "Autentifikimi i nevojshëm.", options: HttpErrorOptions = {}) { 
        super(401, code, message, { ...options });
    }
}

export class ForbiddenError extends HttpError {
    constructor(code: string = "FORBIDDEN", message: string = "Ju nuk keni leje për të përdorur këtë resurs.", options: HttpErrorOptions = {}) {
        super(403, code, message, { ...options });
    }
}

export class NotFoundError extends HttpError { 
    constructor(code: string = "ROUTE_NOT_FOUND", message: string = "Rruga nuk u gjet.", options: HttpErrorOptions = {}) {
        super(404, code, message, { ...options })
    }
}

export class ConflictError extends HttpError {
    constructor(code: string = "CONFLICT", message: string = "Ndodhi një konflikt.", options: HttpErrorOptions = {}) {
        super(409, code, message, { ...options });
    }
}

export class InternalServerError extends HttpError {
    constructor(code: string = "INTERNAL_SERVER_ERROR", message: string = "Ndodhi një gabim i papritur.", options: HttpErrorOptions = {}) {
        super(500, code, message, { ...options, expose: false });
    }
}