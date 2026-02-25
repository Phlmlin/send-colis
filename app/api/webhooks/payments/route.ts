import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { CinetPayService } from '@/lib/payments/cinetpay'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const cpm_trans_id = formData.get('cpm_trans_id') as string

        if (!cpm_trans_id) {
            return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 })
        }

        // Pour les webhooks, on doit utiliser le client admin pour bypasser RLS
        const supabase = createAdminClient()

        // 1. Vérifier le paiement auprès de CinetPay
        const verification = await CinetPayService.verifyPayment(cpm_trans_id)

        if (!verification.success || verification.status !== 'completed') {
            // Mettre à jour en échec si besoin
            await supabase
                .from('payment_transactions')
                .update({
                    status: 'failed',
                    metadata: verification.metadata
                })
                .eq('id', cpm_trans_id)

            return NextResponse.json({ message: 'Payment failed' })
        }

        // 2. Récupérer le paiement en base
        const { data: payment, error: paymentError } = await supabase
            .from('payment_transactions')
            .select('*, transactions(*)')
            .eq('id', cpm_trans_id)
            .single()

        if (paymentError || !payment) {
            console.error('Payment record not found:', cpm_trans_id)
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
        }

        if (payment.status === 'completed') {
            return NextResponse.json({ message: 'Already processed' })
        }

        // 3. Mettre à jour le paiement
        await supabase
            .from('payment_transactions')
            .update({
                status: 'completed',
                provider_transaction_id: verification.providerTransactionId,
                metadata: verification.metadata
            })
            .eq('id', cpm_trans_id)

        // 4. Mettre à jour la transaction principale
        const transaction = payment.transactions
        const isConnectionFee = payment.amount === transaction.connection_fee

        let updateData = {}
        if (transaction.status === 'approved' && isConnectionFee) {
            updateData = {
                payment_status: 'connection_paid',
                status: 'connection_fee_paid',
                updated_at: new Date().toISOString()
            }
        } else if (transaction.status === 'connection_fee_paid') {
            updateData = {
                payment_status: 'held_in_escrow',
                status: 'transport_fee_paid',
                updated_at: new Date().toISOString()
            }
        }

        if (Object.keys(updateData).length > 0) {
            await supabase
                .from('transactions')
                .update(updateData)
                .eq('id', transaction.id)
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
