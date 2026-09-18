import React, { useState, useEffect } from 'react';
import { supabase, auth } from '../lib/supabase';
import { api } from '../lib/api';
import { Briefcase, GraduationCap, Globe, User, Phone, Mail, Github, Code, Linkedin, Link } from 'lucide-react';


export default function ProfileSetup({ onComplete }: { onComplete: () => void }) {
  const currentUid = api.currentUser?.id || api.currentUser?.uid || auth.currentUser?.uid || 'guest';
  const profileStorageKey = `awaken-profile-${currentUid}`;

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(profileStorageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      name: api.currentUser?.displayName || auth.currentUser?.displayName || '',
      phone: '',
      email: api.currentUser?.email || auth.currentUser?.email || '',
      role: '',
      experience: 'Entry Level',
      domain: '',
      targetJob: '',
      github: '',
      leetcode: '',
      codeforces: '',
      linkedin: '',
      portfolio: ''
    };
  });

  const [isSaving, setIsSaving] = useState(false);

  // Fetch account profile from PHP server on mount
  useEffect(() => {
    let isMounted = true;
    api.getProfile().then((phpProfile) => {
      if (!isMounted || !phpProfile) return;
      if (phpProfile.full_name || phpProfile.role) {
        setFormData((prev: any) => ({
          ...prev,
          name: phpProfile.full_name || prev.name,
          phone: phpProfile.phone || prev.phone,
          role: phpProfile.role || prev.role,
          experience: phpProfile.experience || prev.experience,
          domain: phpProfile.domain || prev.domain,
          targetJob: phpProfile.target_job || prev.targetJob,
          github: phpProfile.github || prev.github,
          leetcode: phpProfile.leetcode || prev.leetcode,
          linkedin: phpProfile.linkedin || prev.linkedin,
          portfolio: phpProfile.portfolio || prev.portfolio
        }));
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [currentUid]);

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.role || !formData.domain) {
      alert("Please fill in all the required fields marked with *");
      return;
    }
    setIsSaving(true);
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(formData));
      localStorage.setItem('awaken-onboarding-profile', JSON.stringify(formData));
      sessionStorage.removeItem('awaken-plan-notif-seen');
      await api.saveProfile(formData);

      if (auth.currentUser) {

        const { error } = await supabase.from('profiles').upsert({
          id: auth.currentUser.uid,
          email: formData.email,
          display_name: formData.name,
          role: formData.role,
          experience: formData.experience,
          domain: formData.domain,
          target_job: formData.targetJob,
          github: formData.github,
          leetcode: formData.leetcode,
          codeforces: formData.codeforces,
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        });
        if (error) {
          console.warn("Supabase profiles update skipped (expected if tables are not yet created):", error);
        }
      }
      onComplete();
    } catch (err) {
      console.error(err);
      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-10 py-10 px-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Initialize Your Profile</h2>
        <p className="text-sm text-slate-400">Configure your professional identity and target goals to personalize the platform.</p>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-3xl p-8 md:p-10 space-y-8 shadow-2xl relative">
        {/* Contact Information Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-blue-400 border-b border-white/5 pb-2">1. Personal & Contact Identity</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">
                <User className="w-3 h-3 text-blue-500" /> Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Yash Koparde"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">
                <Phone className="w-3 h-3 text-emerald-500" /> Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">
              <Mail className="w-3 h-3 text-cyan-500" /> Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="e.g. name@domain.com"
              className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
            />
          </div>
        </div>

        {/* Social and Professional Profiles */}
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-blue-400 border-b border-white/5 pb-2">2. Professional Connections & Links</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">
                <Github className="w-3 h-3 text-slate-400" /> GitHub URL
              </label>
              <input
                type="url"
                value={formData.github}
                onChange={(e) => setFormData({...formData, github: e.target.value})}
                placeholder="github.com/username"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">
                <Linkedin className="w-3 h-3 text-blue-400" /> LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                placeholder="linkedin.com/in/username"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">
                <Link className="w-3 h-3 text-emerald-400" /> Portfolio Link
              </label>
              <input
                type="url"
                value={formData.portfolio}
                onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                placeholder="yourportfolio.com"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">
                <Code className="w-3 h-3 text-amber-500" /> LeetCode Profile
              </label>
              <input
                type="url"
                value={formData.leetcode}
                onChange={(e) => setFormData({...formData, leetcode: e.target.value})}
                placeholder="leetcode.com/username"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">
                <Code className="w-3 h-3 text-red-500" /> Codeforces Profile
              </label>
              <input
                type="url"
                value={formData.codeforces}
                onChange={(e) => setFormData({...formData, codeforces: e.target.value})}
                placeholder="codeforces.com/profile/username"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Target Profile Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-blue-400 border-b border-white/5 pb-2">3. Career Directives</h3>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">
                <Briefcase className="w-3 h-3 text-blue-500" /> Target Professional Role *
              </label>
              <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">Role Recommendations:</span>
            </div>
            
            {/* Quick Role Recommendations */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {[
                'Software Developer',
                'Data Analyst',
                'QA Engineer',
                'DevOps Engineer',
                'Full Stack Engineer',
                'Machine Learning Engineer'
              ].map(suggestedRole => (
                <button
                  type="button"
                  key={suggestedRole}
                  onClick={() => setFormData({ ...formData, role: suggestedRole })}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                    formData.role === suggestedRole 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'bg-slate-950 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {suggestedRole}
                </button>
              ))}
            </div>

            <input
              type="text"
              required
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              placeholder="e.g. Software Developer or select above"
              className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">
                <GraduationCap className="w-3 h-3 text-emerald-500" /> Experience Tier *
              </label>
              <select
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all cursor-pointer"
              >
                <option>Entry Level</option>
                <option>Mid-Senior</option>
                <option>Lead / Architect</option>
                <option>Managerial / Executive</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">
                <Globe className="w-3 h-3 text-cyan-500" /> Industry/Domain *
              </label>
              <input
                type="text"
                required
                value={formData.domain}
                onChange={(e) => setFormData({...formData, domain: e.target.value})}
                placeholder="e.g. FinTech / Web3"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">Specific Target Job (Optional Link or Title)</label>
            <textarea
              value={formData.targetJob}
              onChange={(e) => setFormData({...formData, targetJob: e.target.value})}
              placeholder="e.g. Software Engineer at Google, YouTube Infrastructure..."
              className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white h-24 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !formData.name || !formData.phone || !formData.email || !formData.role || !formData.domain}
          className="w-full py-5 bg-blue-600 hover:bg-blue-500 border border-blue-500 rounded-2xl text-white font-black uppercase text-xs tracking-[0.2em] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] disabled:opacity-50"
        >
          {isSaving ? 'Synchronizing Profile...' : 'Finalize Profile'}
        </button>
      </div>
    </div>
  );
}
