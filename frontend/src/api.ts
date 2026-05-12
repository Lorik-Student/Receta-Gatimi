export const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3000/api") as string;

export interface ErrorPayload { 
    success: boolean
    error: { 
        code: string,
        message: string,
        details?: unknown
    } 
}

export interface SuccessPayload { 
    success: boolean
    [key: string]: unknown;
}

export type ApiPayload = ErrorPayload | SuccessPayload;

export type ApiResult = ApiPayload & {
    ok: boolean;
    response: Response;
};

export const apiFetch = async (path: string, init: RequestInit = {}): Promise<ApiResult> => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    const urlString = `${API_BASE_URL}${normalizedPath}`;
    const url = new URL(urlString);
    
    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type")) { 
        headers.set("Content-Type", "application/json")
    }

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) 
        headers.set("Authorization", "Bearer " + accessToken)

    const response = await fetch(url, {...init, headers});
    const payload: ApiPayload = await response.json();

    if (!payload.success && 'error' in payload) {
        const errorPayload = payload as ErrorPayload;
        switch (errorPayload.error.code) {
            case "TOKEN_EXPIRED":
                const refreshToken = localStorage.getItem("refreshToken");
                if (refreshToken) { 
                    const refreshUrl = `${API_BASE_URL}/auth/refresh`;
                    const refreshResponse = await fetch(refreshUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Refresh-Token": refreshToken
                        },
                    });

                    if (refreshResponse.ok) {
                        const refreshData = await refreshResponse.json();
                        
                        localStorage.setItem("accessToken", refreshData.accessToken);
                        localStorage.setItem("refreshToken", refreshData.refreshToken);

                        return apiFetch(path, init);
                    }
                }   
            case "TOKEN_MISSING":
            case "TOKEN_INVALID":
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");

                window.location.href = "/login";

                return { ...payload, response, ok: false };
        }
    }

    return { ...payload, response, ok: response.ok };
}