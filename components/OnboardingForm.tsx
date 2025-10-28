
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
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !dob || !time || !location || !gender) {
      setError('Please fill out all fields.');
      return;
    }
    setError('');
    onSubmit({ fullName, dob, time, location, gender });
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-celestial-sapphire/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-cool-cyan/20">
      <h2 className="text-2xl font-bold text-center text-white font-display mb-2">Unlock Your Truth</h2>
      <p className="text-center text-cool-cyan mb-6">Enter your details to generate your personalized numerology report.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-galactic-silver/80 mb-1">Full Name (as on birth certificate)</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-celestial-sapphire/50 border border-cool-cyan/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-aurora-pink focus:border-aurora-pink outline-none transition-all"
            placeholder="e.g., John Michael Doe"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-galactic-silver/80 mb-1">Date of Birth</label>
              <input
                type="date"
                id="dob"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-celestial-sapphire/50 border border-cool-cyan/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-aurora-pink focus:border-aurora-pink outline-none transition-all appearance-none"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-galactic-silver/80 mb-1">Time of Birth</label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-celestial-sapphire/50 border border-cool-cyan/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-aurora-pink focus:border-aurora-pink outline-none transition-all appearance-none"
                style={{ colorScheme: 'dark' }}
              />
            </div>
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-galactic-silver/80 mb-1">Location of Birth</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-celestial-sapphire/50 border border-cool-cyan/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-aurora-pink focus:border-aurora-pink outline-none transition-all"
            placeholder="e.g., City, Country"
          />
        </div>
         <div>
          <label htmlFor="gender" className="block text-sm font-medium text-galactic-silver/80 mb-1">Gender</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-celestial-sapphire/50 border border-cool-cyan/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-aurora-pink focus:border-aurora-pink outline-none transition-all"
          >
            <option value="" disabled>Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {error && <p className="text-aurora-pink text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="w-full bg-aurora-pink text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-80 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-aurora-pink/30"
        >
          Generate My Report
        </button>
      </form>
       <div className="text-center text-xs text-white/50 mt-4">
        By continuing, you agree to our Terms of Service.
      </div>
    </div>
  );
};

export default OnboardingForm;