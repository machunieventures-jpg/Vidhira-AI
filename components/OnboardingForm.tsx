import React, { useState } from 'react';
import type { UserData } from '../types';
import { User, Calendar, Globe, MapPin, Mail, Phone, Sparkles, Loader, VidhiraLogoMark, LockIcon } from './common/Icons';

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
            <VidhiraLogoMark size={36} className="text-[--cosmic-purple] icon-glow" />
            <h1 className="text-5xl font-bold logo-glow" style={{ fontFamily: 'Cinzel, serif' }}>
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

          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4 flex items-center justify-center gap-1.5">
            <LockIcon size={12} className="inline-block" />
            Your data is encrypted and never shared.
          </p>
        </form>
      </div>
    </div>
  );
};

export default OnboardingForm;