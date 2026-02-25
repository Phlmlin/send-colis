import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { DashboardLayoutClient } from '@/components/DashboardLayoutClient'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user?.id || '')
        .single()

    const isAdmin = profile?.role === 'admin'
    const userName = profile?.full_name || user?.email || 'Utilisateur'
    const userEmail = user?.email || ''
    const userInitial = profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'

    // Fetch unread messages count & pending requests
    const { data: myTransactions } = await supabase
        .from('transactions')
        .select('id, status, traveler_id')
        .or(`sender_id.eq.${user?.id},traveler_id.eq.${user?.id}`)

    const transactionIds = myTransactions?.map(t => t.id) || []

    // Count 1: Pending requests where I am the traveler
    const pendingRequestsCount = myTransactions?.filter(t =>
        t.traveler_id === user?.id && t.status === 'pending_approval'
    ).length || 0

    // Count 2: Unread messages
    let unreadMessagesCount = 0
    if (transactionIds.length > 0) {
        const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('transaction_id', transactionIds)
            .neq('sender_id', user?.id)
            .is('read_at', null)

        unreadMessagesCount = count || 0
    }

    const totalNotificationCount = pendingRequestsCount + unreadMessagesCount

    return (
        <DashboardLayoutClient
            isAdmin={isAdmin}
            userName={userName}
            userEmail={userEmail}
            userInitial={userInitial}
            unreadCount={totalNotificationCount}
        >
            {children}
        </DashboardLayoutClient>
    )
}
