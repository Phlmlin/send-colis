import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface Listing {
    id: string
    departure_city: string
    arrival_city: string
    departure_date: string
    available_weight: number
    price_per_kg: number
    description: string | null
    transport_type: string | null
    user: {
        full_name: string | null
        avatar_url: string | null
        average_rating: number | null
    } | null
}

export function ListingCard({ listing }: { listing: Listing }) {
    const formattedDate = new Date(listing.departure_date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric"
    })

    const transportIcon = {
        plane: '✈️',
        train: '🚂',
        bus: '🚌',
        boat: '🚢',
        car: '🚗'
    }[listing.transport_type || 'plane'] || '✈️'

    return (
        <div className="group glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200/50">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span>{transportIcon}</span>
                        <span>{formattedDate}</span>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                        {listing.departure_city} → {listing.arrival_city}
                    </h3>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md">
                    {listing.price_per_kg.toLocaleString()} F
                    <span className="text-xs opacity-90 ml-1">/kg</span>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="font-semibold text-gray-900">{listing.available_weight} kg</span>
                    <span className="text-sm text-gray-500">disponibles</span>
                </div>

                {listing.user?.full_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-6 h-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                            {listing.user.full_name.charAt(0)}
                        </div>
                        <span>{listing.user.full_name}</span>
                        {listing.user.average_rating && listing.user.average_rating > 0 && (
                            <span className="flex items-center gap-1 text-yellow-600">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                                {listing.user.average_rating.toFixed(1)}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {listing.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {listing.description}
                </p>
            )}

            <Link href={`/listings/${listing.id}`} className={cn(buttonVariants({ variant: "default" }), "w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700")}>
                Voir les détails
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </Link>
        </div>
    )
}
