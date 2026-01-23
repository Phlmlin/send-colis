// Types générés pour la base de données SendColis

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    full_name: string | null
                    phone: string | null
                    avatar_url: string | null
                    id_document_url: string | null
                    id_document_type: 'passport' | 'national_id' | 'driver_license' | null
                    id_verified: boolean
                    verification_status: 'pending' | 'verified' | 'rejected'
                    verification_date: string | null
                    role: 'user' | 'admin'
                    account_status: 'active' | 'suspended' | 'banned'
                    total_shipments_sent: number
                    total_shipments_delivered: number
                    average_rating: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    id_document_url?: string | null
                    id_document_type?: 'passport' | 'national_id' | 'driver_license' | null
                    id_verified?: boolean
                    verification_status?: 'pending' | 'verified' | 'rejected'
                    verification_date?: string | null
                    role?: 'user' | 'admin'
                    account_status?: 'active' | 'suspended' | 'banned'
                    total_shipments_sent?: number
                    total_shipments_delivered?: number
                    average_rating?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    id_document_url?: string | null
                    id_document_type?: 'passport' | 'national_id' | 'driver_license' | null
                    id_verified?: boolean
                    verification_status?: 'pending' | 'verified' | 'rejected'
                    verification_date?: string | null
                    role?: 'user' | 'admin'
                    account_status?: 'active' | 'suspended' | 'banned'
                    total_shipments_sent?: number
                    total_shipments_delivered?: number
                    average_rating?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            listings: {
                Row: {
                    id: string
                    user_id: string
                    departure_city: string
                    arrival_city: string
                    departure_date: string
                    arrival_date: string | null
                    transport_type: 'plane' | 'train' | 'bus' | 'boat' | 'car' | null
                    flight_number: string | null
                    available_weight: number
                    price_per_kg: number
                    accepted_parcel_types: string[] | null
                    special_conditions: string | null
                    description: string | null
                    image_url: string | null
                    status: 'active' | 'full' | 'completed' | 'cancelled'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    departure_city: string
                    arrival_city: string
                    departure_date: string
                    arrival_date?: string | null
                    transport_type?: 'plane' | 'train' | 'bus' | 'boat' | 'car' | null
                    flight_number?: string | null
                    available_weight: number
                    price_per_kg: number
                    accepted_parcel_types?: string[] | null
                    special_conditions?: string | null
                    description?: string | null
                    image_url?: string | null
                    status?: 'active' | 'full' | 'completed' | 'cancelled'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    departure_city?: string
                    arrival_city?: string
                    departure_date?: string
                    arrival_date?: string | null
                    transport_type?: 'plane' | 'train' | 'bus' | 'boat' | 'car' | null
                    flight_number?: string | null
                    available_weight?: number
                    price_per_kg?: number
                    accepted_parcel_types?: string[] | null
                    special_conditions?: string | null
                    description?: string | null
                    image_url?: string | null
                    status?: 'active' | 'full' | 'completed' | 'cancelled'
                    created_at?: string
                    updated_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    listing_id: string
                    sender_id: string
                    traveler_id: string
                    parcel_description: string | null
                    parcel_photo_url: string | null
                    weight_requested: number
                    parcel_dimensions: Json | null
                    parcel_type: string | null
                    connection_fee: number
                    transport_price: number
                    commission_rate: number
                    commission_amount: number | null
                    total_price: number
                    traveler_payout: number | null
                    status: 'pending_approval' | 'approved' | 'connection_fee_paid' | 'transport_fee_paid' | 'in_transit' | 'delivered' | 'cancelled' | 'disputed'
                    payment_status: 'pending' | 'connection_paid' | 'fully_paid' | 'held_in_escrow' | 'released' | 'refunded'
                    contract_url: string | null
                    contract_signed_sender: boolean
                    contract_signed_traveler: boolean
                    pickup_date: string | null
                    delivery_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    listing_id: string
                    sender_id: string
                    traveler_id: string
                    parcel_description?: string | null
                    parcel_photo_url?: string | null
                    weight_requested: number
                    parcel_dimensions?: Json | null
                    parcel_type?: string | null
                    connection_fee?: number
                    transport_price: number
                    commission_rate?: number
                    commission_amount?: number | null
                    total_price: number
                    traveler_payout?: number | null
                    status?: 'pending_approval' | 'approved' | 'connection_fee_paid' | 'transport_fee_paid' | 'in_transit' | 'delivered' | 'cancelled' | 'disputed'
                    payment_status?: 'pending' | 'connection_paid' | 'fully_paid' | 'held_in_escrow' | 'released' | 'refunded'
                    contract_url?: string | null
                    contract_signed_sender?: boolean
                    contract_signed_traveler?: boolean
                    pickup_date?: string | null
                    delivery_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    listing_id?: string
                    sender_id?: string
                    traveler_id?: string
                    parcel_description?: string | null
                    parcel_photo_url?: string | null
                    weight_requested?: number
                    parcel_dimensions?: Json | null
                    parcel_type?: string | null
                    connection_fee?: number
                    transport_price?: number
                    commission_rate?: number
                    commission_amount?: number | null
                    total_price?: number
                    traveler_payout?: number | null
                    status?: 'pending_approval' | 'approved' | 'connection_fee_paid' | 'transport_fee_paid' | 'in_transit' | 'delivered' | 'cancelled' | 'disputed'
                    payment_status?: 'pending' | 'connection_paid' | 'fully_paid' | 'held_in_escrow' | 'released' | 'refunded'
                    contract_url?: string | null
                    contract_signed_sender?: boolean
                    contract_signed_traveler?: boolean
                    pickup_date?: string | null
                    delivery_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            prohibited_items: {
                Row: {
                    id: string
                    name: string
                    category: string
                    description: string | null
                    severity: 'warning' | 'forbidden' | null
                    icon: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    category: string
                    description?: string | null
                    severity?: 'warning' | 'forbidden' | null
                    icon?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    category?: string
                    description?: string | null
                    severity?: 'warning' | 'forbidden' | null
                    icon?: string | null
                    created_at?: string
                }
            }
            disputes: {
                Row: {
                    id: string
                    transaction_id: string
                    reported_by: string
                    reason: string
                    description: string | null
                    status: 'open' | 'in_progress' | 'resolved' | 'closed'
                    resolution: string | null
                    resolved_by: string | null
                    resolved_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    transaction_id: string
                    reported_by: string
                    reason: string
                    description?: string | null
                    status?: 'open' | 'in_progress' | 'resolved' | 'closed'
                    resolution?: string | null
                    resolved_by?: string | null
                    resolved_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    transaction_id?: string
                    reported_by?: string
                    reason?: string
                    description?: string | null
                    status?: 'open' | 'in_progress' | 'resolved' | 'closed'
                    resolution?: string | null
                    resolved_by?: string | null
                    resolved_at?: string | null
                    created_at?: string
                }
            }
            payment_transactions: {
                Row: {
                    id: string
                    transaction_id: string
                    payer_id: string
                    amount: number
                    payment_method: 'mobile_money' | 'card' | 'paypal' | 'bank_transfer' | null
                    payment_provider: string | null
                    provider_transaction_id: string | null
                    status: 'pending' | 'completed' | 'failed' | 'refunded'
                    metadata: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    transaction_id: string
                    payer_id: string
                    amount: number
                    payment_method?: 'mobile_money' | 'card' | 'paypal' | 'bank_transfer' | null
                    payment_provider?: string | null
                    provider_transaction_id?: string | null
                    status?: 'pending' | 'completed' | 'failed' | 'refunded'
                    metadata?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    transaction_id?: string
                    payer_id?: string
                    amount?: number
                    payment_method?: 'mobile_money' | 'card' | 'paypal' | 'bank_transfer' | null
                    payment_provider?: string | null
                    provider_transaction_id?: string | null
                    status?: 'pending' | 'completed' | 'failed' | 'refunded'
                    metadata?: Json | null
                    created_at?: string
                }
            }
        }
    }
}
