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
    // Pour l'instant, on retourne juste un placeholder
    // En prod: utiliser jsPDF ou Puppeteer pour convertir le HTML en PDF
    const html = generateContractHTML(data)

    // Simulation:
    const contractUrl = `https://placeholder.com/contracts/${data.transactionId}.pdf`

    return contractUrl
}
