'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

interface PaymentResult {
    success: boolean
    error?: string
    transaction_id?: string
}

/**
 * Payer les frais de mise en relation (5000 FCFA)
 */
export async function payConnectionFee(transactionId: string): Promise<PaymentResult> {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Non authentifié' }
    }

    // Récupérer la transaction
    const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single()

    if (fetchError || !transaction) {
        return { success: false, error: 'Transaction non trouvée' }
    }

    // Vérifier que c'est bien l'expéditeur
    if (transaction.sender_id !== user.id) {
        return { success: false, error: 'Non autorisé' }
    }

    // Créer le paiement (simulé pour l'instant)
    const { error: paymentError } = await supabase
        .from('payment_transactions')
        .insert({
            transaction_id: transactionId,
            payer_id: user.id,
            amount: transaction.connection_fee,
            payment_method: 'mobile_money',
            payment_provider: 'airtel_money', // Simulation
            provider_transaction_id: `CONN_${Date.now()}`,
            status: 'completed'
        })

    if (paymentError) {
        return { success: false, error: 'Échec du paiement' }
    }

    // Mettre à jour le statut de la transaction
    const { error: updateError } = await supabase
        .from('transactions')
        .update({
            payment_status: 'connection_paid',
            status: 'connection_fee_paid',
            updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)

    if (updateError) {
        return { success: false, error: 'Erreur de mise à jour' }
    }

    revalidatePath(`/my-parcels`)
    revalidatePath(`/messages/${transactionId}`)

    return { success: true, transaction_id: transactionId }
}

/**
 * Payer les frais de transport (prix * poids)
 */
export async function payTransportFee(transactionId: string, paymentMethod: 'mobile_money' | 'card' | 'paypal' = 'mobile_money'): Promise<PaymentResult> {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Non authentifié' }
    }

    const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single()

    if (fetchError || !transaction) {
        return { success: false, error: 'Transaction non trouvée' }
    }

    if (transaction.sender_id !== user.id) {
        return { success: false, error: 'Non autorisé' }
    }

    // Vérifier que les frais de connexion sont payés
    if (transaction.payment_status !== 'connection_paid') {
        return { success: false, error: 'Payez d\'abord les frais de mise en relation' }
    }

    // Créer le paiement de transport
    const { error: paymentError } = await supabase
        .from('payment_transactions')
        .insert({
            transaction_id: transactionId,
            payer_id: user.id,
            amount: transaction.transport_price,
            payment_method: paymentMethod,
            payment_provider: paymentMethod === 'mobile_money' ? 'moov_money' : paymentMethod,
            provider_transaction_id: `TRANS_${Date.now()}`,
            status: 'completed'
        })

    if (paymentError) {
        return { success: false, error: 'Échec du paiement' }
    }

    // Mettre à jour: Paiement complet, fonds en escrow
    const { error: updateError } = await supabase
        .from('transactions')
        .update({
            payment_status: 'held_in_escrow',
            status: 'transport_fee_paid',
            updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)

    if (updateError) {
        return { success: false, error: 'Erreur de mise à jour' }
    }

    revalidatePath(`/my-parcels`)
    revalidatePath(`/messages/${transactionId}`)

    return { success: true, transaction_id: transactionId }
}

/**
 * Libérer les fonds au voyageur après livraison
 */
export async function releaseFunds(transactionId: string): Promise<PaymentResult> {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Non authentifié' }
    }

    const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single()

    if (!transaction) {
        return { success: false, error: 'Transaction non trouvée' }
    }

    // Seul l'expéditeur peut confirmer la livraison
    if (transaction.sender_id !== user.id) {
        return { success: false, error: 'Non autorisé' }
    }

    // Libérer les fonds
    const { error } = await supabase
        .from('transactions')
        .update({
            payment_status: 'released',
            status: 'delivered',
            delivery_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)

    if (error) {
        return { success: false, error: 'Erreur de libération' }
    }

    // Incrémenter les stats du voyageur
    await supabase.rpc('increment_shipments_delivered', { user_id: transaction.traveler_id })

    revalidatePath(`/my-parcels`)
    revalidatePath(`/my-trips`)
    revalidatePath(`/messages/${transactionId}`)

    return { success: true, transaction_id: transactionId }
}
