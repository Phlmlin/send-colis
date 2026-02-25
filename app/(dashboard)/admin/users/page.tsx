import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function verifyUser(formData: FormData) {
    'use server'
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const userId = formData.get('user_id') as string
    const action = formData.get('action') as 'verify' | 'reject'

    await supabase
        .from('profiles')
        .update({
            verification_status: action === 'verify' ? 'verified' : 'rejected',
            id_verified: action === 'verify',
            verification_date: action === 'verify' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)

    revalidatePath('/admin/users')
}

async function suspendUser(formData: FormData) {
    'use server'
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const userId = formData.get('user_id') as string
    const action = formData.get('action') as 'suspend' | 'activate'

    await supabase
        .from('profiles')
        .update({
            account_status: action === 'suspend' ? 'suspended' : 'active',
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)

    revalidatePath('/admin/users')
}

export default async function AdminUsersPage() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') return redirect('/dashboard')

    // Récupérer tous les utilisateurs
    const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    const pendingVerification = users?.filter(u => u.verification_status === 'pending') || []
    const verifiedUsers = users?.filter(u => u.verification_status === 'verified') || []
    const otherUsers = users?.filter(u => !u.verification_status || u.verification_status === 'rejected') || []

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="glass rounded-3xl p-8 bg-gradient-to-r from-slate-50 to-blue-50 border-blue-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Gestion des utilisateurs
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {users?.length || 0} utilisateurs au total • {pendingVerification.length} en attente
                        </p>
                    </div>
                </div>
            </div>

            {/* En attente de vérification */}
            {pendingVerification.length > 0 && (
                <div className="glass rounded-3xl p-8 border-2 border-amber-200 bg-amber-50/50 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center animate-pulse">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-amber-900">
                            En attente de vérification ({pendingVerification.length})
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 relative z-10">
                        {pendingVerification.map((user) => (
                            <div key={user.id} className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 flex flex-col justify-between">
                                <div className="mb-4">
                                    <h3 className="font-bold text-lg text-gray-900">{user.full_name}</h3>
                                    <p className="text-gray-500 text-sm">{user.email}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md text-gray-600">
                                            {user.id_document_type || 'Type inconnu'}
                                        </span>
                                        {user.id_document_url && (
                                            <a
                                                href={user.id_document_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Voir le document
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <form action={verifyUser} className="flex-1">
                                        <input type="hidden" name="user_id" value={user.id} />
                                        <input type="hidden" name="action" value="verify" />
                                        <Button type="submit" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                            Valider
                                        </Button>
                                    </form>
                                    <form action={verifyUser} className="flex-1">
                                        <input type="hidden" name="user_id" value={user.id} />
                                        <input type="hidden" name="action" value="reject" />
                                        <Button type="submit" size="sm" variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                                            Rejeter
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Liste des utilisateurs */}
            <div className="glass rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Utilisateurs vérifiés ({verifiedUsers.length})
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-200">
                                <th className="pb-3 text-sm font-semibold text-gray-500">Utilisateur</th>
                                <th className="pb-3 text-sm font-semibold text-gray-500">Stats</th>
                                <th className="pb-3 text-sm font-semibold text-gray-500">Statut</th>
                                <th className="pb-3 text-sm font-semibold text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {verifiedUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-gray-50/50">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                                {user.full_name?.charAt(0) || user.email?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{user.full_name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1" title="Note moyenne">
                                                ⭐ {user.average_rating?.toFixed(1) || 'N/A'}
                                            </span>
                                            <span className="flex items-center gap-1" title="Livraisons effectuées">
                                                📦 {user.total_shipments_delivered || 0}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${user.account_status === 'active'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : user.account_status === 'suspended'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {user.account_status === 'active' ? 'Actif' : user.account_status === 'suspended' ? 'Suspendu' : user.account_status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <form action={suspendUser}>
                                            <input type="hidden" name="user_id" value={user.id} />
                                            <input type="hidden" name="action" value={user.account_status === 'active' ? 'suspend' : 'activate'} />
                                            <Button
                                                type="submit"
                                                size="sm"
                                                variant="ghost"
                                                className={user.account_status === 'active' ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}
                                            >
                                                {user.account_status === 'active' ? 'Bloquer' : 'Débloquer'}
                                            </Button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Autres utilisateurs */}
            {otherUsers.length > 0 && (
                <div className="glass rounded-3xl p-8 opacity-80">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Autres utilisateurs ({otherUsers.length})</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {otherUsers.map((user) => (
                            <div key={user.id} className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs font-bold">
                                    {user.full_name?.charAt(0) || '?'}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-medium text-sm truncate">{user.full_name}</div>
                                    <div className="text-xs text-gray-400">
                                        {user.verification_status === 'rejected' ? '🔴 KYC Rejeté' : '⚪ Non vérifié'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
