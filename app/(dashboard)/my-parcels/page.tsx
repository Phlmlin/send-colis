import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TransportIcon } from '@/components/TransportIcon'

export const dynamic = 'force-dynamic'

export default async function MyParcelsPage() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

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
      traveler:traveler_id (full_name, email)
    `)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })

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
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="glass rounded-3xl p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Mes Colis
                            </h1>
                            <p className="text-gray-600 mt-1">Suivez vos envois</p>
                        </div>
                    </div>
                    <Link href="/listings" className={cn(buttonVariants(), "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg")}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Trouver un voyageur
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-4 gap-4">
                <div className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{transactions?.filter(t => t.status === 'pending_approval').length || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">En attente</div>
                </div>

                <div className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{transactions?.filter(t => t.status === 'in_transit').length || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">En transit</div>
                </div>

                <div className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{transactions?.filter(t => t.status === 'delivered').length || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Livrés</div>
                </div>

                <div className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{transactions?.length || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Total</div>
                </div>
            </div>

            {/* Transactions */}
            {transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                    {transactions.map((tx: any, index: number) => (
                        <div
                            key={tx.id}
                            className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                {/* Main Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start gap-4">
                                        {/* Transport Icon */}
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            <TransportIcon type={tx.listing?.transport_type} className="w-7 h-7 text-blue-600" />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900">{tx.listing?.departure_city}</h3>
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                                <h3 className="text-xl font-bold text-gray-900">{tx.listing?.arrival_city}</h3>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    {tx.traveler?.full_name || tx.traveler?.email}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {new Date(tx.listing?.departure_date).toLocaleDateString('fr-FR')}
                                                </span>
                                                <span className={cn("px-3 py-1 rounded-full text-xs font-medium border-2", statusColors[tx.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700 border-gray-200')}>
                                                    {statusLabels[tx.status as keyof typeof statusLabels] || tx.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex gap-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">{tx.weight_requested} kg</div>
                                        <div className="text-xs text-gray-600">Poids</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{tx.total_price?.toLocaleString()} F</div>
                                        <div className="text-xs text-gray-600">Total</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <Link
                                    href={`/messages/${tx.id}`}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                >
                                    Voir
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass rounded-3xl p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun colis envoyé</h3>
                    <p className="text-gray-600 mb-6">Trouvez un voyageur pour envoyer votre premier colis !</p>
                    <Link href="/listings" className={cn(buttonVariants(), "bg-gradient-to-r from-blue-600 to-indigo-600")}>
                        Parcourir les annonces
                    </Link>
                </div>
            )}
        </div>
    )
}
