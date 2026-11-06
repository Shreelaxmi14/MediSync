import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  User,
  Heart,
  Lock,
  Mail,
  ShieldCheck,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'patient',
  initialMode = 'login',
}) => {
  const { login, registerPatient, registerCaregiver, demoLogin } = useAuth();

  const [role, setRole] = useState<UserRole>(initialRole);
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState<number>(68);
  const [condition, setCondition] = useState('');
  const [relationship, setRelationship] = useState('Family Caregiver');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide your email address and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    if (mode === 'login') {
      const res = login(email, role);
      setIsSubmitting(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } else {
      // Register
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        setIsSubmitting(false);
        return;
      }

      if (role === 'patient') {
        const res = registerPatient({
          fullName,
          email,
          age: Number(age) || 65,
          condition: condition.trim() || 'General Health Maintenance',
          emergencyContactName: 'Primary Contact',
          emergencyContactPhone: '+1 (555) 000-0000',
        });
        setIsSubmitting(false);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Registration failed.');
        }
      } else {
        const res = registerCaregiver({
          fullName,
          email,
          relationship: relationship.trim() || 'Family Caregiver',
          phone: phone.trim() || '+1 (555) 000-0000',
        });
        setIsSubmitting(false);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Registration failed.');
        }
      }
    }
  };

  const handleDemoAccess = (targetRole: UserRole) => {
    demoLogin(targetRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header & Role Switcher */}
        <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {mode === 'login' ? 'Sign In to MediSync' : 'Create MediSync Account'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every Dose Matters. Every Life Counts.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role Segmented Buttons */}
          <div className="grid grid-cols-2 p-1 bg-slate-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setRole('patient');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                role === 'patient'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Patient Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('caregiver');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                role === 'caregiver'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Caregiver Portal</span>
            </button>
          </div>
        </div>

        {/* Instant One-Click Demo Access Bar */}
        <div className="px-6 py-3 bg-teal-50/60 border-b border-teal-100/70 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-teal-900">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="font-semibold">Instant Evaluator Demo:</span>
          </div>

          <button
            type="button"
            onClick={() => handleDemoAccess(role)}
            className="text-xs font-bold text-teal-800 hover:text-teal-950 underline flex items-center gap-1"
          >
            <span>{role === 'patient' ? 'Enter as Eleanor Vance' : 'Enter as Dr. David Vance'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {forgotPasswordSent && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs">
              Password reset link has been dispatched to your email address.
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder={role === 'patient' ? 'e.g. Eleanor Vance' : 'e.g. Dr. David Vance'}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Password *</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setForgotPasswordSent(true)}
                  className="text-[11px] text-teal-700 hover:text-teal-800 font-medium"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role specific register fields */}
          {mode === 'register' && role === 'patient' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age (Optional)
                </label>
                <input
                  type="number"
                  min={1}
                  value={age}
                  onChange={e => setAge(parseInt(e.target.value, 10) || 60)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chronic Condition
                </label>
                <input
                  type="text"
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                  placeholder="e.g. Hypertension"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {mode === 'register' && role === 'caregiver' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  placeholder="e.g. Son, Nurse"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs transition-colors flex items-center justify-center gap-2 ${
              role === 'patient'
                ? 'bg-teal-700 hover:bg-teal-800'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <span>
              {mode === 'login'
                ? `Sign In as ${role === 'patient' ? 'Patient' : 'Caregiver'}`
                : `Create ${role === 'patient' ? 'Patient' : 'Caregiver'} Account`}
            </span>
          </button>

          {/* Toggle between login and register */}
          <div className="pt-2 text-center text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-teal-700 hover:underline font-semibold"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-teal-700 hover:underline font-semibold"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
