import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function resolveDispute(formData: FormData) {
    'use server'
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const disputeId = formData.get('dispute_id') as string
    const resolution = formData.get('resolution') as string

    await supabase
        .from('disputes')
        .update({
            status: 'resolved',
            resolution,
            resolved_by: user.id,
            resolved_at: new Date().toISOString()
        })
        .eq('id', disputeId)

    revalidatePath('/admin/disputes')
}

export default async function AdminDisputesPage() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') return redirect('/dashboard')

    const { data: openDisputes } = await supabase
        .from('disputes')
        .select(`
      *,
      transaction:transaction_id (*),
      reporter:reported_by (full_name, email)
    `)
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false })

    const { data: resolvedDisputes } = await supabase
        .from('disputes')
        .select(`
      *,
      transaction:transaction_id (*),
      reporter:reported_by (full_name),
      resolver:resolved_by (full_name)
    `)
        .eq('status', 'resolved')
        .order('resolved_at', { ascending: false })
        .limit(20)

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Gestion des litiges</h1>

            {/* Litiges ouverts */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-red-900">
                    🚨 Litiges ouverts ({openDisputes?.length || 0})
                </h2>

                {openDisputes && openDisputes.length > 0 ? (
                    <div className="space-y-4">
                        {openDisputes.map((dispute: any) => (
                            <div key={dispute.id} className="bg-white rounded-lg p-4 border border-red-200">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="font-semibold text-red-900">{dispute.reason}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Signalé par: {dispute.reporter?.full_name} ({dispute.reporter?.email})
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(dispute.created_at).toLocaleString('fr-FR')}
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                        {dispute.status}
                                    </span>
                                </div>

                                <div className="bg-gray-50 p-3 rounded text-sm mb-3">
                                    <strong>Description:</strong>
                                    <p className="mt-1">{dispute.description || 'Aucune description fournie'}</p>
                                </div>

                                <div className="text-xs text-gray-600 mb-3">
                                    <strong>Transaction ID:</strong> {dispute.transaction_id}
                                </div>

                                <form action={resolveDispute} className="flex gap-2">
                                    <input type="hidden" name="dispute_id" value={dispute.id} />
                                    <Input
                                        name="resolution"
                                        placeholder="Résolution du litige..."
                                        required
                                        className="flex-1"
                                    />
                                    <Button type="submit" className="bg-green-600">Résoudre</Button>
                                </form>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-600">Aucun litige ouvert.</p>
                )}
            </div>

            {/* Litiges résolus */}
            <div className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">✓ Litiges résolus (derniers 20)</h2>
                <div className="space-y-2">
                    {resolvedDisputes?.map((dispute: any) => (
                        <div key={dispute.id} className="py-3 border-b last:border-0">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="font-medium">{dispute.reason}</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        <strong>Résolution:</strong> {dispute.resolution}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Résolu par {dispute.resolver?.full_name} le {new Date(dispute.resolved_at).toLocaleDateString('fr-FR')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
