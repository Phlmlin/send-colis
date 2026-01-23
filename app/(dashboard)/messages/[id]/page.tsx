import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ChatWindow } from '@/components/shared/ChatWindow'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'
import { ReviewForm } from '@/components/shared/ReviewForm'
import { payConnectionFee, payTransportFee, releaseFunds } from '@/app/(dashboard)/actions/payments'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function updateStatus(formData: FormData) {
    'use server'
    const id = formData.get('id') as string // L'ID est passé en input hidden ou bind
    const status = formData.get('status') as string

    // Fallback si l'ID n'est pas dans le formData directement mais via bind
    // Mais ici on utilise le formulaire classique, donc ça devrait aller si le champ hidden est présent.
    // Par sécurité, on redéfinit le client ici (Server Action)
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    await supabase.from('transactions').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    revalidatePath(`/messages/${id}`)
}

async function handleConnectionFee(formData: FormData) {
    'use server'
    const transactionId = formData.get('transaction_id') as string
    await payConnectionFee(transactionId)
}

async function handleTransportFee(formData: FormData) {
    'use server'
    const transactionId = formData.get('transaction_id') as string
    await payTransportFee(transactionId)
}

async function handleReleaseFunds(formData: FormData) {
    'use server'
    const transactionId = formData.get('transaction_id') as string
    await releaseFunds(transactionId)
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        pending_approval: { label: 'En attente', bg: 'bg-yellow-100', text: 'text-yellow-700' },
        approved: { label: 'Approuvé', bg: 'bg-blue-100', text: 'text-blue-700' },
        connection_fee_paid: { label: 'Mise en relation payée', bg: 'bg-indigo-100', text: 'text-indigo-700' },
        transport_fee_paid: { label: 'Transport payé', bg: 'bg-purple-100', text: 'text-purple-700' },
        in_transit: { label: 'En transit', bg: 'bg-orange-100', text: 'text-orange-700' },
        delivered: { label: 'Livré', bg: 'bg-green-100', text: 'text-green-700' },
        cancelled: { label: 'Annulé', bg: 'bg-red-100', text: 'text-red-700' },
        disputed: { label: 'Litige', bg: 'bg-red-100', text: 'text-red-700' }
    }
    const style = styles[status as keyof typeof styles] || { label: status, bg: 'bg-gray-100', text: 'text-gray-700' }

    return (
        <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide", style.bg, style.text)}>
            {style.label}
        </span>
    )
}

function UserAvatar({ name, role }: { name: string, role: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-lg shadow-inner">
                {name?.charAt(0) || '?'}
            </div>
            <div>
                <p className="font-bold text-gray-900">{name}</p>
                <p className="text-xs text-blue-600 font-medium uppercase">{role}</p>
            </div>
        </div>
    )
}

export default async function MessagePage({ params }: { params: { id: string } }) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div>Connectez-vous.</div>

    const { data: transaction } = await supabase
        .from('transactions')
        .select(`
      *,
      listing:listing_id (*),
      sender:sender_id (full_name),
      traveler:traveler_id (full_name)
    `)
        .eq('id', params.id)
        .single()

    if (!transaction) return notFound()

    const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('transaction_id', params.id)
        .order('created_at', { ascending: true })

    const isTraveler = user.id === transaction.traveler_id
    const otherPartyName = isTraveler ? transaction.sender?.full_name : transaction.traveler?.full_name
    const myRole = isTraveler ? 'Voyageur' : 'Expéditeur'

    // Steps Logic
    const steps = [
        { id: 'pending_approval', label: 'Demande' },
        { id: 'approved', label: 'Validation' },
        { id: 'payment', label: 'Paiement' },
        { id: 'in_transit', label: 'Voyage' },
        { id: 'delivered', label: 'Livraison' }
    ]

    // Determine current step index (simplified logic)
    let currentStepIndex = 0
    if (['approved', 'connection_fee_paid'].includes(transaction.status)) currentStepIndex = 1
    if (['transport_fee_paid'].includes(transaction.status)) currentStepIndex = 2
    if (['in_transit'].includes(transaction.status)) currentStepIndex = 3
    if (['delivered', 'completed'].includes(transaction.status)) currentStepIndex = 4

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-fade-in">
            {/* Header Card */}
            <div className="glass rounded-3xl overflow-hidden shadow-xl border-blue-50/50">
                {/* Top Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Discussion</h1>
                                <p className="text-blue-100 flex items-center gap-2 text-sm">
                                    <span>#{transaction.id.slice(0, 8)}</span>
                                    <span>•</span>
                                    <span>{transaction.listing.departure_city} → {transaction.listing.arrival_city}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <StatusBadge status={transaction.status} />
                            {transaction.status !== 'pending_approval' && transaction.status !== 'cancelled' && (
                                <a
                                    href={`/api/contracts/${transaction.id}`}
                                    target="_blank"
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-sm font-medium transition-all flex items-center gap-2 border border-white/20"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Contrat PDF
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Bar */}
                <div className="bg-white p-6 border-b border-gray-100 flex flex-wrap gap-8 items-center justify-between">
                    <UserAvatar name={otherPartyName} role={isTraveler ? 'Expéditeur' : 'Voyageur'} />

                    <div className="flex gap-8 text-sm">
                        <div>
                            <p className="text-gray-500 mb-1">Poids</p>
                            <p className="font-bold text-gray-900 text-lg">{transaction.weight_requested} kg</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Montant total</p>
                            <p className="font-bold text-blue-600 text-lg">{transaction.total_price?.toLocaleString()} FCFA</p>
                        </div>
                    </div>
                </div>

                {/* Stepper (Simplified Visual) */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 hidden sm:flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-0 transform -translate-y-1/2"></div>
                    {steps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex
                        const isCurrent = index === currentStepIndex
                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-gray-50 px-2">
                                <div className={cn(
                                    "w-3 h-3 rounded-full border-2 transition-all",
                                    isCompleted ? "bg-blue-600 border-blue-600 scale-125" : "bg-white border-gray-300"
                                )} />
                                <span className={cn(
                                    "text-xs font-medium uppercase tracking-wider",
                                    isCurrent ? "text-blue-600" : "text-gray-400"
                                )}>{step.label}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
                {/* Main Chat */}
                <div className="lg:col-span-2 h-full">
                    <ChatWindow
                        transactionId={transaction.id}
                        initialMessages={messages || []}
                        currentUserId={user.id}
                        otherPartyName={otherPartyName} // New prop for avatar initials in chat
                    />
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <div className="glass rounded-3xl p-6 h-full flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Actions requises
                        </h3>

                        <div className="space-y-4 flex-1">
                            {/* Actions pour le Voyageur */}
                            {isTraveler && transaction.status === 'pending_approval' && (
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-600 mb-2">Acceptez-vous de transporter ce colis de {transaction.weight_requested}kg ?</p>
                                    <form action={updateStatus} className="grid grid-cols-2 gap-3">
                                        <input type="hidden" name="id" value={transaction.id} />
                                        <button name="status" value="approved" className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-green-200">
                                            Accepter
                                        </button>
                                        <button name="status" value="cancelled" className="w-full py-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-medium transition-colors">
                                            Refuser
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Actions pour l'Expéditeur - Paiement Mise en Relation */}
                            {!isTraveler && transaction.status === 'approved' && (
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                    <p className="text-sm font-medium text-blue-900 mb-3">La demande a été acceptée !</p>
                                    <p className="text-xs text-blue-700 mb-4">Payez les frais de mise en relation (5 000 FCFA) pour obtenir les coordonnées du voyageur.</p>
                                    <form action={handleConnectionFee}>
                                        <input type="hidden" name="transaction_id" value={transaction.id} />
                                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Payer 5 000 FCFA</Button>
                                    </form>
                                </div>
                            )}

                            {/* Actions pour l'Expéditeur - Paiement Transport */}
                            {!isTraveler && transaction.status === 'connection_fee_paid' && (
                                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <p className="text-sm font-medium text-indigo-900 mb-3">Paiement du transport</p>
                                    <p className="text-xs text-indigo-700 mb-4">Réglez le montant restant ({transaction.transport_price} FCFA) qui sera séquestré jusqu'à la livraison.</p>
                                    <form action={handleTransportFee}>
                                        <input type="hidden" name="transaction_id" value={transaction.id} />
                                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Payer le transport</Button>
                                    </form>
                                </div>
                            )}

                            {/* Actions Voyageur - Confirmer Prise en charge */}
                            {isTraveler && transaction.status === 'transport_fee_paid' && (
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                    <p className="text-sm font-medium text-orange-900 mb-3">Prêt au départ ?</p>
                                    <form action={updateStatus}>
                                        <input type="hidden" name="id" value={transaction.id} />
                                        <input type="hidden" name="status" value="in_transit" />
                                        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">Confirmer la prise en charge</Button>
                                    </form>
                                </div>
                            )}

                            {/* Actions Expéditeur - Confirmer Livraison */}
                            {!isTraveler && transaction.status === 'in_transit' && (
                                <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                                    <p className="text-sm font-medium text-green-900 mb-3">Avez-vous reçu le colis ?</p>
                                    <form action={handleReleaseFunds}>
                                        <input type="hidden" name="transaction_id" value={transaction.id} />
                                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">Confirmer la réception</Button>
                                    </form>
                                </div>
                            )}

                            {/* Review Form - Si livré */}
                            {transaction.status === 'delivered' && (
                                <div className="mt-4">
                                    <ReviewForm transactionId={transaction.id} targetUserId={isTraveler ? transaction.sender_id : transaction.traveler_id} />
                                </div>
                            )}

                            {transaction.status === 'cancelled' && (
                                <div className="p-4 bg-gray-100 rounded-2xl text-center">
                                    <p className="text-gray-500 text-sm">Cette transaction a été annulée.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
