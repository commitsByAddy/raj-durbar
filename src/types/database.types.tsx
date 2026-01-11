export interface Database {
    public: {
        Tables: {
            bookings: {
                Row: {
                    id: number;
                    name: string;
                    email: string;
                    phone: string | null;
                    date: string;
                    time: string;
                    guests: string;
                    notes: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: number;
                    name: string;
                    email: string;
                    phone?: string | null;
                    date: string;
                    time: string;
                    guests: string;
                    notes?: string | null;
                    created_at?: string;
                };
            };
        };
    };
}