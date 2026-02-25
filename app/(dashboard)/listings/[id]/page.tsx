import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TransportIcon } from '@/components/TransportIcon'
import { cn } from '@/lib/utils'

async function requestTransaction(formData: FormData) {
    'use server'
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const listing_id = formData.get('listing_id') as string
    const traveler_id = formData.get('traveler_id') as string // Should be listing.user_id
    const weight_requested = formData.get('weight_requested') as string
    const price_per_kg = parseFloat(formData.get('price_per_kg') as string)

    const weight = parseFloat(weight_requested)
    const transport_price = weight * price_per_kg

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { error } = await supabase.from('transactions').insert({
        listing_id,
        sender_id: user.id,
        traveler_id,
        weight_requested: weight,
        transport_price: transport_price, // Changed from total_price to transport_price which is required by DB
        status: 'pending_approval',
        payment_status: 'pending'
    })

    if (error) {
        console.error("Transaction Error:", error)
        // Ideally show a toast or error message to user
        throw new Error("Erreur lors de la création de la transaction: " + error.message)
    }

    redirect('/my-parcels')
}

export default async function ListingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: listing } = await supabase
        .from('listings')
        .select(`
      *,
      user:user_id (
        id,
        full_name,
        avatar_url,
        average_rating
      )
    `)
        .eq('id', id)
        .single()

    if (!listing) return notFound()

    const formattedDate = new Date(listing.departure_date).toLocaleDateString("fr-FR", {
        weekday: 'long',
        day: "numeric",
        month: "long",
        year: "numeric"
    })

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header / Boarding Pass Style */}
            <div className="glass rounded-3xl overflow-hidden shadow-xl">
                {/* Top Section: Route & Date */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TransportIcon type={listing.transport_type} className="w-64 h-64" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                                <TransportIcon type={listing.transport_type} className="w-4 h-4" />
                                <span className="capitalize">Voyage en {listing.transport_type === 'plane' ? 'Avion' : listing.transport_type}</span>
                            </div>
                            <div className="flex items-center gap-4 text-3xl md:text-5xl font-bold">
                                <span>{listing.departure_city}</span>
                                <svg className="w-8 h-8 md:w-12 md:h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                                <span>{listing.arrival_city}</span>
                            </div>
                            <p className="text-blue-100 text-lg capitalize flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formattedDate}
                            </p>
                        </div>

                        {listing.flight_number && (
                            <div className="text-right bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20">
                                <p className="text-xs text-blue-200 uppercase tracking-widest">N° de vol/train</p>
                                <p className="text-2xl font-mono font-bold">{listing.flight_number}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Section: Details & Traveler */}
                <div className="p-8 grid md:grid-cols-2 gap-8">
                    {/* Traveler Info */}
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl shadow-inner">
                            {listing.user.avatar_url ? (
                                <img src={listing.user.avatar_url} alt={listing.user.full_name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span>{listing.user.full_name?.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Voyageur</p>
                            <h3 className="text-xl font-bold text-gray-900">{listing.user.full_name}</h3>
                            <div className="flex items-center gap-1 text-amber-500 mt-1">
                                <span className="text-sm font-bold">★ {listing.user.average_rating || "5.0"}</span>
                                <span className="text-xs text-gray-400">(Nouveau)</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                            <p className="text-sm text-gray-500 mb-1">Poids Disponible</p>
                            <p className="text-2xl font-bold text-blue-600">{listing.available_weight} kg</p>
                        </div>
                        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                            <p className="text-sm text-gray-500 mb-1">Prix par Kg</p>
                            <p className="text-2xl font-bold text-indigo-600">{listing.price_per_kg.toLocaleString()} F</p>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {listing.description && (
                    <div className="px-8 pb-8">
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Informations du voyageur
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {listing.description}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Booking Form */}
            <div className="glass rounded-3xl p-8 border-2 border-blue-100 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-600 to-indigo-600"></div>

                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm">1</span>
                    Réserver votre envoi
                </h3>

                <form action={requestTransaction} className="space-y-6">
                    <input type="hidden" name="listing_id" value={listing.id} />
                    <input type="hidden" name="traveler_id" value={listing.user.id} />
                    <input type="hidden" name="price_per_kg" value={listing.price_per_kg} />

                    <div className="grid md:grid-cols-2 gap-8 items-end">
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-gray-700 block">Combien de kilos voulez-vous envoyer ?</label>
                            <div className="relative">
                                <Input
                                    name="weight_requested"
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    max={listing.available_weight}
                                    required
                                    placeholder={`Max ${listing.available_weight}`}
                                    className="h-14 text-lg pl-4 pr-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">kg</div>
                            </div>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Prix estimé : <span className="font-semibold text-gray-900">Prix × {listing.price_per_kg} F</span>
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="h-14 w-full text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg group"
                        >
                            Envoyer ma demande
                            <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Button>
                    </div>

                    <div className="bg-yellow-50 text-yellow-800 text-sm p-4 rounded-xl flex gap-3 items-start mt-4">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>
                            Votre demande sera envoyée au voyageur pour approbation.
                            Vous ne paierez rien tant que la demande n'est pas acceptée.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Import du composant
import { ListingCard } from '@/components/shared/ListingCard'
