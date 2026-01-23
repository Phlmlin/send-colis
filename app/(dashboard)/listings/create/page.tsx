import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function createListing(formData: FormData) {
    'use server'

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const listingData = {
        user_id: user.id,
        departure_city: formData.get('departure_city') as string,
        arrival_city: formData.get('arrival_city') as string,
        departure_date: formData.get('departure_date') as string,
        transport_type: formData.get('transport_type') as string,
        flight_number: formData.get('flight_number') as string,
        available_weight: parseFloat(formData.get('available_weight') as string),
        price_per_kg: parseFloat(formData.get('price_per_kg') as string),
        description: formData.get('description') as string,
    }

    const { error } = await supabase
        .from('listings')
        .insert([listingData])

    if (error) {
        console.error('Error creating listing:', error)
        // En production, vous pouvez rediriger vers une page d'erreur ou afficher un toast
    }

    revalidatePath('/listings')
    redirect('/my-trips')
}

export default async function CreateListingPage() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="glass rounded-3xl p-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Publier un voyage
                        </h1>
                        <p className="text-gray-600 mt-1">Proposez vos kilos disponibles et gagnez de l'argent</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form action={createListing} className="space-y-6">
                {/* Itinéraire */}
                <div className="glass rounded-3xl p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        Itinéraire
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                                </svg>
                                Ville de départ
                            </label>
                            <Input
                                name="departure_city"
                                placeholder="Ex: Libreville"
                                required
                                className="h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                                </svg>
                                Ville d'arrivée
                            </label>
                            <Input
                                name="arrival_city"
                                placeholder="Ex: Paris"
                                required
                                className="h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Date de départ
                            </label>
                            <Input
                                name="departure_date"
                                type="date"
                                required
                                className="h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Type de transport
                            </label>
                            <select
                                name="transport_type"
                                required
                                className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                <option value="">Sélectionnez...</option>
                                <option value="plane">Avion</option>
                                <option value="train">Train</option>
                                <option value="bus">Bus</option>
                                <option value="boat">Bateau</option>
                                <option value="car">Voiture</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 mt-6">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Numéro de vol / train (optionnel)
                        </label>
                        <Input
                            name="flight_number"
                            placeholder="Ex: AF456"
                            className="h-12"
                        />
                    </div>
                </div>

                {/* Capacité */}
                <div className="glass rounded-3xl p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Capacité et tarif
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                </svg>
                                Poids disponible (kg)
                            </label>
                            <Input
                                name="available_weight"
                                type="number"
                                step="0.1"
                                placeholder="Ex: 10"
                                required
                                className="h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Prix par kg (FCFA)
                            </label>
                            <Input
                                name="price_per_kg"
                                type="number"
                                step="100"
                                placeholder="Ex: 5000"
                                required
                                className="h-12"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mt-6">
                        <p className="text-sm text-blue-800">
                            💡 <strong>Conseil</strong> : Les expéditeurs paieront des frais de mise en relation de 5 000 FCFA + votre tarif au kilo.
                        </p>
                    </div>
                </div>

                {/* Description */}
                <div className="glass rounded-3xl p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        Informations complémentaires
                    </h2>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Description (optionnel)</label>
                        <textarea
                            name="description"
                            rows={4}
                            placeholder="Ex: Je peux transporter des vêtements, documents, petits objets. Disponible pour remise à l'aéroport..."
                            className="flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button
                        type="submit"
                        className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Publier mon annonce
                    </Button>
                    <Link href="/listings">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-14 px-6"
                        >
                            Annuler
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    )
}
