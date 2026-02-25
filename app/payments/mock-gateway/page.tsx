'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'

function MockGatewayContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const id = searchParams.get('id')
    const amount = searchParams.get('amount')
    const [loading, setLoading] = useState(false)

    const handlePay = async () => {
        setLoading(true)

        // Simuler l'appel webhook (coté serveur)
        const formData = new FormData()
        formData.append('cpm_trans_id', id || '')

        try {
            await fetch('/api/webhooks/payments', {
                method: 'POST',
                body: formData
            })

            // Rediriger vers la page de succès
            router.push('/payments/callback?transaction_id=' + id)
        } catch (error) {
            console.error('Error simulating webhook:', error)
            alert('Erreur lors de la simulation du paiement')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Passerelle de Paiement (Simulation)</h1>
                    <p className="text-gray-500 mt-2">Ceci est une simulation pour le développement.</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Référence</span>
                        <span className="font-mono font-medium">{id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Montant</span>
                        <span className="font-bold text-gray-900">{amount} FCFA</span>
                    </div>
                </div>

                <button
                    onClick={handlePay}
                    disabled={loading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                >
                    {loading ? 'Traitement en cours...' : 'Confirmer le paiement'}
                </button>

                <p className="text-center mt-4 text-xs text-gray-400">
                    En cliquant, vous simulez un paiement réussi et l'envoi d'un webhook.
                </p>
            </div>
        </div>
    )
}

export default function MockGateway() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
            <MockGatewayContent />
        </Suspense>
    )
}
