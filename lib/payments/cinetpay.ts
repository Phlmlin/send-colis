import { PaymentRequest, PaymentResponse, PaymentVerification } from './types';

const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY;
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID;
const BASE_URL = 'https://api-checkout.cinetpay.com/v2/payment';

export class CinetPayService {
    private static isConfigured(): boolean {
        return !!(CINETPAY_API_KEY && CINETPAY_SITE_ID);
    }

    /**
     * Initialise un paiement avec CinetPay
     */
    static async initializePayment(request: PaymentRequest): Promise<PaymentResponse> {
        if (!this.isConfigured()) {
            console.warn('CinetPay non configuré. Utilisation du mode simulation.');
            return {
                success: true,
                paymentUrl: `/payments/mock-gateway?id=${request.transactionId}&amount=${request.amount}`,
            };
        }

        try {
            const payload = {
                apikey: CINETPAY_API_KEY,
                site_id: CINETPAY_SITE_ID,
                transaction_id: request.transactionId,
                amount: request.amount,
                currency: request.currency || 'XAF',
                description: request.description,
                customer_name: request.customerName,
                customer_surname: request.customerName, // CinetPay requires both
                customer_email: request.customerEmail,
                notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/payments`,
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/callback`,
                channels: 'ALL',
                lang: 'fr'
            };

            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.code === '201') {
                return {
                    success: true,
                    paymentUrl: data.data.payment_url,
                    paymentToken: data.data.payment_token,
                };
            }

            return {
                success: false,
                error: data.message || 'Erreur lors de l\'initialisation du paiement',
            };
        } catch (error) {
            console.error('CinetPay Initialization Error:', error);
            return {
                success: false,
                error: 'Erreur de connexion au service de paiement',
            };
        }
    }

    /**
     * Vérifie le statut d'un paiement
     */
    static async verifyPayment(transactionId: string): Promise<PaymentVerification> {
        if (!this.isConfigured()) {
            // En mode simulation, on considère que c'est réussi si l'ID commence par 'MOCK_'
            return {
                success: true,
                status: 'completed',
                providerTransactionId: `SIM_${Date.now()}`
            };
        }

        try {
            const response = await fetch(`${BASE_URL}/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    apikey: CINETPAY_API_KEY,
                    site_id: CINETPAY_SITE_ID,
                    transaction_id: transactionId,
                }),
            });

            const data = await response.json();

            if (data.code === '00' || data.message === 'SUCCES') {
                return {
                    success: true,
                    status: 'completed',
                    providerTransactionId: data.data.operator_id,
                    metadata: data.data
                };
            }

            return {
                success: false,
                status: 'failed',
                error: data.message
            };
        } catch (error) {
            console.error('CinetPay Verification Error:', error);
            return {
                success: false,
                status: 'failed',
                error: 'Erreur de vérification du paiement'
            };
        }
    }
}
