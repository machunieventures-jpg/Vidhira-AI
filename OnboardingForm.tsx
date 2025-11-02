import React, { useState } from 'react';
import type { UserData } from '../types';

// Icon Components (from lucide-react SVGs)
const User = ({ size = 16, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const Calendar = ({ size = 16, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const Globe = ({ size = 16, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const MapPin = ({ size = 16, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const Mail = ({ size = 16, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const Phone = ({ size = 16, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const Sparkles = ({ size = 20, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.9 4.8-4.8 1.9 4.8 1.9L12 21l1.9-4.8 4.8-1.9-4.8-1.9L12 3zM5 3v4M19 17v4M3 5h4M17 19h4"/></svg>;
const Loader = ({ size = 20, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="6"/><line x1="12" x2="12" y1="18" y2="22"/><line x1="4.93" x2="7.76" y1="4.93" y2="7.76"/><line x1="16.24" x2="19.07" y1="16.24" y2="19.07"/><line x1="2" x2="6" y1="12" y2="12"/><line x1="18" x2="22" y1="12" y2="12"/><line x1="4.93" x2="7.76" y1="19.07" y2="16.24"/><line x1="16.24" x2="19.07" y1="7.76" y2="4.93"/></svg>;

interface OnboardingFormProps {
  onSubmit: (data: UserData) => void;
  isLoading: boolean;
  initialData?: UserData;
  onCancel?: () => void;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onSubmit, isLoading, initialData, onCancel }) => {
  const [formData, setFormData] = useState<Partial<UserData>>({
    fullName: initialData?.fullName || '',
    dob: initialData?.dob || '',
    time: initialData?.time || '',
    location: initialData?.location || '',
    gender: initialData?.gender || '',
    language: initialData?.language || 'English',
    phoneNumber: initialData?.phoneNumber || '',
    email: initialData?.email || '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.dob || !formData.email || !formData.time || !formData.location || !formData.gender || !formData.language || !formData.phoneNumber) {
      setError('Please fill out all fields to generate your blueprint.');
      return;
    }
    setError('');
    onSubmit(formData as UserData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="glass-card max-w-2xl w-full animate-slide-up">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles size={32} className="text-[--cosmic-purple]" />
            <h1 className="text-5xl font-bold gradient-text" style={{ fontFamily: 'Cinzel, serif' }}>
              Vidhira
            </h1>
          </div>
          <p className="text-xl text-[--cosmic-blue] dark:text-[--stardust]">Discover Your Cosmic Blueprint</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">AI-Powered Numerology & Vedic Wisdom</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              <User size={16} className="inline mr-2" />
              Full Name
            </label>
            <input type="text" name="fullName" className="input-cosmic" placeholder="As on birth certificate" value={formData.fullName} onChange={handleInputChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"><Calendar size={16} className="inline mr-2" />Date of Birth</label>
              <input type="date" name="dob" className="input-cosmic" value={formData.dob} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"><Globe size={16} className="inline mr-2" />Time of Birth</label>
              <input type="time" name="time" className="input-cosmic" value={formData.time} onChange={handleInputChange} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"><MapPin size={16} className="inline mr-2" />Birth Location</label>
            <input type="text" name="location" className="input-cosmic" placeholder="City, Country" value={formData.location} onChange={handleInputChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"><Mail size={16} className="inline mr-2" />Email Address</label>
                <input type="email" name="email" className="input-cosmic" placeholder="your@email.com" value={formData.email} onChange={handleInputChange} />
            </div>
            <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"><Phone size={16} className="inline mr-2" />Phone Number</label>
                <input type="tel" name="phoneNumber" className="input-cosmic" placeholder="+1 234 567 8900" value={formData.phoneNumber} onChange={handleInputChange} />
            </div>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Gender</label>
                <select name="gender" className="input-cosmic" value={formData.gender} onChange={handleInputChange}>
                    <option value="" disabled>Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Preferred Language</label>
                <select name="language" className="input-cosmic" value={formData.language} onChange={handleInputChange}>
                    <option value="English">English</option>
                    <option value="Nepali">नेपाली (Nepali)</option>
                    <option value="Spanish">Español (Spanish)</option>
                    <option value="French">Français (French)</option>
                    <option value="German">Deutsch (German)</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Portuguese">Português (Portuguese)</option>
                </select>
            </div>
          </div>

          {error && <p className="text-sm text-center text-[--rose-accent]">{error}</p>}
          
          <button type="submit" className="btn-cosmic w-full text-lg mt-6" disabled={isLoading}>
            {isLoading ? (
              <><Loader className="animate-spin" size={20} /> Generating Your Blueprint...</>
            ) : (
              <><Sparkles size={20} /> Reveal My Cosmic Blueprint</>
            )}
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            🔒 Your data is encrypted and never shared.
          </p>
        </form>
      </div>
    </div>
  );
};

export default OnboardingForm;
