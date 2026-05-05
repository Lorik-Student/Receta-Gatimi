import { type ActionFunctionArgs, redirect, useActionData } from 'react-router-dom'
import { ENV } from "../config/env"
import { FormCard, FormField } from '../components/FormCard';
import { apiFetch, ErrorPayload } from '../api';

function hasInvalidInputs(formData: FormData): ErrorPayload | null {
    const emriRe = /^[A-Za-z]{2,}$/;
    const mbiemriRe = /^[A-Za-z]{2,}$/;
    const emailRe = /^[\w.-]+@[\w.-]+\.\w+$/;
    const passwordRe = /^.{9,}$/; 
    const phoneRe = /^\+?\d{10,15}$/;

    if (!emriRe.test(formData.get("firstName") as string)) { 
        return {success: false, error: { 
            code: "INVALID_FIRST_NAME", 
            message: "Emri është i pavlefshëm"
        }};
    }

    if (!mbiemriRe.test(formData.get("lastName") as string)) { 
        return {success: false, error: { 
            code: "INVALID_LAST_NAME", 
            message: "Mbiemri është i pavlefshëm"
        }};
    }

    if (!emailRe.test(formData.get("email") as string)) { 
        return {success: false, error: { 
            code: "INVALID_EMAIL", 
            message: "Emaili është i pavlefshëm"
        }};
    }

    if (!passwordRe.test(formData.get("password") as string)) { 
        return {success: false, error: { 
            code: "INVALID_PASSWORD", 
            message: "Fjalëkalimi është i pavlefshëm"
        }};
    }

    if (!phoneRe.test(formData.get("phoneNumber") as string)) { 
        return {success: false, error: { 
            code: "INVALID_PHONE_NUMBER", 
            message: "Numri i telefonit është i pavlefshëm"
        }};
    }

    return null;
}

export async function SignupAction({request}: ActionFunctionArgs ): Promise<Response | any> { 
    const formData = await request.formData();
    const emri = formData.get('firstName');
    const mbiemri = formData.get('lastName');
    const email = formData.get('email');
    const password = formData.get('password');
    const phone_number = formData.get('phoneNumber');

    const invalidInputs = hasInvalidInputs(formData);
    if (invalidInputs) {
        return invalidInputs;
    }

    const result = await apiFetch('/auth/signup', {
        method: 'post',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({emri, mbiemri, email, password, phone_number})
    });

    if (!result.success) {
        return result as ErrorPayload;
    }
    console.log("Signup successful:", result);
    return redirect("/");

} 

export function SignupPage() {
    const actionData = useActionData();
    
    const isFirstNameError = actionData?.error?.code === "INVALID_FIRST_NAME";
    const isLastNameError = actionData?.error?.code === "INVALID_LAST_NAME";
    const isEmailError = actionData?.error?.code === "INVALID_EMAIL";
    const isPhoneNumberError = actionData?.error?.code === "INVALID_PHONE_NUMBER";
    const isPasswordError = actionData?.error?.code === "INVALID_PASSWORD";
    const isConfirmPasswordError = actionData?.error?.code === "PASSWORD_MISMATCH";
    const isSubmissionError = actionData?.error?.code === "SIGNUP_FAILED";

    return (
        <FormCard title="Sign Up" submitionError={isSubmissionError ? actionData.error.message : ""}>
            <FormField 
                type="text"
                name="firstName"
                placeholder="Emri"
                error={isFirstNameError? actionData.error.message: ""}
                required />
            <FormField 
                type="text"
                name="lastName"
                placeholder="Mbiemri"
                error={isLastNameError? actionData.error.message : ""}
                required />
            <FormField 
                type="email"
                name="email"
                placeholder="Emaili"
                error={isEmailError? actionData.error.message: ""}
                required/>
            <FormField
                type="password"
                name="password"
                placeholder="Fjalëkalimi"
                error={isPasswordError? actionData.error.message: ""}
                required />
            <FormField
                type="password"
                name="confirmPassword"
                placeholder="Konfirmo Fjalëkalimin"
                error={isConfirmPasswordError? actionData.error.message: ""}
                required />
            <FormField
                type="tel"
                name="phoneNumber"
                placeholder="Numri i telefonit"
                error={isPhoneNumberError? actionData.error.message: ""}
                required />
            <span>{actionData?.success ? actionData.message + " " + actionData.user.emri : undefined}</span>
        </FormCard>
    );
}