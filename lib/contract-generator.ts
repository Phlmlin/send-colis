import { jsPDF } from 'jspdf'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

/**
 * Génération de contrat numérique PDF (décharge)
 * Pour la V1, on génère un HTML simple. 
 * En production, utiliser une lib comme jsPDF ou Puppeteer pour générer des PDF.
 */

export interface ContractData {
    transactionId: string
    senderName: string
    senderEmail: string
    travelerName: string
    travelerEmail: string
    departureCity: string
    arrivalCity: string
    departureDate: string
    weight: number
    price: number
    parcelDescription: string
    createdAt: string
}

export function generateContractHTML(data: ContractData): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Contrat SendColis - ${data.transactionId}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .section {
      margin-bottom: 20px;
    }
    .parties {
      display: flex;
      justify-content: space-between;
      margin: 20px 0;
    }
    .party {
      width: 45%;
      border: 1px solid #ddd;
      padding: 15px;
      border-radius: 5px;
    }
    .signature-box {
      margin-top: 40px;
      border-top: 1px solid #000;
      padding-top: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    td, th {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .footer {
      margin-top: 40px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>CONTRAT DE TRANSPORT DE COLIS</h1>
    <h2>SendColis - Plateforme collaborative</h2>
    <p>N° de transaction: <strong>${data.transactionId}</strong></p>
    <p>Date: ${new Date(data.createdAt).toLocaleDateString('fr-FR')}</p>
  </div>

  <div class="section">
    <h3>Article 1 : Les Parties</h3>
    <div class="parties">
      <div class="party">
        <h4>L'EXPÉDITEUR</h4>
        <p><strong>Nom:</strong> ${data.senderName}</p>
        <p><strong>Email:</strong> ${data.senderEmail}</p>
      </div>
      <div class="party">
        <h4>LE VOYAGEUR</h4>
        <p><strong>Nom:</strong> ${data.travelerName}</p>
        <p><strong>Email:</strong> ${data.travelerEmail}</p>
      </div>
    </div>
  </div>

  <div class="section">
    <h3>Article 2 : Objet du contrat</h3>
    <p>
      Le présent contrat a pour objet le transport d'un colis de <strong>${data.departureCity}</strong> 
      vers <strong>${data.arrivalCity}</strong>, dans le cadre d'un déplacement prévu le 
      <strong>${new Date(data.departureDate).toLocaleDateString('fr-FR')}</strong>.
    </p>
    
    <table>
      <tr>
        <td><strong>Description du colis:</strong></td>
        <td>${data.parcelDescription || 'Non spécifié'}</td>
      </tr>
      <tr>
        <td><strong>Poids:</strong></td>
        <td>${data.weight} kg</td>
      </tr>
      <tr>
        <td><strong>Montant total:</strong></td>
        <td>${data.price} FCFA</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <h3>Article 3 : Obligations de l'Expéditeur</h3>
    <ul>
      <li>Déclarer avec exactitude le contenu du colis</li>
      <li>Ne pas inclure de produits interdits ou dangereux</li>
      <li>Autoriser l'inspection du colis par le voyageur</li>
      <li>Fournir un emballage adapté et sécurisé</li>
      <li>Payer les frais convenus via la plateforme</li>
    </ul>
  </div>

  <div class="section">
    <h3>Article 4 : Obligations du Voyageur</h3>
    <ul>
      <li>Inspecter le contenu du colis avant acceptation</li>
      <li>Transporter le colis dans les conditions convenues</li>
      <li>Refuser tout colis suspect ou non conforme</li>
      <li>Ne pas ouvrir le colis après acceptation</li>
      <li>Remettre le colis dans les délais raisonnables</li>
    </ul>
  </div>

  <div class="section">
    <h3>Article 5 : Responsabilité et Assurance</h3>
    <p>
      Le voyageur s'engage à prendre toutes les précautions nécessaires pour assurer 
      la sécurité du colis. En cas de perte, vol ou dommage, l'assurance souscrite 
      via SendColis couvrira la valeur déclarée du colis selon les conditions générales.
    </p>
  </div>

  <div class="section">
    <h3>Article 6 : Litiges</h3>
    <p>
      En cas de litige, les parties s'engagent à recourir d'abord à la médiation 
      proposée par SendColis. À défaut d'accord, le litige sera soumis aux 
      tribunaux compétents du Gabon.
    </p>
  </div>

  <div class="signature-box">
    <p><strong>Fait numériquement le ${new Date(data.createdAt).toLocaleDateString('fr-FR')}</strong></p>
    <p>
      <em>Les parties reconnaissent avoir lu et accepté les présentes conditions 
      lors de la validation de la transaction sur la plateforme SendColis.</em>
    </p>
  </div>

  <div class="footer">
    <p>SendColis - Gabon</p>
    <p>Contact: support@sendcolis.ga</p>
    <p>Ce document a été généré automatiquement par la plateforme SendColis.</p>
  </div>
</body>
</html>
  `.trim()
}

/**
 * En production, cette fonction uploadera le PDF vers Supabase Storage
 * et retournera l'URL publique.
 */
export async function generateAndSaveContract(data: ContractData): Promise<string> {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('CONTRAT DE TRANSPORT DE COLIS', pageWidth / 2, 20, { align: 'center' })

    doc.setFontSize(14)
    doc.text('SendColis - Plateforme collaborative', pageWidth / 2, 30, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`N° de transaction: ${data.transactionId}`, pageWidth / 2, 40, { align: 'center' })
    doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString('fr-FR')}`, pageWidth / 2, 45, { align: 'center' })

    doc.setLineWidth(0.5)
    doc.line(20, 50, pageWidth - 20, 50)

    // Article 1
    let y = 60
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Article 1 : Les Parties', 20, y)

    y += 10
    doc.setFontSize(10)
    doc.text('L\'EXPÉDITEUR', 20, y)
    doc.text('LE VOYAGEUR', pageWidth / 2 + 10, y)

    y += 5
    doc.setFont('helvetica', 'normal')
    doc.text(`Nom: ${data.senderName}`, 20, y)
    doc.text(`Nom: ${data.travelerName}`, pageWidth / 2 + 10, y)

    y += 5
    doc.text(`Email: ${data.senderEmail}`, 20, y)
    doc.text(`Email: ${data.travelerEmail}`, pageWidth / 2 + 10, y)

    // Article 2
    y += 15
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Article 2 : Objet du contrat', 20, y)

    y += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const objetText = `Le présent contrat a pour objet le transport d'un colis de ${data.departureCity} vers ${data.arrivalCity}, dans le cadre d'un déplacement prévu le ${new Date(data.departureDate).toLocaleDateString('fr-FR')}.`
    const splitObjet = doc.splitTextToSize(objetText, pageWidth - 40)
    doc.text(splitObjet, 20, y)

    y += (splitObjet.length * 5) + 5
    doc.text(`Description du colis: ${data.parcelDescription || 'Non spécifié'}`, 20, y)
    y += 5
    doc.text(`Poids: ${data.weight} kg`, 20, y)
    y += 5
    doc.text(`Montant total: ${data.price} FCFA`, 20, y)

    // Article 3
    y += 15
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Article 3 : Obligations de l\'Expéditeur', 20, y)

    y += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const art3 = [
        "- Déclarer avec exactitude le contenu du colis",
        "- Ne pas inclure de produits interdits ou dangereux",
        "- Autoriser l'inspection du colis par le voyageur",
        "- Fournir un emballage adapté et sécurisé",
        "- Payer les frais convenus via la plateforme"
    ]
    doc.text(art3, 20, y)

    // Article 4
    y += (art3.length * 5) + 10
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Article 4 : Obligations du Voyageur', 20, y)

    y += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const art4 = [
        "- Inspecter le contenu du colis avant acceptation",
        "- Transporter le colis dans les conditions convenues",
        "- Refuser tout colis suspect ou non conforme",
        "- Ne pas ouvrir le colis après acceptation",
        "- Remettre le colis dans les délais raisonnables"
    ]
    doc.text(art4, 20, y)

    // Article 5
    y += (art4.length * 5) + 10
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Article 5 : Responsabilité et Assurance', 20, y)

    y += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const art5 = "Le voyageur s'engage à prendre toutes les précautions nécessaires pour assurer la sécurité du colis. En cas de perte, vol ou dommage, l'assurance souscrite via SendColis couvrira la valeur déclarée du colis selon les conditions générales."
    const splitArt5 = doc.splitTextToSize(art5, pageWidth - 40)
    doc.text(splitArt5, 20, y)

    // Article 6
    y += (splitArt5.length * 5) + 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Article 6 : Litiges', 20, y)

    y += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const art6 = "En cas de litige, les parties s'engagent à recourir d'abord à la médiation proposée par SendColis. À défaut d'accord, le litige sera soumis aux tribunaux compétents du Gabon."
    const splitArt6 = doc.splitTextToSize(art6, pageWidth - 40)
    doc.text(splitArt6, 20, y)

    // Footer signature
    y = 260
    doc.setLineWidth(0.2)
    doc.line(20, y, pageWidth - 20, y)
    y += 10
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.text(`Fait numériquement le ${new Date(data.createdAt).toLocaleDateString('fr-FR')}`, 20, y)
    y += 5
    doc.text("Les parties reconnaissent avoir lu et accepté les présentes conditions lors de la validation de la transaction.", 20, y)

    doc.setFontSize(8)
    doc.text('SendColis - Gabon | support@sendcolis.ga', pageWidth / 2, 285, { align: 'center' })

    // Generate PDF as Buffer
    const pdfArrayBuffer = doc.output('arraybuffer')

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const fileName = `contract-${data.transactionId}.pdf`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(fileName, pdfArrayBuffer, {
            contentType: 'application/pdf',
            upsert: true
        })

    if (uploadError) {
        console.error('Error uploading contract:', uploadError)
        // Note: in a real app we might want to return the HTML or a fallback
        // For now, we throw as requested by "Logic to generate and save"
        throw new Error(`Failed to upload contract: ${uploadError.message}`)
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('contracts')
        .getPublicUrl(fileName)

    return publicUrl
}
