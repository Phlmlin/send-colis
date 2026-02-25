import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PaymentCallbackPage({
    searchParams
}: {
    searchParams: { transaction_id?: string, token?: string }
}) {
    const transactionId = searchParams.transaction_id

    if (!transactionId) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
                <p className="text-gray-600 mb-8">ID de transaction manquant.</p>
                <Link href="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium">
                    Retour au tableau de bord
                </Link>
            </div>
        )
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Attendre un peu pour laisser le temps au webhook de passer
    // (Dans un vrai cas, on pourrait utiliser du polling ou du realtime)

    const { data: payment } = await supabase
        .from('payment_transactions')
        .select('*, transactions(*)')
        .eq('id', transactionId)
        .single()

    const isSuccess = payment?.status === 'completed'
    const mainTransactionId = payment?.transactions?.id

    return (
        <div className="max-w-2xl mx-auto mt-20 p-10 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 text-center animate-fade-in">
            {isSuccess ? (
                <>
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Paiement Réussi !</h1>
                    <p className="text-gray-600 text-lg mb-10">
                        Votre paiement de <span className="font-bold text-blue-600">{payment.amount.toLocaleString()} FCFA</span> a été traité avec succès.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={mainTransactionId ? `/messages/${mainTransactionId}` : '/my-parcels'}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-200"
                        >
                            Voir la transaction
                        </Link>
                        <Link
                            href="/dashboard"
                            className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all"
                        >
                            Tableau de bord
                        </Link>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Traitement en cours...</h1>
                    <p className="text-gray-600 text-lg mb-10">
                        Nous vérifions le statut de votre paiement. Cela peut prendre quelques instants.
                    </p>
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                    <div className="mt-12">
                        <Link
                            href={mainTransactionId ? `/messages/${mainTransactionId}` : '/dashboard'}
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Rafraîchir ou retourner à la transaction
                        </Link>
                    </div>
                </>
            )}
        </div>
    )
}
