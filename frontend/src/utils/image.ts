import { API_BASE_URL } from "../api";

function isAbsoluteImageSource(value: string) {
    return /^https?:\/\//i.test(value) || /^data:/i.test(value) || /^blob:/i.test(value);
}

export function resolveImageSrc(value?: string | null): string | undefined {
    const source = value?.trim();
    if (!source) {
        return undefined;
    }

    if (isAbsoluteImageSource(source)) {
        return source;
    }

    try {
        return new URL(source, API_BASE_URL).toString();
    } catch {
        return source;
    }
}