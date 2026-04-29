import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../http-errors.js";
import type { RequestWithClaims } from "./auth.middleware.js";

type ErrorPayload = {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    const claims = (_req as RequestWithClaims).claims;
    if (error instanceof HttpError || claims?.roles?.includes("admin")) {
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

    return res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Unexpected server error",
        }
    } satisfies ErrorPayload);
};
