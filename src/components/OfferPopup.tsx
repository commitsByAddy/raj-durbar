import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function OfferPopup() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show popup when component mounts
        setIsOpen(true);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black opacity-90"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn">
                {/* Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Content */}
                <div className="text-center">
                    <div className="mb-4">
            <span className="inline-block bg-red-900 text-white text-sm font-bold px-4 py-1 rounded-full">
              COLLECTION OFFER
            </span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        Get 10% Off!
                    </h2>

                    <p className="text-gray-600 mb-6">
                        On collections over £15
                    </p>

                    <div className="space-y-3">
                        <button className="w-full bg-red-900 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
                            <a href="https://3554.letsorder.uk/?inorder=1">Order Now</a>
                        </button>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors"
                        >
                            No thanks, I'll pay full price
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}