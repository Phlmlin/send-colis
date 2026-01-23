'use client'

import { signout } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'

interface DashboardLayoutClientProps {
    isAdmin: boolean
    userName: string
    userEmail: string
    userInitial: string
    unreadCount?: number
    children: React.ReactNode
}

export function DashboardLayoutClient({
    isAdmin,
    userName,
    userEmail,
    userInitial,
    unreadCount = 0,
    children
}: DashboardLayoutClientProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div className="flex h-screen flex-col bg-gray-50">
            {/* Top Navigation */}
            <header className="glass fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link href="/listings" className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">S</span>
                            </div>
                            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:inline">
                                SendColis
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            <NavLink href="/listings" icon={SearchIcon}>Rechercher</NavLink>
                            <NavLink href="/listings/create" icon={PlusIcon}>Publier</NavLink>
                            <NavLink href="/my-trips" icon={PlaneIcon}>Mes Trajets</NavLink>
                            <NavLink href="/my-parcels" icon={PackageIcon}>Mes Colis</NavLink>
                            <NavLink href="/messages" icon={MessageIcon} count={unreadCount}>Messages</NavLink>
                            {isAdmin && (
                                <NavLink href="/admin" icon={ShieldIcon} isAdmin>Admin</NavLink>
                            )}
                        </nav>

                        {/* User Menu Desktop */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {userInitial}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{userName}</span>
                            </Link>
                            <form action={signout}>
                                <Button variant="ghost" size="sm" className="text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </Button>
                            </form>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden glass border-t border-gray-200/50 animate-slide-down">
                        <div className="container mx-auto px-4 py-4 space-y-2">
                            <MobileNavLink href="/listings" onClick={() => setMobileMenuOpen(false)}>
                                🔍 Rechercher
                            </MobileNavLink>
                            <MobileNavLink href="/listings/create" onClick={() => setMobileMenuOpen(false)}>
                                ➕ Publier un trajet
                            </MobileNavLink>
                            <MobileNavLink href="/my-trips" onClick={() => setMobileMenuOpen(false)}>
                                ✈️ Mes Trajets
                            </MobileNavLink>
                            <MobileNavLink href="/my-parcels" onClick={() => setMobileMenuOpen(false)}>
                                📦 Mes Colis
                            </MobileNavLink>
                            <MobileNavLink href="/messages" onClick={() => setMobileMenuOpen(false)} count={unreadCount}>
                                💬 Messages
                            </MobileNavLink>
                            <MobileNavLink href="/profile" onClick={() => setMobileMenuOpen(false)}>
                                👤 Profil
                            </MobileNavLink>
                            {isAdmin && (
                                <MobileNavLink href="/admin" onClick={() => setMobileMenuOpen(false)}>
                                    🛡️ Administration
                                </MobileNavLink>
                            )}
                            <div className="pt-2 border-t border-gray-200">
                                <form action={signout}>
                                    <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 font-medium transition-colors">
                                        🚪 Déconnexion
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-20 pb-6 overflow-y-auto">
                <div className="container mx-auto px-4">
                    {children}
                </div>
            </main>
        </div>
    )
}

function NavLink({ href, icon: Icon, children, isAdmin = false, count = 0 }: any) {
    return (
        <Link
            href={href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isAdmin
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
        >
            <span className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {children}
                {count > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold min-w-[1.2rem] text-center">
                        {count}
                    </span>
                )}
            </span>
        </Link>
    )
}

function MobileNavLink({ href, onClick, children, count }: any) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium transition-colors flex justify-between items-center"
        >
            <span>{children}</span>
            {count > 0 && (
                <span className="px-2 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                    {count}
                </span>
            )}
        </Link>
    )
}

const SearchIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
)

const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
)

const PlaneIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
)

const PackageIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
)

const MessageIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
)

const ShieldIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
)
