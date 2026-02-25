import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    searchParams: { [key: string]: string | string[] | undefined }
    baseUrl: string
}

export function Pagination({ currentPage, totalPages, searchParams, baseUrl }: PaginationProps) {
    if (totalPages <= 1) return null

    const createPageUrl = (page: number) => {
        const params = new URLSearchParams()
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value !== undefined && key !== 'page') {
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(key, v))
                } else {
                    params.append(key, value as string)
                }
            }
        })
        params.set('page', page.toString())
        return `${baseUrl}?${params.toString()}`
    }

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    // Limit the number of visible page buttons
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    const visiblePages = pages.slice(startPage - 1, endPage)

    return (
        <div className="flex items-center justify-center gap-2 mt-12">
            <Link
                href={currentPage > 1 ? createPageUrl(currentPage - 1) : '#'}
                className={cn(
                    buttonVariants({ variant: 'outline', size: 'icon' }),
                    "w-10 h-10 rounded-xl",
                    currentPage <= 1 && "pointer-events-none opacity-50"
                )}
            >
                <ChevronLeft className="w-5 h-5" />
            </Link>

            {startPage > 1 && (
                <>
                    <Link
                        href={createPageUrl(1)}
                        className={cn(
                            buttonVariants({ variant: 'outline', size: 'icon' }),
                            "w-10 h-10 rounded-xl"
                        )}
                    >
                        1
                    </Link>
                    {startPage > 2 && <span className="text-gray-400">...</span>}
                </>
            )}

            {visiblePages.map(page => (
                <Link
                    key={page}
                    href={createPageUrl(page)}
                    className={cn(
                        buttonVariants({
                            variant: currentPage === page ? 'default' : 'outline',
                            size: 'icon'
                        }),
                        "w-10 h-10 rounded-xl",
                        currentPage === page && "bg-blue-600 hover:bg-blue-700 shadow-md"
                    )}
                >
                    {page}
                </Link>
            ))}

            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span className="text-gray-400">...</span>}
                    <Link
                        href={createPageUrl(totalPages)}
                        className={cn(
                            buttonVariants({ variant: 'outline', size: 'icon' }),
                            "w-10 h-10 rounded-xl"
                        )}
                    >
                        {totalPages}
                    </Link>
                </>
            )}

            <Link
                href={currentPage < totalPages ? createPageUrl(currentPage + 1) : '#'}
                className={cn(
                    buttonVariants({ variant: 'outline', size: 'icon' }),
                    "w-10 h-10 rounded-xl",
                    currentPage >= totalPages && "pointer-events-none opacity-50"
                )}
            >
                <ChevronRight className="w-5 h-5" />
            </Link>
        </div>
    )
}
