import { ActionFunctionArgs, redirect, useActionData, useLoaderData } from "react-router-dom"
import { ENV } from "../config/env"
import { regex } from 'regex'
import { FormCard, FormField } from "../components/FormCard"


export async function LoginAction({request}: ActionFunctionArgs ): Promise<Response | any> { 
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const emailRe = /^[\w.-]+@[\w.-]+\.\w+$/;
    // const passwordRe = /^(?=.*\d)(?=.*[A-Z!@#$%^&*.]).{9,}$/;
    const passwordRe = /^.{9,}$/; 

    if(!emailRe.test(email)) { 
        return {error: { 
            code: "INVALID_EMAIL",
            message: "Ju lutem vendosni një email të vlefshëm."
        }};
     }
    if (!passwordRe.test(password)) { 
         return {error: {
                 code: "WEAK_PASSWORD",
                 message: "Fjalëkalimi duhet të jetë të paktën 9 karaktere, përfshirë një numër dhe një shkronjë të madhe ose simbol."
        }};
    }

    const response = await fetch(`${ENV.BACKEND_API_URL}/auth/login`, {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password,
        })
    });

    const responseData = await response.json();
    if (!response.ok) { 
        return responseData;
    }

    return redirect("/");

}

export  function LoginPage() { 
    const actionData = useActionData();

    const isEmailError = actionData?.error?.code === "INVALID_EMAIL";
    const isPasswordError = actionData?.error?.code === "WEAK_PASSWORD";
    const isSubmissionError = actionData?.error?.code == "INVALID_CREDENTIALS";
    
    return (
        <FormCard title="Login" submitionError={isSubmissionError ? actionData?.error?.message : undefined}>

            <FormField 
                type="email" 
                name="email" 
                placeholder="Email" 
                required 
                error={isEmailError ? actionData.error.message : undefined}
            />
            <FormField 
                type="password" 
                name="password" 
                placeholder="Password" 
                required 
                error={isPasswordError ? actionData.error.message : undefined}
            />
        </FormCard>
    );
}