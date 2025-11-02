import React, { useState, useEffect } from 'react';

// Icons
const Loader = ({ size = 20, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="6"/><line x1="12" x2="12" y1="18" y2="22"/><line x1="4.93" x2="7.76" y1="4.93" y2="7.76"/><line x1="16.24" x2="19.07" y1="16.24" y2="19.07"/><line x1="2" x2="6" y1="12" y2="12"/><line x1="18" x2="22" y1="12" y2="12"/><line x1="4.93" x2="7.76" y1="19.07" y2="16.24"/><line x1="16.24" x2="19.07" y1="7.76" y2="4.93"/></svg>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSuccess }) => {
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setError('');
            setIsProcessing(false);
            setCardDetails({ number: '', expiry: '', cvc: '', name: '' });
        }
    }, [isOpen]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        let formattedValue = value;
        if (name === 'number') {
            formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
        } else if (name === 'expiry') {
            formattedValue = value.replace(/\s/g, '').replace('/', '');
            if (formattedValue.length > 2) {
                formattedValue = formattedValue.slice(0, 2) + ' / ' + formattedValue.slice(2, 4);
            }
        }
        
        setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    };

    const validateForm = () => {
        if (!cardDetails.name.trim()) return "Please enter the name on the card.";
        if (!/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(cardDetails.number)) return "Please enter a valid 16-digit card number.";
        if (!/^\d{2}\s\/\s\d{2}$/.test(cardDetails.expiry)) return "Please enter a valid expiry date (MM / YY).";
        const [month] = cardDetails.expiry.split(' / ');
        if (parseInt(month, 10) < 1 || parseInt(month, 10) > 12) return "Please enter a valid month (01-12)."
        if (!/^\d{3,4}$/.test(cardDetails.cvc)) return "Please enter a valid CVC.";
        return '';
    };

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }
        setError('');
        setIsProcessing(true);
        
        setTimeout(() => {
            setIsProcessing(false);
            onPaymentSuccess();
            onClose(); 
        }, 2500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print" onClick={onClose}>
            <div 
                className="glass-card w-full max-w-md p-6 md:p-8 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Unlock Your Report</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">Pay with card to access your full soul map.</p>
                    </div>
                     <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white text-3xl leading-none">&times;</button>
                </div>
                
                <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                        <label htmlFor="cardName" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Name on card</label>
                        <input type="text" id="cardName" name="name" value={cardDetails.name} onChange={handleInputChange} className="input-cosmic" placeholder="John Doe"/>
                    </div>

                    <div>
                        <label htmlFor="cardNumber" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Card details</label>
                        <div className="relative">
                            <input type="text" id="cardNumber" name="number" value={cardDetails.number} onChange={handleInputChange} className="input-cosmic pl-4 pr-32 py-3" placeholder="0000 0000 0000 0000" maxLength={19} inputMode="numeric"/>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                                <input type="text" name="expiry" value={cardDetails.expiry} onChange={handleInputChange} className="w-20 bg-transparent text-center outline-none" placeholder="MM / YY" maxLength={7} inputMode="numeric"/>
                                <input type="text" name="cvc" value={cardDetails.cvc} onChange={e => setCardDetails(prev => ({...prev, cvc: e.target.value.replace(/\D/g, '')}))} className="w-12 bg-transparent text-center outline-none" placeholder="CVC" maxLength={4} inputMode="numeric"/>
                            </div>
                        </div>
                    </div>
                    
                    {error && <p className="text-[--rose-accent] text-sm text-center pt-1">{error}</p>}

                    <button type="submit" disabled={isProcessing} className="w-full mt-4 btn-cosmic">
                        {isProcessing ? (
                            <><Loader className="animate-spin" /> Processing...</>
                        ) : (
                            'Pay $9.99'
                        )}
                    </button>
                </form>
                
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">We support local payment methods which will be available at the next step.</p>

                <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 flex items-center justify-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v2H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
                    <span>Secure payment powered by Stripe simulation</span>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
