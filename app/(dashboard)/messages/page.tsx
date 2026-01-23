import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // 1. Récupérer toutes les transactions où l'utilisateur est impliqué
    const { data: transactions } = await supabase
        .from('transactions')
        .select(`
      *,
      listing:listing_id (
        departure_city,
        arrival_city,
        departure_date,
        transport_type
      ),
      sender:sender_id (full_name, email, avatar_url),
      traveler:traveler_id (full_name, email, avatar_url)
    `)
        .or(`sender_id.eq.${user.id},traveler_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })

    // 2. Récupérer le dernier message pour chaque transaction
    const transactionIds = transactions?.map((t: any) => t.id) || []

    // On pourrait faire une requête 'messages' globale mais pour bien mapper,
    // on va supposer qu'on peut récupérer le dernier message de chaque transaction
    // Pour éviter N+1 requêtes, on récupère les messages récents de ces transactions
    let lastMessagesMap: Record<string, any> = {}

    if (transactionIds.length > 0) {
        // Cette requête ne donne pas "le dernier par groupe", c'est complexe en SQL simple via API.
        // On va plutôt récupérer TOUS les messages récents de ces transactions (limit 100) et trier en JS
        // C'est un compromis acceptable pour un MVP.
        const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .in('transaction_id', transactionIds)
            .order('created_at', { ascending: false })
        // .limit(100) // On enlève la limite pour être sûr d'avoir le dernier de chaque (si pas trop de volume)

        if (messages) {
            messages.forEach((msg: any) => {
                if (!lastMessagesMap[msg.transaction_id]) {
                    lastMessagesMap[msg.transaction_id] = msg
                }
            })
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="glass rounded-3xl p-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Mes Messages
                        </h1>
                        <p className="text-gray-600 mt-1">Gérez vos échanges avec les voyageurs et expéditeurs</p>
                    </div>
                </div>
            </div>

            {/* Conversations List */}
            {transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                    {transactions.map((tx: any) => {
                        const isTraveler = user.id === tx.traveler_id
                        const otherParty = isTraveler ? tx.sender : tx.traveler
                        const lastMessage = lastMessagesMap[tx.id]

                        // Condition de "Non lu" : Dernier message existe + je suis destinataire + pas lu
                        const isUnread = lastMessage && lastMessage.sender_id !== user.id && !lastMessage.read_at

                        const statusColors = {
                            pending_approval: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                            approved: 'bg-blue-100 text-blue-700 border-blue-200',
                            connection_fee_paid: 'bg-indigo-100 text-indigo-700 border-indigo-200',
                            transport_fee_paid: 'bg-purple-100 text-purple-700 border-purple-200',
                            in_transit: 'bg-orange-100 text-orange-700 border-orange-200',
                            delivered: 'bg-green-100 text-green-700 border-green-200',
                            cancelled: 'bg-red-100 text-red-700 border-red-200',
                        }

                        const statusLabels = {
                            pending_approval: 'En attente',
                            approved: 'Approuvé',
                            connection_fee_paid: 'Frais payés',
                            transport_fee_paid: 'Transport payé',
                            in_transit: 'En transit',
                            delivered: 'Livré',
                            cancelled: 'Annulé',
                        }

                        return (
                            <Link
                                key={tx.id}
                                href={`/messages/${tx.id}`}
                                className={cn(
                                    "block glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden",
                                    isUnread ? "bg-blue-50/50 border-blue-200" : ""
                                )}
                            >
                                {isUnread && (
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full m-3 animate-pulse ring-4 ring-white" />
                                )}

                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        {/* Avatar */}
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 shadow-inner relative">
                                            {otherParty?.avatar_url ? (
                                                <img src={otherParty.avatar_url} alt={otherParty.full_name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <span className="text-xl font-bold text-gray-500">{otherParty?.full_name?.charAt(0) || '?'}</span>
                                            )}

                                            {/* Online status indicator (simulated) */}
                                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className={cn("text-lg text-gray-900 truncate pr-2", isUnread ? "font-bold" : "font-semibold")}>
                                                    {otherParty?.full_name || 'Utilisateur inconnu'}
                                                </h3>
                                                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                                    {new Date(lastMessage?.created_at || tx.updated_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                <span className="font-medium text-gray-700">{tx.listing?.departure_city} → {tx.listing?.arrival_city}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <p className={cn("text-sm truncate max-w-[300px]", isUnread ? "text-gray-900 font-medium" : "text-gray-500")}>
                                                    {lastMessage ? (
                                                        <span>
                                                            {lastMessage.sender_id === user.id ? 'Vous: ' : ''}
                                                            {lastMessage.content}
                                                        </span>
                                                    ) : (
                                                        <span className="italic text-gray-400">Nouvelle transaction créée</span>
                                                    )}
                                                </p>

                                                <span className={cn("ml-auto text-xs px-2 py-0.5 rounded-full border", statusColors[tx.status as keyof typeof statusColors] || 'bg-gray-100')}>
                                                    {statusLabels[tx.status as keyof typeof statusLabels] || tx.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="self-center hidden sm:block">
                                        <div className="bg-gray-50 p-2 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                <div className="glass rounded-3xl p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune conversation</h3>
                    <p className="text-gray-600 mb-6">
                        Les conversations apparaissent lorsque vous demandez à envoyer un colis ou qu'un expéditeur vous contacte.
                    </p>
                    <Link href="/listings" className={cn(buttonVariants(), "bg-gradient-to-r from-blue-600 to-indigo-600")}>
                        Parcourir les annonces
                    </Link>
                </div>
            )}
        </div>
    )
}
