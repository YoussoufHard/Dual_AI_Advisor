import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { User, Briefcase, Target, Star } from 'lucide-react';

interface ProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
}

export default function ProfileForm({ onSubmit }: ProfileFormProps) {
  const { t } = useLanguage();
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

  const industries = [
    { value: '', label: t('profile.industry.select') },
    { value: 'Technology', label: t('profile.industry.technology') },
    { value: 'Healthcare', label: t('profile.industry.healthcare') },
    { value: 'Finance', label: t('profile.industry.finance') },
    { value: 'Education', label: t('profile.industry.education') },
    { value: 'Marketing', label: t('profile.industry.marketing') },
    { value: 'Design', label: t('profile.industry.design') },
    { value: 'Consulting', label: t('profile.industry.consulting') },
    { value: 'Manufacturing', label: t('profile.industry.manufacturing') },
    { value: 'Retail', label: t('profile.industry.retail') },
    { value: 'Other', label: t('profile.industry.other') }
  ];

  const experienceLevels = [
    { value: 'beginner', label: t('profile.experienceLevel.beginner') },
    { value: 'intermediate', label: t('profile.experienceLevel.intermediate') },
    { value: 'advanced', label: t('profile.experienceLevel.advanced') },
    { value: 'expert', label: t('profile.experienceLevel.expert') }
  ];

  const goals = [
    { value: 'employment', label: t('profile.goals.employment'), icon: Briefcase },
    { value: 'entrepreneurship', label: t('profile.goals.entrepreneurship'), icon: Star },
    { value: 'both', label: t('profile.goals.both'), icon: Target }
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('profile.title')}</h2>
        <p className="text-gray-600">{t('profile.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.name')} *
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={t('profile.name.placeholder')}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.currentRole')}
              </label>
              <input
                type="text"
                value={profile.currentRole}
                onChange={(e) => setProfile(prev => ({ ...prev, currentRole: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={t('profile.currentRole.placeholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.yearsExperience')}
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
              {t('profile.industry')}
            </label>
            <select
              value={profile.industry}
              onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {industries.map(industry => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('profile.skills')} * {t('profile.skills.subtitle')}
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={t('profile.skills.placeholder')}
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {t('profile.skills.add')}
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
            {t('profile.interests')} * {t('profile.interests.subtitle')}
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={t('profile.interests.placeholder')}
            />
            <button
              type="button"
              onClick={addInterest}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              {t('profile.skills.add')}
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
            {t('profile.experienceLevel')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {experienceLevels.map((level) => (
              <label
                key={level.value}
                className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                  profile.experienceLevel === level.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="experienceLevel"
                  value={level.value}
                  checked={profile.experienceLevel === level.value}
                  onChange={(e) => setProfile(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
                  className="sr-only"
                />
                <span className="font-medium">{level.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('profile.goals')}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {goals.map(({ value, label, icon: Icon }) => (
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
          {t('profile.submit')}
        </button>
      </form>
    </div>
  );
}