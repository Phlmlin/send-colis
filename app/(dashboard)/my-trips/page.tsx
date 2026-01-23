import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TransportIcon } from '@/components/TransportIcon'

export const dynamic = 'force-dynamic'

export default async function MyTripsPage() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const statusColors = {
        active: 'bg-blue-100 text-blue-700 border-blue-200',
        completed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="glass rounded-3xl p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Mes Trajets
                            </h1>
                            <p className="text-gray-600 mt-1">Gérez vos annonces de voyage</p>
                        </div>
                    </div>
                    <Link href="/listings/create" className={cn(buttonVariants(), "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg")}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nouveau trajet
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{listings?.filter(l => l.status === 'active').length || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Actifs</div>
                </div>

                <div className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{listings?.filter(l => l.status === 'completed').length || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Terminés</div>
                </div>

                <div className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{listings?.length || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Total</div>
                </div>
            </div>

            {/* Listings */}
            {listings && listings.length > 0 ? (
                <div className="space-y-4">
                    {listings.map((listing: any, index: number) => (
                        <div
                            key={listing.id}
                            className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                {/* Main Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start gap-4">
                                        {/* Transport Icon */}
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            <TransportIcon type={listing.transport_type} className="w-7 h-7 text-blue-600" />
                                        </div>

                                        {/* Route */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900">{listing.departure_city}</h3>
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                                <h3 className="text-xl font-bold text-gray-900">{listing.arrival_city}</h3>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {new Date(listing.departure_date).toLocaleDateString('fr-FR')}
                                                </span>
                                                {listing.flight_number && (
                                                    <span className="flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                        </svg>
                                                        {listing.flight_number}
                                                    </span>
                                                )}
                                                <span className={cn("px-3 py-1 rounded-full text-xs font-medium border-2", statusColors[listing.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700 border-gray-200')}>
                                                    {listing.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex gap-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">{listing.available_weight} kg</div>
                                        <div className="text-xs text-gray-600">Disponible</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{listing.price_per_kg.toLocaleString()} F</div>
                                        <div className="text-xs text-gray-600">Par kg</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <Link
                                    href={`/listings/${listing.id}`}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                >
                                    Détails
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun trajet publié</h3>
                    <p className="text-gray-600 mb-6">Commencez à proposer vos kilos disponibles et gagnez de l'argent !</p>
                    <Link href="/listings/create" className={cn(buttonVariants(), "bg-gradient-to-r from-blue-600 to-indigo-600")}>
                        Publier mon premier trajet
                    </Link>
                </div>
            )}
        </div>
    )
}
