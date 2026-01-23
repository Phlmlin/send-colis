import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function ProhibitedItemsPage() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: items } = await supabase
        .from('prohibited_items')
        .select('*')
        .order('severity', { ascending: false })

    const forbiddenItems = items?.filter(i => i.severity === 'forbidden') || []
    const warningItems = items?.filter(i => i.severity === 'warning') || []

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="glass rounded-3xl p-8 bg-gradient-to-r from-red-50 to-orange-50 border-red-100">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">Produits interdits et réglementés</h1>
                        <p className="text-gray-600 mt-2 max-w-2xl">
                            Pour la sécurité de tous et le respect des lois internationales, certains objets ne peuvent pas être transportés.
                            Veuillez lire attentivement cette liste avant de proposer ou d'accepter un colis.
                        </p>
                    </div>
                </div>
            </div>

            {/* Avertissement important */}
            <div className="bg-red-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                    <div className="bg-white/20 p-3 rounded-xl flex-shrink-0">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-2">Attention : Responsabilité légale</h2>
                        <p className="text-red-100 leading-relaxed">
                            Le transport de produits interdits peut entraîner des poursuites judiciaires,
                            des amendes importantes et des peines de prison. En tant que voyageur,
                            vous avez <strong>le droit et l'obligation d'inspecter</strong> le contenu du colis avant de l'accepter.
                            Ne transportez jamais un colis fermé dont vous ignorez le contenu.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Produits strictement interdits */}
                <div className="glass rounded-3xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Strictement interdits</h2>
                    </div>

                    <div className="space-y-4">
                        {forbiddenItems.map((item) => (
                            <div key={item.id} className="group hover:bg-red-50 p-4 rounded-2xl border border-transparent hover:border-red-100 transition-all duration-300">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 bg-red-100 p-2 rounded-lg text-red-600">
                                        {/* Fallback icon if no SVG provided in DB (assumed logic, simplified here) */}
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">{item.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                        <span className="inline-block mt-2 px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                                            {item.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Produits réglementés */}
                <div className="glass rounded-3xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Réglementés (sous conditions)</h2>
                    </div>

                    <div className="space-y-4">
                        {warningItems.map((item) => (
                            <div key={item.id} className="group hover:bg-amber-50 p-4 rounded-2xl border border-transparent hover:border-amber-100 transition-all duration-300">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 bg-amber-100 p-2 rounded-lg text-amber-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">{item.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                        <span className="inline-block mt-2 px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                                            {item.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Règles douanières & Droits */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="glass rounded-3xl p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                    <h2 className="text-lg font-bold mb-4 text-blue-900 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Règles douanières gabonaises
                    </h2>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></span>
                            <span className="text-sm text-blue-800">Déclarez tout produit d'une valeur supérieure à 500 000 FCFA.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></span>
                            <span className="text-sm text-blue-800">Les produits alimentaires frais nécessitent un certificat sanitaire.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></span>
                            <span className="text-sm text-blue-800">Les médicaments doivent être accompagnés d'une ordonnance valide.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></span>
                            <span className="text-sm text-blue-800">Maximum 200 cigarettes ou 50 cigares par voyageur majeur.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></span>
                            <span className="text-sm text-blue-800">L'ivoire et les espèces protégées sont strictement interdits sous peine de prison.</span>
                        </li>
                    </ul>
                </div>

                <div className="glass rounded-3xl p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                    <h2 className="text-lg font-bold mb-4 text-green-900 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Droits du voyageur
                    </h2>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-sm text-green-800"><strong>Inspection obligatoire :</strong> Vous pouvez et devez inspecter le contenu du colis devant l'expéditeur.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-sm text-green-800"><strong>Refus :</strong> Vous avez le droit absolu de refuser tout colis suspect ou mal emballé.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-sm text-green-800"><strong>Déclaration :</strong> Vous êtes responsable du contenu déclaré en douane à votre arrivée.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-sm text-green-800"><strong>Contrat :</strong> Un contrat numérique SendColis protège votre accord.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
