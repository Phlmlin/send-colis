import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { generateContractHTML } from '@/lib/contract-generator'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const { data: transaction } = await supabase
        .from('transactions')
        .select(`
      *,
      listing:listing_id (*),
      sender:sender_id (full_name, email),
      traveler:traveler_id (full_name, email)
    `)
        .eq('id', params.id)
        .single()

    if (!transaction) {
        return new NextResponse('Transaction not found', { status: 404 })
    }

    // Verify user is part of transaction
    if (transaction.sender_id !== user.id && transaction.traveler_id !== user.id && user.role !== 'admin') {
        return new NextResponse('Forbidden', { status: 403 })
    }

    const contractData = {
        transactionId: transaction.id,
        senderName: transaction.sender?.full_name || 'Inconnu',
        senderEmail: transaction.sender?.email || 'Inconnu',
        travelerName: transaction.traveler?.full_name || 'Inconnu',
        travelerEmail: transaction.traveler?.email || 'Inconnu',
        departureCity: transaction.listing?.departure_city || 'Inconnu',
        arrivalCity: transaction.listing?.arrival_city || 'Inconnu',
        departureDate: transaction.listing?.departure_date || new Date().toISOString(),
        weight: transaction.weight_requested,
        price: transaction.total_price,
        parcelDescription: transaction.description || 'Colis standard',
        createdAt: transaction.created_at
    }

    const html = generateContractHTML(contractData)

    return new NextResponse(html, {
        headers: {
            'Content-Type': 'text/html',
            // 'Content-Disposition': `attachment; filename="contract-${transaction.id}.html"`, // Uncomment to force downlaod
        },
    })
}
