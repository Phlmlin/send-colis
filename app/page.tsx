import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { IllustrationCard } from '@/components/landing/IllustrationCard'
import { FeatureStep } from '@/components/landing/FeatureStep'
import { TrustBadge } from '@/components/landing/TrustBadge'

export default async function HomePage() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {/* Navigation */}
                    <nav className="flex items-center justify-between mb-20">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                SendColis
                            </span>
                        </div>

                        {user ? (
                            <Link
                                href="/listings"
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                            >
                                Accéder à l'app
                            </Link>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/login"
                                    className="px-6 py-3 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                                >
                                    Inscription
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* Hero Content */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                        <div className="space-y-8">
                            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                                    Envoyez vos colis
                                </span>
                                <br />
                                <span className="text-gray-900">
                                    partout dans le monde
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 leading-relaxed">
                                Connectez-vous avec des voyageurs de confiance et envoyez vos colis en toute sécurité.
                                Simple, rapide et économique.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href={user ? "/listings" : "/signup"}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                                >
                                    Commencer maintenant
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/listings"
                                    className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all"
                                >
                                    Voir les annonces
                                </Link>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap gap-6 pt-8 border-t border-gray-200">
                                <TrustBadge
                                    icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                                    text="Sécurisé"
                                />
                                <TrustBadge
                                    icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                    text="Économique"
                                />
                                <TrustBadge
                                    icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                                    text="Rapide"
                                />
                            </div>
                        </div>

                        {/* Illustration */}
                        <div className="glass rounded-3xl p-8 lg:p-12">
                            <div className="space-y-6">
                                <IllustrationCard
                                    icon={
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    }
                                    title="Libreville → Paris"
                                    subtitle="10 kg disponibles"
                                    color="blue"
                                >
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <p className="text-2xl font-bold text-blue-600">5 000 FCFA/kg</p>
                                    </div>
                                </IllustrationCard>

                                <IllustrationCard
                                    icon={
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    }
                                    title="Paiement sécurisé"
                                    subtitle="Vos fonds sont protégés"
                                    color="green"
                                />

                                <IllustrationCard
                                    icon={
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    }
                                    title="Chat direct"
                                    subtitle="Communiquez en temps réel"
                                    color="indigo"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
                    <p className="text-xl text-gray-600">Simple et rapide en 3 étapes</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            step: "1",
                            title: "Publiez ou recherchez",
                            description: "Voyageurs : proposez vos kilos disponibles. Expéditeurs : trouvez un voyageur.",
                            icon: (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )
                        },
                        {
                            step: "2",
                            title: "Connectez-vous",
                            description: "Discutez et finalisez les détails de l'envoi en toute transparence.",
                            icon: (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                            )
                        },
                        {
                            step: "3",
                            title: "Envoyez en toute sécurité",
                            description: "Paiement sécurisé, suivi en temps réel et livraison confirmée.",
                            icon: (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            )
                        }
                    ].map((feature, i) => (
                        <FeatureStep
                            key={i}
                            index={i}
                            step={feature.step}
                            title={feature.title}
                            description={feature.description}
                            icon={feature.icon}
                        />
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="glass rounded-3xl p-12 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Prêt à envoyer votre colis ?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Rejoignez des milliers d'utilisateurs qui font confiance à SendColis pour leurs envois
                    </p>
                    <Link
                        href={user ? "/listings" : "/signup"}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all"
                    >
                        Commencer gratuitement
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-200 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center text-gray-600">
                        <p>© 2026 SendColis - Gabon. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
