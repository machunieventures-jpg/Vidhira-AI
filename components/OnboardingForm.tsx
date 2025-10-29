
import React, { useState } from 'react';
import type { UserData } from '../types';

interface OnboardingFormProps {
  onSubmit: (data: UserData) => void;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onSubmit }) => {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState('');
  const [language, setLanguage] = useState('English');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !dob || !time || !location || !gender || !language || !phoneNumber) {
      setError('Please fill out all fields to generate your blueprint.');
      return;
    }
    setError('');
    onSubmit({ fullName, dob, time, location, gender, language, phoneNumber });
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-void-tint/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-lunar-grey/20">
      <h2 className="text-2xl font-bold text-center text-starlight font-display mb-2">Generate Your Blueprint</h2>
      <p className="text-center text-lunar-grey mb-6">Enter your details for a personalized life report.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-lunar-grey mb-1">Full Name (as on birth certificate)</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-deep-void/50 border border-lunar-grey/50 text-starlight rounded-lg px-4 py-2 focus:ring-2 focus:ring-cosmic-gold focus:border-cosmic-gold outline-none transition-all"
            placeholder="e.g., John Michael Doe"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-lunar-grey mb-1">Date of Birth</label>
              <input
                type="date"
                id="dob"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-deep-void/50 border border-lunar-grey/50 text-starlight rounded-lg px-4 py-2 focus:ring-2 focus:ring-cosmic-gold focus:border-cosmic-gold outline-none transition-all appearance-none"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-lunar-grey mb-1">Time of Birth</label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-deep-void/50 border border-lunar-grey/50 text-starlight rounded-lg px-4 py-2 focus:ring-2 focus:ring-cosmic-gold focus:border-cosmic-gold outline-none transition-all appearance-none"
                style={{ colorScheme: 'dark' }}
              />
            </div>
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-lunar-grey mb-1">Location of Birth</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-deep-void/50 border border-lunar-grey/50 text-starlight rounded-lg px-4 py-2 focus:ring-2 focus:ring-cosmic-gold focus:border-cosmic-gold outline-none transition-all"
            placeholder="e.g., City, Country"
          />
        </div>
         <div>
          <label htmlFor="gender" className="block text-sm font-medium text-lunar-grey mb-1">Gender</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-deep-void/50 border border-lunar-grey/50 text-starlight rounded-lg px-4 py-2 focus:ring-2 focus:ring-cosmic-gold focus:border-cosmic-gold outline-none transition-all"
          >
            <option value="" disabled>Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-lunar-grey mb-1">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full bg-deep-void/50 border border-lunar-grey/50 text-starlight rounded-lg px-4 py-2 focus:ring-2 focus:ring-cosmic-gold focus:border-cosmic-gold outline-none transition-all"
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-lunar-grey mb-1">Preferred Language</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-deep-void/50 border border-lunar-grey/50 text-starlight rounded-lg px-4 py-2 focus:ring-2 focus:ring-cosmic-gold focus:border-cosmic-gold outline-none transition-all"
          >
            <option value="English">English</option>
            <option value="Nepali">नेपाली (Nepali)</option>
            <option value="Spanish">Español (Spanish)</option>
            <option value="French">Français (French)</option>
            <option value="German">Deutsch (German)</option>
            <option value="Hindi">हिन्दी (Hindi)</option>
            <option value="Portuguese">Português (Portuguese)</option>
          </select>
        </div>
        {error && <p className="text-cosmic-gold/90 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="w-full bg-cosmic-gold text-deep-void font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cosmic-gold/20 hover:shadow-[0_0_15px_var(--lucky-color-glow)]"
        >
          Generate My Blueprint
        </button>
      </form>
       <div className="text-center text-xs text-starlight/40 mt-4">
        By continuing, you agree to our Terms of Service.
      </div>
    </div>
  );
};

export default OnboardingForm;