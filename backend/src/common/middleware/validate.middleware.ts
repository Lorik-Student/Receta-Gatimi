import type { RequestHandler } from "express";
import type { ZodIssue, ZodTypeAny } from "zod";
import { HttpError } from "../errors/http-error.js";

type RequestSchema = {
    body?: ZodTypeAny;
    params?: ZodTypeAny;
    query?: ZodTypeAny;
};

type ValidatedPart = "body" | "params" | "query";

function formatIssues(part: ValidatedPart, issues: ZodIssue[]) {
    return issues.map((issue) => ({
        part,
        path: issue.path.join("."),
        message: issue.message,
        code: issue.code
    }));
}

async function parsePart(part: ValidatedPart, schema: ZodTypeAny, value: unknown) {
    const result = await schema.safeParseAsync(value);
    if (!result.success) {
        throw new HttpError(400, "Request validation failed", {
            code: "VALIDATION_ERROR",
            details: formatIssues(part, result.error.issues)
        });
    }

    return result.data;
}

export function validate(schema: RequestSchema): RequestHandler {
    return async (req, _res, next) => {
        try {
            if (schema.body) {
                req.body = await parsePart("body", schema.body, req.body);
            }
            if (schema.params) {
                req.params = await parsePart("params", schema.params, req.params) as any;
            }
            if (schema.query) {
                req.query = await parsePart("query", schema.query, req.query) as any;
            }
            next();
        } catch (error) {
            next(error);
        }
    };
}