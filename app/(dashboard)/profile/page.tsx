import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function updateProfile(formData: FormData) {
    'use server'

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string

    await supabase
        .from('profiles')
        .update({
            full_name,
            phone,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
}

export default async function ProfilePage() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const getVerificationBadge = () => {
        switch (profile?.verification_status) {
            case 'verified':
                return (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Vérifié</span>
                    </div>
                )
            case 'pending':
                return (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-700">
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="font-medium">En attente</span>
                    </div>
                )
            default:
                return (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="font-medium">Non vérifié</span>
                    </div>
                )
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="glass rounded-3xl p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900">{profile?.full_name || 'Utilisateur'}</h1>
                        <p className="text-gray-600 mt-1">{user.email}</p>
                        <div className="mt-3">
                            {getVerificationBadge()}
                        </div>
                    </div>

                    {/* Rating */}
                    {profile?.average_rating > 0 && (
                        <div className="glass p-6 rounded-2xl text-center">
                            <div className="flex items-center gap-2 text-3xl font-bold text-yellow-600">
                                <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20">
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                                {profile.average_rating.toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Note moyenne</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{profile?.total_shipments_sent || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Colis envoyés</div>
                </div>

                <div className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{profile?.total_shipments_delivered || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Colis livrés</div>
                </div>

                <div className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{((profile?.total_shipments_sent || 0) + (profile?.total_shipments_delivered || 0))}</div>
                    <div className="text-sm text-gray-600 mt-1">Total transactions</div>
                </div>
            </div>

            {/* Forms */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="glass rounded-3xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Informations personnelles</h2>
                    <form action={updateProfile} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nom complet</label>
                            <Input
                                name="full_name"
                                defaultValue={profile?.full_name || ''}
                                required
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Téléphone</label>
                            <Input
                                name="phone"
                                type="tel"
                                defaultValue={profile?.phone || ''}
                                placeholder="+241 XX XX XX XX"
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <Input
                                value={profile?.email || ''}
                                disabled
                                className="bg-gray-50 h-12"
                            />
                        </div>
                        <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600">
                            Sauvegarder
                        </Button>
                    </form>
                </div>

                {/* KYC */}
                <div className="glass rounded-3xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Vérification d'identité</h2>

                    {profile?.verification_status !== 'verified' ? (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-blue-900 mb-2">Pourquoi vérifier ?</h3>
                                        <p className="text-sm text-blue-800">
                                            Renforcez la confiance et accédez à toutes les fonctionnalités
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Link href="/profile/verify" className={cn(buttonVariants(), "w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600")}>
                                Vérifier mon identité
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-900">Identité vérifiée</h3>
                                    <p className="text-sm text-green-700">
                                        Vérifié le {new Date(profile.verification_date!).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
