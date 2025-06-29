import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Briefcase, Target, Star } from 'lucide-react';

interface ProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
}

export default function ProfileForm({ onSubmit }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    skills: [],
    interests: [],
    experienceLevel: 'beginner',
    goals: 'both',
    industry: '',
    currentRole: '',
    yearsExperience: 0
  });

  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const addInterest = () => {
    if (interestInput.trim() && !profile.interests.includes(interestInput.trim())) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()]
      }));
      setInterestInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const removeInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.name && profile.skills.length > 0 && profile.interests.length > 0) {
      onSubmit(profile);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Your Profile</h2>
        <p className="text-gray-600">Tell us about yourself to get personalized advice</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Role
              </label>
              <input
                type="text"
                value={profile.currentRole}
                onChange={(e) => setProfile(prev => ({ ...prev, currentRole: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., Software Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                value={profile.yearsExperience}
                onChange={(e) => setProfile(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                min="0"
                max="50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Industry
            </label>
            <select
              value={profile.industry}
              onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select an industry</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
              <option value="Marketing">Marketing</option>
              <option value="Design">Design</option>
              <option value="Consulting">Consulting</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail">Retail</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills * (Add at least 3)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., JavaScript, Project Management, Data Analysis"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer hover:bg-blue-200 transition-colors"
                onClick={() => removeSkill(skill)}
              >
                {skill} ×
              </span>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interests * (Add at least 2)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., AI, Sustainability, Gaming, Travel"
            />
            <button
              type="button"
              onClick={addInterest}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm cursor-pointer hover:bg-green-200 transition-colors"
                onClick={() => removeInterest(interest)}
              >
                {interest} ×
              </span>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
              <label
                key={level}
                className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                  profile.experienceLevel === level
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="experienceLevel"
                  value={level}
                  checked={profile.experienceLevel === level}
                  onChange={(e) => setProfile(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
                  className="sr-only"
                />
                <span className="capitalize font-medium">{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Goals
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { value: 'employment', label: 'Find Employment', icon: Briefcase },
              { value: 'entrepreneurship', label: 'Start a Business', icon: Star },
              { value: 'both', label: 'Explore Both', icon: Target }
            ].map(({ value, label, icon: Icon }) => (
              <label
                key={value}
                className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                  profile.goals === value
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="goals"
                  value={value}
                  checked={profile.goals === value}
                  onChange={(e) => setProfile(prev => ({ ...prev, goals: e.target.value as any }))}
                  className="sr-only"
                />
                <Icon className="w-5 h-5 mr-2" />
                <span className="font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!profile.name || profile.skills.length < 3 || profile.interests.length < 2}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Get My Personalized Advice
        </button>
      </form>
    </div>
  );
}