'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input' // or Textarea if you have it

export function ReviewForm({
    transactionId,
    targetUserId
}: {
    transactionId: string
    targetUserId: string
}) {
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [supabase] = useState(() => createClient())

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase.from('reviews').insert({
            transaction_id: transactionId,
            reviewer_id: user.id,
            target_id: targetUserId,
            rating,
            comment
        })

        if (!error) {
            setSubmitted(true)
        }
    }

    if (submitted) {
        return <div className="text-green-600 font-medium">Merci pour votre avis !</div>
    }

    return (
        <div className="bg-card p-4 rounded-lg border space-y-4">
            <h3 className="font-semibold">Laisser un avis</h3>
            <form onSubmit={submitReview} className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Note (1-5)</label>
                    <Input
                        type="number"
                        min="1"
                        max="5"
                        value={rating}
                        onChange={e => setRating(parseInt(e.target.value))}
                        required
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Commentaire</label>
                    <Input
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Comment s'est passé l'échange ?"
                    />
                </div>
                <Button type="submit">Envoyer l'avis</Button>
            </form>
        </div>
    )
}
