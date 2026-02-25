export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaymentRequest {
    transactionId: string;
    amount: number;
    currency: string;
    description: string;
    customerName: string;
    customerEmail: string;
}

export interface PaymentResponse {
    success: boolean;
    paymentUrl?: string;
    paymentToken?: string;
    error?: string;
}

export interface PaymentVerification {
    success: boolean;
    status: PaymentStatus;
    providerTransactionId?: string;
    metadata?: any;
    error?: string;
}
