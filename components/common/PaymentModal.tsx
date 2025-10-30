import React, { useState, useEffect } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentProviderButton: React.FC<{
    name: string;
    icon: React.ReactNode;
    onClick: () => void;
    isProcessing: boolean;
    isSelected: boolean;
}> = ({ name, icon, onClick, isProcessing, isSelected }) => {
    return (
        <button
            onClick={onClick}
            disabled={isProcessing}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-300 ${
                isSelected && isProcessing
                    ? 'bg-cosmic-gold/20 border-cosmic-gold'
                    : 'bg-deep-void/50 border-lunar-grey/50 hover:border-cosmic-gold hover:bg-void-tint'
            } disabled:opacity-50 disabled:cursor-wait`}
        >
            {isSelected && isProcessing ? (
                <>
                    <div className="w-5 h-5 border-2 border-starlight/50 border-t-starlight rounded-full animate-spin"></div>
                    <span className="text-starlight">Processing...</span>
                </>
            ) : (
                <>
                    <div className="w-6 h-6">{icon}</div>
                    <span className="font-medium text-starlight">{name}</span>
                </>
            )}
        </button>
    );
};


const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSuccess }) => {
    const [processingMethod, setProcessingMethod] = useState<string | null>(null);

    // Reset processing state when modal is opened/closed
    useEffect(() => {
        if (isOpen) {
            setProcessingMethod(null);
        }
    }, [isOpen]);

    const handlePayment = (method: string) => {
        setProcessingMethod(method);
        // Simulate a network request for payment processing
        setTimeout(() => {
            // On successful response from the "payment gateway":
            onPaymentSuccess();
            onClose(); // Close the modal and let the main app handle success UI
        }, 2000); // 2 second delay for simulation
    };

    if (!isOpen) return null;

    const paymentProviders = [
        { name: 'eSewa', icon: <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path fill="#60bb46" d="M0 132.88V256h126.56c69.84 0 126.56-56.72 126.56-126.56v-3.44c-28.96 72.88-99.28 123.12-181.2 123.12H0zm253.12-9.28c-3.44-72.88-63.04-123.12-132.88-123.12H.96L0 13.76C0 6.16.48 0 .96 0h122.16c69.84 0 126.56 56.72 126.56 126.56v-3.04z"/></svg> },
        { name: 'Khalti', icon: <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><path fill="#5d2e8e" d="M125.2 65.8c-1-2-2.1-3.9-3.4-5.6 0 0-4.3-5.8-4.3-5.9-2-2.6-4.5-5.1-7.2-7.1-1-.8-2-1.5-3-2.2-1.3-1-2.6-1.9-4-2.8-1.5-.9-3.1-1.7-4.7-2.4-1.2-.5-2.5-1-3.7-1.4-1.7-.6-3.5-1-5.3-1.4-1-.2-2.1-.4-3.1-.5-1.9-.2-3.8-.2-5.7-.1-1.5.1-3 .3-4.5.6-1.7.3-3.4.8-5 1.4-1.2.4-2.4.9-3.6 1.4-1.6.7-3.2 1.5-4.6 2.4-1.4.9-2.7 1.9-4 2.9-1 .8-1.9 1.6-2.9 2.4-3.2 2.6-6 5.6-8.2 8.9-1.2 1.8-2.2 3.6-3.1 5.6-1.5 3.5-2.2 7.3-2.1 11.1.1 2 .4 4 .8 5.9.6 2.3 1.5 4.6 2.7 6.7 1.5 2.6 3.4 5.1 5.6 7.3 1.8 1.8 3.7 3.4 5.8 4.8 1.6 1.1 3.3 2.1 5 2.9 1.3.6 2.7 1.2 4.1 1.6 1.8.6 3.7 1 5.6 1.3 1 .2 2.1.3 3.1.3 2.2.1 4.4 0 6.6-.2 1.8-.2 3.5-.5 5.2-.9 1.5-.4 3-.9 4.4-1.5 1.8-.7 3.5-1.6 5.2-2.7 1.2-.8 2.3-1.6 3.4-2.6 1.8-1.5 3.5-3.2 5-5.1 1.7-2.1 3.2-4.5 4.4-7 .9-1.8 1.6-3.6 2.2-5.5 1.1-3.7 1.5-7.6 1-11.4-.2-1.8-.6-3.6-1.1-5.4zM70.6 93.2c-2 1-4.2 1.6-6.4 1.7-1 .1-2 .1-3 .1-1.3 0-2.6 0-3.9-.1-1-.1-2.1-.2-3.1-.4-1.3-.2-2.6-.5-3.8-.9-.9-.3-1.8-.6-2.7-1-1.2-.6-2.3-1.2-3.4-2-1-.8-1.9-1.6-2.7-2.5-.6-.7-1.2-1.4-1.7-2.2-.8-1.3-1.5-2.7-2-4.1-.4-1.1-.7-2.3-1-3.4-.2-.8-.4-1.7-.5-2.5-.2-1.3-.3-2.6-.2-3.9.1-1.2.2-2.4.5-3.6.3-1 .6-2 .9-2.9.6-1.6 1.3-3.1 2.2-4.6.7-1.1 1.4-2.2 2.3-3.2.7-.8 1.4-1.5 2.2-2.2.9-.8 1.9-1.5 2.9-2.1 1.3-.8 2.7-1.5 4.1-2 1-.3 2-.6 3-.8 1.3-.3 2.7-.5 4-.6 1.1-.1 2.2-.1 3.3-.1 1.5 0 3 .1 4.5.3 1.2.2 2.4.4 3.6.8.9.3 1.8.6 2.7.9 1.3.5 2.6 1.1 3.8 1.8 1 .6 1.9 1.3 2.8 2 .7.6 1.4 1.2 2 1.8.9.8 1.8 1.7 2.6 2.6.5.6 1 1.3 1.5 1.9.9 1.4 1.7 2.9 2.3 4.4.4 1 .8 2 1.1 3.1.2.8.4 1.7.5 2.5.2 1.4.3 2.8.2 4.2-.1 1.1-.3 2.3-.5 3.4-.3 1-.7 2-1.1 3-.7 1.6-1.5 3.1-2.5 4.5-.7 1.1-1.5 2.1-2.4 3.1-.7.8-1.5 1.5-2.3 2.2-.9.7-1.8 1.4-2.8 2-1.4.8-2.9 1.5-4.4 2-1 .3-2 .6-3 .8-1.2.2-2.4.4-3.6.5zm11-40.4c-.4.5-.8.9-1.2 1.3-.7.7-1.5 1.3-2.3 1.9-1.2.8-2.5 1.5-3.8 2-.9.3-1.8.6-2.7.8-1.2.3-2.4.4-3.6.5-1.1.1-2.1.1-3.2.1-1.5 0-2.9-.1-4.4-.3-1.1-.2-2.3-.4-3.4-.8-.9-.3-1.7-.6-2.6-.9-1.2-.5-2.4-1.1-3.5-1.7-.9-.5-1.8-1.1-2.6-1.8-.7-.5-1.3-1.1-1.9-1.7-.8-.8-1.5-1.7-2.1-2.6-.5-.7-1-1.4-1.3-2.2-.6-1.3-1.1-2.7-1.4-4.1-.2-1-.3-2.1-.4-3.1s0-2.1.2-3.1c.2-1.2.4-2.3.8-3.4.3-.8.6-1.6.9-2.4.6-1.3 1.3-2.6 2.1-3.8.5-.8 1.1-1.5 1.8-2.1.7-.6 1.5-1.2 2.2-1.7.9-.6 1.9-1.2 2.9-1.6 1.2-.6 2.4-1 3.7-1.3.9-.2 1.8-.4 2.8-.5 1.1-.1 2.3-.2 3.4-.1.9 0 1.8.1 2.7.2 1.1.1 2.2.4 3.3.7.8.2 1.6.5 2.4.8 1.1.4 2.2.9 3.2 1.5.8.5 1.6 1 2.3 1.6.7.6 1.3 1.2 1.9 1.8.8.9 1.5 1.8 2.1 2.8.5.8.9 1.6 1.2 2.4.6 1.3 1.1 2.6 1.4 4 .2 1 .3 2 .4 3 .1 1.5 0 3-.1 4.5s-.4 2.9-.8 4.3c-.3.9-.6 1.8-1 2.6-.6 1.3-1.4 2.6-2.2 3.7-.6.8-1.2 1.5-1.9 2.1-.7.6-1.4 1.2-2.2 1.6z"/></svg> },
        { name: 'UPI', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#0277bd" d="M24,4c-5.5,0-10,4.5-10,10v2h20v-2C34,8.5,29.5,4,24,4z"/><path fill="#81d4fa" d="M32.9,40.7c-0.1-1.9-0.5-3.8-1.2-5.5c-0.2-0.5-0.5-1-0.8-1.4c-0.1-0.1-0.1-0.2-0.2-0.3 c-0.5-0.8-1.2-1.4-2-1.9c-0.4-0.3-0.9-0.5-1.4-0.7c-0.4-0.1-0.8-0.2-1.2-0.3c-0.6-0.1-1.2-0.2-1.8-0.2c-0.9,0-1.8,0.1-2.7,0.3 c-0.6,0.1-1.2,0.3-1.8,0.5c-0.5,0.2-1,0.5-1.5,0.8c-0.8,0.5-1.5,1.1-2,1.9c-0.1,0.1-0.2,0.2-0.2,0.3c-0.3,0.4-0.6,0.9-0.8,1.4 c-0.7,1.7-1.1,3.5-1.2,5.5H14c0,3.3,2.7,6,6,6h8c3.3,0,6-2.7,6-6H32.9z"/><path fill="#03a9f4" d="M14,16v13.6c0,0,0,0,0,0c0.1,2.1,0.5,4.1,1.2,6.1h17.5c0.7-2,1.1-4,1.2-6.1c0,0,0,0,0,0V16H14z"/><path fill="#fff" d="M24,20c-1.1,0-2-0.9-2-2v-4c0-1.1,0.9-2,2-2s2,0.9,2,2v4C26,19.1,25.1,20,24,20z"/><path fill="#fbc02d" d="M24,26c-3.3,0-6,2.7-6,6s2.7,6,6,6s6-2.7,6-6S27.3,26,24,26z"/><path fill="#fff" d="M26.9,34.9l-2.1-2.1c-0.2-0.2-0.5-0.2-0.7,0l-2.1,2.1c-0.2,0.2-0.2,0.5,0,0.7l2.1,2.1c0.2,0.2,0.5,0.2,0.7,0l2.1-2.1C27.1,35.4,27.1,35.1,26.9,34.9z"/></svg> },
        { name: 'PayPal', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#003087" d="M13.2 6.1H8.3c-.6 0-1 .3-1.1.9L4.5 18.5c0 .1-.1.1 0 .2h2.9c0 .1.1.1.1.1l1.1-7.1c.1-.6.5-1 1.1-1h2.3c2.4 0 4.1-1.3 4.4-3.5.2-1.5-.6-2.5-2-2.9-.6-.2-1.3-.3-2.1-.3zm-1.1 2.3c-.1.6-.5.9-1.1.9h-1.3L11 6.8c.1-.4.5-.6 1-.6h.4c.4 0 .7.1.9.3.3.3.4.7.2 1.2z"/><path fill="#009cde" d="M20.2 8.6c-.3-.2-.7-.3-1.1-.3h-3.4c.2 1.4-.4 2.4-1.4 2.7-.7.2-1.5.1-2.3-.1L11 18.6c.1.4.5.7 1 .7h.5c.6 0 1-.3 1.1-.9l.6-3.8c.1-.6.5-1 1.1-1h1.2c2.1 0 3.7-1.1 4-3.1.2-1.3-.4-2.2-1.3-2.6z"/></svg> },
        { name: 'G Pay', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M12.01,8.35c0-1-0.62-1.54-1.6-1.54c-0.89,0-1.59,0.54-1.59,1.51c0,0.98,0.71,1.55,1.72,1.55 C11.39,9.88,12.01,9.31,12.01,8.35z"/><path fill="#34A853" d="M12.01,10.68h-1.6c-1.36,0-2.29,0.73-2.29,1.94c0,1.11,0.79,1.82,2.02,1.82c1.02,0,1.69-0.49,1.82-1.25h-1.11 c-0.19,0.38-0.56,0.61-0.95,0.61c-0.61,0-0.99-0.45-0.99-1.2c0-0.78,0.44-1.2,1.11-1.2h1.05V10.68z"/><path fill="#FBBC05" d="M10.42,15.28c-0.91,0-1.52,0.53-1.52,1.44c0,0.84,0.5,1.41,1.52,1.41c0.94,0,1.48-0.55,1.48-1.36 c0-0.42-0.16-0.78-0.53-1.02C11.02,15.42,10.7,15.28,10.42,15.28z"/><path fill="#EA4335" d="M18.5,10.49v-1.1h-3.3v7.33h1.49v-2.73c0-0.98,0.6-1.48,1.38-1.48c0.23,0,0.44,0.03,0.64,0.08V10.8 C18.82,10.72,18.66,10.68,18.5,10.49z"/><path fill="#4285F4" d="M22.5,11.3v-1.12l-2.2,0.02v1.1c0,1.05-0.55,1.66-1.46,1.66c-0.78,0-1.39-0.55-1.39-1.55 c0-1.04,0.61-1.57,1.39-1.57c0.55,0,0.96,0.22,1.23,0.5l0.82-0.69c-0.45-0.49-1.18-0.8-2.07-0.8c-1.48,0-2.58,1.06-2.58,2.56 c0,1.52,1.08,2.58,2.62,2.58c1.39,0,2.37-0.91,2.37-2.18V11.3z"/><path fill="#34A853" d="M12,2c5.52,0,10,4.48,10,10s-4.48,10-10,10S2,17.52,2,12S6.48,2,12,2z" fill-opacity="0.1"/><path fill="none" stroke="#E0E0E0" stroke-width="2" d="M12,2c5.52,0,10,4.48,10,10s-4.48,10-10,10S2,17.52,2,12S6.48,2,12,2z"/></svg> },
        { name: 'Mastercard', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="7.7" cy="12" r="7.2" fill="#EA001B"/><circle cx="16.3" cy="12" r="7.2" fill="#F79E1B"/><path d="M12 7.7a7.2 7.2 0 0 1 0 8.6a7.2 7.2 0 0 0 0-8.6z" fill="#FF5F00"/></svg> },
    ];
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-void-tint w-full max-w-sm rounded-2xl shadow-2xl border border-lunar-grey/20 p-8 text-starlight animate-modal-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center">
                    <h3 className="text-2xl font-bold font-display">Unlock Full Report</h3>
                    <p className="text-lunar-grey mt-1">Access your complete soul map.</p>
                    <p className="text-4xl font-bold font-display my-4 text-cosmic-gold">$3.30</p>
                </div>
                
                <div className="space-y-3 my-6">
                    <p className="text-sm font-semibold text-center text-lunar-grey">Choose a payment method</p>
                    <div className="grid grid-cols-2 gap-3">
                        {paymentProviders.map(provider => (
                            <PaymentProviderButton 
                                key={provider.name}
                                name={provider.name}
                                icon={provider.icon}
                                onClick={() => handlePayment(provider.name)}
                                isProcessing={!!processingMethod}
                                isSelected={processingMethod === provider.name}
                            />
                        ))}
                    </div>
                </div>

                <p className="text-xs text-lunar-grey/50 text-center mt-4">This is a simulated payment for demonstration purposes. Clicking a method will simulate a successful transaction.</p>
            </div>
        </div>
    );
};

export default PaymentModal;