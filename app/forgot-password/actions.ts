'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function resetPassword(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string

    if (!email) {
        redirect('/forgot-password?message=Please enter your email address')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`,
    })

    if (error) {
        redirect('/forgot-password?message=Could not send reset email. Please try again.')
    }

    redirect('/forgot-password?message=Check your email for a password reset link')
}
