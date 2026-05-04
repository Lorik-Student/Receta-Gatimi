import { type ActionFunctionArgs, useActionData } from 'react-router-dom'
import { ENV } from "../config/env"
import { FormCard, FormField } from '../components/FormCard';

export async function SignupAction({request}: ActionFunctionArgs ): Promise<Response | any> { 
    const formData = await request.formData();
    const emri = formData.get('firstName');
    const mbiemri = formData.get('lastName');
    const email = formData.get('email');
    const password = formData.get('password');
    const phone_number = formData.get('phoneNumber');

    const response = await fetch(`${ENV.BACKEND_API_URL}/auth/signup`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({emri, mbiemri, email, password, phone_number})
    });

    const responseData = await response.json();
    return responseData;

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