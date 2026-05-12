import React from "react";
import { type ActionFunctionArgs, useActionData, Link, Form } from 'react-router-dom'
import { apiFetch, ErrorPayload, SuccessPayload } from '../api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

function hasInvalidInputs(formData: FormData): ErrorPayload | null {
  const emriRe = /^[A-Za-z]{2,}$/;
  const emailRe = /^[\w.-]+@[\w.-]+\.\w+$/;
  const passwordRe = /^.{9,}$/;
  const phoneRe = /^\+?\d{10,15}$/;

  if (!emriRe.test(formData.get("firstName") as string)) return { success: false, error: { code: "INVALID_FIRST_NAME", message: "Emri nuk është i saktë" } };
  if (!emriRe.test(formData.get("lastName") as string)) return { success: false, error: { code: "INVALID_LAST_NAME", message: "Mbiemri nuk është i saktë" } };
  if (!emailRe.test(formData.get("email") as string)) return { success: false, error: { code: "INVALID_EMAIL", message: "Emaili nuk është i vlefshëm" } };
  if (!passwordRe.test(formData.get("password") as string)) return { success: false, error: { code: "INVALID_PASSWORD", message: "Fjalëkalimi është shumë i thjeshtë" } };
  if (formData.get("phoneNumber") && !phoneRe.test(formData.get("phoneNumber") as string)) return { success: false, error: { code: "INVALID_PHONE_NUMBER", message: "Numri jo i vlefshëm" } };
  if (formData.get("password") !== formData.get("confirmPassword")) return { success: false, error: { code: "PASSWORD_MISMATCH", message: "Fjalëkalimet nuk përputhen" } };
  return null;
}

export async function SignupAction({ request }: ActionFunctionArgs): Promise<Response | any> {
  const formData = await request.formData();
  const invalidInputs = hasInvalidInputs(formData);
  if (invalidInputs) return invalidInputs;

  const result = await apiFetch("/auth/signup", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emri: formData.get("firstName"),
      mbiemri: formData.get("lastName"),
      email: formData.get("email"),
      password: formData.get("password"),
      phone_number: formData.get("phoneNumber"),
    }),
  });

  if (!result.ok) return result as ErrorPayload;

  const successPayload = result as SuccessPayload;
  localStorage.setItem("accessToken", successPayload.accessToken as string);
  localStorage.setItem("refreshToken", successPayload.refreshToken as string);
  window.location.href = "/";
  return null;
}

export function SignupPage() {
  const actionData = useActionData() as any;

  const isError = (code: string) => actionData?.error?.code === code;

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Header brand="Receta Gatimi" />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex bg-primary/10 p-3 rounded-full mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">person_add</span>
            </div>
            <h2 className="font-display-sm text-on-surface">Krijo një llogari</h2>
            <p className="font-body-md text-on-surface-variant mt-2">Bashkohu me ne për të ruajtur dhe ndarë recetat e tua të preferuara</p>
          </div>

            <Form method="post" className="space-y-5">
            {isError("SIGNUP_FAILED") && (
              <div className="bg-error/10 text-error px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">error</span>
                {actionData?.error?.message}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-label-md text-on-surface mb-2">Emri</label>
                <input type="text" name="firstName" required className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Emri" />
                {isError("INVALID_FIRST_NAME") && <p className="text-error text-xs mt-1">{actionData.error.message}</p>}
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-2">Mbiemri</label>
                <input type="text" name="lastName" required className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Mbiemri" />
                {isError("INVALID_LAST_NAME") && <p className="text-error text-xs mt-1">{actionData.error.message}</p>}
              </div>
            </div>

            <div>
              <label className="block font-label-md text-on-surface mb-2">Adresa e emailit</label>
              <input type="email" name="email" required className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="you@example.com" />
              {isError("INVALID_EMAIL") && <p className="text-error text-xs mt-1">{actionData.error.message}</p>}
            </div>

            <div>
              <label className="block font-label-md text-on-surface mb-2">Numri i telefonit</label>
              <input type="tel" name="phoneNumber" className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="+355 6x xx xx xxx" />
              {isError("INVALID_PHONE_NUMBER") && <p className="text-error text-xs mt-1">{actionData.error.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-label-md text-on-surface mb-2">Fjalëkalimi</label>
                <input type="password" name="password" required className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Të paktën 8 karaktere" />
                {isError("INVALID_PASSWORD") && <p className="text-error text-xs mt-1">{actionData.error.message}</p>}
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-2">Konfirmo fjalëkalimin</label>
                <input type="password" name="confirmPassword" required className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Përsërite fjalëkalimin" />
                {isError("PASSWORD_MISMATCH") && <p className="text-error text-xs mt-1">{actionData.error.message}</p>}
              </div>
            </div>

            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-label-lg py-3 rounded-xl transition-colors shadow-md mt-6">
              Krijo llogari
            </button>
          </Form>

          <div className="mt-8 text-center border-t border-outline-variant/30 pt-6">
            <p className="text-on-surface-variant font-body-sm">
              Keni tashmë një llogari?{" "}
              <Link to="/login" className="text-primary font-label-md hover:underline">
                Hyr
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
