import React from "react";
import { ActionFunctionArgs, useActionData, Link, Form } from "react-router-dom"
import { apiFetch, SuccessPayload } from "../api";
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export async function LoginAction({ request }: ActionFunctionArgs): Promise<Response | any> {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const emailRe = /^[\w.-]+@[\w.-]+\.\w+$/;
  const passwordRe = /^.{8,}$/;

  if (!emailRe.test(email)) {
    return {
      error: {
        code: "INVALID_EMAIL",
        message: "Ju lutem vendosni një email të vlefshëm.",
      },
    };
  }

  if (!passwordRe.test(password)) {
    return {
      error: {
        code: "WEAK_PASSWORD",
        message: "Fjalëkalimi duhet të përmbajë të paktën 8 karaktere.",
      },
    };
  }

  const result = await apiFetch(`/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!result.ok) {
    return result;
  }

  const successPayload = result as SuccessPayload;
  localStorage.setItem("accessToken", successPayload.accessToken as string);
  localStorage.setItem("refreshToken", successPayload.refreshToken as string);

  window.location.href = "/";
  return null;
}

export function LoginPage() { 
    const actionData = useActionData() as any;

    const isEmailError = actionData?.error?.code === "INVALID_EMAIL";
    const isPasswordError = actionData?.error?.code === "WEAK_PASSWORD";
    const isSubmissionError = actionData?.error?.code == "INVALID_CREDENTIALS";
    
    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
            <Header brand="Receta Gatimi" />
            <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex bg-primary/10 p-3 rounded-full mb-4">
                             <span className="material-symbols-outlined text-primary text-3xl">login</span>
                        </div>
                        <h2 className="font-display-sm text-on-surface">Mirë se u rikthyet</h2>
                        <p className="font-body-md text-on-surface-variant mt-2">Ju lutem hyni në llogarinë tuaj për të vazhduar</p>
                    </div>

                    <Form method="post" className="space-y-6">
                        {isSubmissionError && (
                            <div className="bg-error/10 text-error px-4 py-3 rounded-xl text-sm font-label-md flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">error</span>
                                {actionData?.error?.message || "Kredenciale të pavlefshme."}
                            </div>
                        )}
                        <div>
                            <label className="block font-label-md text-on-surface mb-2">Adresa e emailit</label>
                            <input 
                                type="email" 
                                name="email" 
                                required
                                className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                placeholder="you@example.com"
                            />
                            {isEmailError && <p className="text-error text-xs mt-1">{actionData.error.message}</p>}
                        </div>

                        <div>
                            <label className="block font-label-md text-on-surface mb-2">Fjalëkalimi</label>
                            <input 
                                type="password" 
                                name="password" 
                                required
                                className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                placeholder="Fjalëkalimi juaj"
                            />
                            {isPasswordError && <p className="text-error text-xs mt-1">{actionData.error.message}</p>}
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary/90 text-white font-label-lg py-3 rounded-xl transition-colors shadow-md mt-4"
                        >
                            Hyr
                        </button>
                    </Form>

                    <div className="mt-8 text-center border-t border-outline-variant/30 pt-6">
                        <p className="text-on-surface-variant font-body-sm">
                            Nuk keni një llogari?{' '}
                            <Link to="/signup" className="text-primary font-label-md hover:underline">
                                Regjistrohu tani
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
