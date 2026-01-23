'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Message {
    id: string
    content: string
    sender_id: string
    created_at: string
}

export function ChatWindow({
    transactionId,
    initialMessages,
    currentUserId,
    otherPartyName = 'Utilisateur'
}: {
    transactionId: string
    initialMessages: Message[]
    currentUserId: string
    otherPartyName?: string
}) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [newMessage, setNewMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const supabase = createClient()
    const scrollRef = useRef<HTMLDivElement>(null)
    const bottomRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        bottomRef.current?.scrollIntoView({ behavior })
    }

    useEffect(() => {
        // Scroll instant on load
        scrollToBottom('auto')
    }, [])

    useEffect(() => {
        scrollToBottom('smooth')
    }, [messages])

    useEffect(() => {
        const channel = supabase
            .channel('realtime_messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `transaction_id=eq.${transactionId}`,
                },
                (payload) => {
                    setMessages((current) => {
                        // Avoid duplicates if rapid firing
                        if (current.some(m => m.id === payload.new.id)) return current
                        return [...current, payload.new as Message]
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, transactionId])

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || isSending) return

        setIsSending(true)
        const messageContent = newMessage.trim()
        setNewMessage('') // Optimistic clear

        // Optimistic UI could be added here, but local state + realtime creates duplication risk unless handled carefully.
        // For now, we rely on Realtime which is fast enough.

        const { error } = await supabase.from('messages').insert({
            transaction_id: transactionId,
            sender_id: currentUserId,
            content: messageContent,
            read_at: null
        })

        setIsSending(false)

        if (error) {
            console.error("Erreur d'envoi:", error)
            setNewMessage(messageContent) // Restore text on error
            // Ideally show a toast
        }
    }

    // Fonction pour formater l'heure
    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // Grouper les messages par date si besoin, ici on fait simple

    return (
        <div className="flex flex-col h-full bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 shadow-inner relative">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                        <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-sm">Démarrez la conversation...</p>
                    </div>
                )}

                {messages.map((message, index) => {
                    const isMe = message.sender_id === currentUserId
                    const showAvatar = !isMe && (index === 0 || messages[index - 1].sender_id !== message.sender_id)

                    return (
                        <div
                            key={message.id}
                            className={cn(
                                "flex w-full",
                                isMe ? "justify-end" : "justify-start"
                            )}
                        >
                            <div className={cn("flex max-w-[80%] items-end gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                                {/* Avatar placeholder for other user */}
                                {!isMe && (
                                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500 bg-gray-200" style={{ opacity: showAvatar ? 1 : 0 }}>
                                        {otherPartyName.charAt(0)}
                                    </div>
                                )}

                                <div>
                                    <div
                                        className={cn(
                                            "px-4 py-2.5 shadow-sm text-[15px] leading-relaxed break-words",
                                            isMe
                                                ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                                                : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm"
                                        )}
                                    >
                                        {message.content}
                                    </div>
                                    <div className={cn("text-[10px] text-gray-400 mt-1 px-1", isMe ? "text-right" : "text-left")}>
                                        {formatTime(message.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 sticky bottom-0 z-10">
                <form onSubmit={sendMessage} className="flex gap-3 items-end max-w-4xl mx-auto">
                    {/* Attachment button (Visual only for now) */}
                    <button type="button" className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>

                    <div className="flex-1 relative">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Écrivez votre message..."
                            autoComplete="off"
                            className="w-full bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl py-6 pl-4 pr-12 text-base transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className={cn(
                            "p-3 rounded-xl transition-all shadow-md",
                            !newMessage.trim() || isSending
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 hover:shadow-lg"
                        )}
                    >
                        <svg className="w-6 h-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    )
}
