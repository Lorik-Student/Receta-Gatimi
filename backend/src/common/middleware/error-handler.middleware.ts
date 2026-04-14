import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../errors/http-error.js";

type ErrorPayload = {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
};

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
    next(new HttpError(404, "Route not found", { code: "ROUTE_NOT_FOUND" }));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof HttpError) {
        const payload: ErrorPayload = {
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.details
            }
        };

        return res.status(error.statusCode).json(payload);
    }

    console.error("Unhandled error:", error);

    const isDev = process.env.NODE_ENV !== "production";
    const diagnostics = isDev
        ? {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }
        : undefined;

    return res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Unexpected server error",
            details: diagnostics
        }
    } satisfies ErrorPayload);
};
