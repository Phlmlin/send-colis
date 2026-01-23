import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const dynamic = 'force-dynamic'

async function submitVerification(formData: FormData) {
    'use server'

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const id_document_type = formData.get('id_document_type') as string
    const id_document_url = formData.get('id_document_url') as string // Dans la vraie vie, ce serait uploadé

    const { error } = await supabase
        .from('profiles')
        .update({
            id_document_type,
            id_document_url,
            verification_status: 'pending',
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) {
        console.error(error)
        return { error: error.message }
    }

    redirect('/profile')
}

export default async function VerifyPage() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profile?.verification_status === 'verified') {
        return redirect('/profile')
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Vérification d'identité</h1>
                <p className="text-muted-foreground mt-2">
                    Soumettez votre pièce d'identité pour accéder à toutes les fonctionnalités.
                </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">📋 Documents acceptés</h3>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    <li>Passeport (recommandé)</li>
                    <li>Carte Nationale d'Identité</li>
                    <li>Permis de conduire (avec photo)</li>
                </ul>
            </div>

            <div className="bg-card border rounded-lg p-6">
                <form action={submitVerification} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Type de document</label>
                        <select
                            name="id_document_type"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">Sélectionnez...</option>
                            <option value="passport">Passeport</option>
                            <option value="national_id">Carte Nationale d'Identité</option>
                            <option value="driver_license">Permis de conduire</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Scanner ou photo du document</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <div className="space-y-2">
                                <div className="text-4xl">📄</div>
                                <Input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="max-w-xs mx-auto"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Format: JPG, PNG ou PDF • Taille max: 5 Mo
                                </p>
                            </div>
                        </div>

                        {/* Simulation: Dans la vraie version, on uploadera vers Supabase Storage */}
                        <Input
                            type="hidden"
                            name="id_document_url"
                            value="https://placeholder.com/document.jpg"
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                        <strong>🔒 Sécurité et confidentialité</strong><br />
                        Vos documents sont stockés de manière sécurisée et ne seront utilisés que pour la vérification d'identité.
                    </div>

                    <div className="flex gap-4">
                        <Button type="submit" className="flex-1">
                            Soumettre pour vérification
                        </Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Annuler
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
                <h3 className="font-semibold mb-2">❓ Pourquoi cette vérification ?</h3>
                <p className="text-sm text-gray-600">
                    Conformément au cahier des charges et aux standards de sécurité, tous les utilisateurs doivent vérifier leur identité pour :
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                    <li>Renforcer la confiance entre utilisateurs</li>
                    <li>Prévenir les fraudes</li>
                    <li>Sécuriser les transactions financières</li>
                    <li>Respecter les réglementations gabonaises</li>
                </ul>
            </div>
        </div>
    )
}
