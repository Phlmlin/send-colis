'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Trim les espaces pour éviter les problèmes de copier-coller
    const email = (formData.get('email') as string)?.trim()
    const password = (formData.get('password') as string)?.trim()

    if (!email || !password) {
        redirect('/login?error=Veuillez remplir tous les champs')
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error)
        redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/listings')
}

export async function signup(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Trim les espaces
    const email = (formData.get('email') as string)?.trim()
    const password = (formData.get('password') as string)?.trim()
    const fullName = (formData.get('fullName') as string)?.trim()

    if (!email || !password || !fullName) {
        redirect('/signup?error=Veuillez remplir tous les champs')
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    })

    if (error) {
        console.error('Signup error:', error)
        redirect(`/signup?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/listings')
}

export async function signout() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')
}
