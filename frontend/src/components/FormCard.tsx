import { Form } from 'react-router-dom'
import './FormCard.css'

interface FormCardProps extends React.FormHTMLAttributes<HTMLFormElement>{ 
    title: string,
    children: React.ReactNode,
    submitionError?: string,
}

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> { 
    error?: string,
}

export function FormCard({ title, children, submitionError, ...props }: FormCardProps) { 
    return ( 
        <div className="form-card-container">
            <Form method="post" className={`form-card ${props.className ?? ""}`}>
                <h2 className="form-card-title">{title}</h2>
                {children}

                {submitionError && <div className="error-message">{submitionError}</div>}
                <button type="submit">Dërgo</button>
            </Form>

        </div>
    )
}

export function FormField({error, ...props}: FormFieldProps) { 
    return (
        <>
            <input {...props} />
            {error && <div className="error-message">{error}</div>}
        </>
    );
}