import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Check, AlertCircle, Loader2 } from 'lucide-react';
import TopBanner from "../components/TopBanner.tsx";
import Header from "../components/Header.tsx";
import Navigation from "../components/Navigation.tsx";
import Footer from "../components/Footer.tsx";
import {supabase} from "../lib/supabase.tsx";

// TypeScript interfaces
interface Booking {
    id: number;
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: string;
    notes: string;
    created_at: string;
}

interface FormData {
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: string;
    notes: string;
}

export default function BookingPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        guests: '2',
        notes: ''
    });


    // Fetch bookings on mount
    useEffect(() => {
        const savedBookings = localStorage.getItem('bookings');
        if (savedBookings) {
            setBookings(JSON.parse(savedBookings) as Booking[]);
        }
    }, []);

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        // Validate required fields
        if (!formData.name || !formData.email || !formData.date || !formData.time) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        try {
            // Insert into Supabase
            const {error: supabaseError } = await supabase
                .from('bookings')
                .select();

            if (supabaseError) {
                throw supabaseError;
            }

            // Success!
            setSuccess(true);

            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                date: '',
                time: '',
                guests: '2',
                notes: ''
            });

            // Hide success message after 5 seconds
            setTimeout(() => setSuccess(false), 5000);


        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof FormData, value: string): void => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const timeSlots: string[] = [
        '17:00', '17:30', '18:00', '18:30', '19:00',
        '19:30', '20:00', '20:30', '21:00', '21:30'
    ];

    const today: string = new Date().toISOString().split('T')[0];

    const formatTime = (time: string): string => {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const formatDate = (date: string): string => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (

        < div className="min-h-screen" style={{ backgroundColor: '#f5f1e8' }}>
            <TopBanner/>
            <Header/>
            <Navigation/>
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Success Message */}
                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-green-900">Reservation Confirmed!</h3>
                            <p className="text-sm text-green-700 mt-1">
                                We've sent a confirmation email to {formData.email}. See you soon!
                            </p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-900">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Booking Form */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Reservation</h2>

                    <div className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="John Doe"
                            />
                        </div>

                        {/* Email & Phone */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('phone', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('date', e.target.value)}
                                    min={today}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Time *
                                </label>
                                <select
                                    value={formData.time}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('time', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">Select time</option>
                                    {timeSlots.map((slot: string) => (
                                        <option key={slot} value={slot}>
                                            {formatTime(slot)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Party Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Users className="w-4 h-4 inline mr-1" />
                                Party Size *
                            </label>
                            <select
                                value={formData.guests}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('guests', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((num: number) => (
                                    <option key={num} value={num}>
                                        {num} {num === 1 ? 'Guest' : 'Guests'}
                                    </option>
                                ))}
                                <option value="9+">9+ Guests (We'll call you)</option>
                            </select>
                        </div>

                        {/* Special Requests */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Special Requests (Optional)
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('notes', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                placeholder="Allergies, dietary restrictions, special occasions..."
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Confirm Reservation'
                            )}
                        </button>
                    </div>
                </div>

                {/* Your Bookings */}
                {bookings.length > 0 && (
                    <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Recent Reservations</h2>
                        <div className="space-y-4">
                            {bookings.slice(-5).reverse().map((booking: Booking) => (
                                <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{booking.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {formatDate(booking.date)} at {formatTime(booking.time)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Party of {booking.guests} • {booking.email}
                                            </p>
                                            {booking.notes && (
                                                <p className="text-sm text-gray-500 mt-1 italic">
                                                    Note: {booking.notes}
                                                </p>
                                            )}
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Confirmed
                    </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <Footer/>
        </div>
    );
};