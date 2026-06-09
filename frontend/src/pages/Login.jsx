import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-body-md text-on-background diagonal-stripes overflow-x-hidden relative">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-container/20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary-container/20 blur-[100px] rounded-full"></div>
      </div>

      <main className="relative z-10 w-full max-w-[440px] px-container-margin-mobile md:px-0">
        <div className="bg-white border border-soft-accent rounded-xl p-xl shadow-sm transition-all duration-300 hover:border-primary-container/40">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-xl">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-md transform rotate-3 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-[40px]">track_changes</span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-brand-accent tracking-tight">
              FieldTrack
            </h1>
            <p className="font-label-md text-label-md text-on-surface-variant mt-base">
              Secure Field Access Portal
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-label-sm border border-error/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-lg" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-base">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px] group-focus-within:text-brand-accent transition-colors">
                    mail
                  </span>
                </div>
                <input
                  className="block w-full pl-[48px] pr-md py-3 bg-white border border-soft-accent rounded-lg font-body-md text-on-surface placeholder-outline-variant focus:outline-none focus:ring-2 focus:ring-soft-accent focus:border-brand-accent transition-all"
                  id="email"
                  type="email"
                  required
                  placeholder="agent@fieldtrack.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-base">
              <div className="flex justify-between items-center">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
                  Password
                </label>
                <a className="font-label-sm text-label-sm text-brand-accent hover:underline" href="#">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px] group-focus-within:text-brand-accent transition-colors">
                    lock
                  </span>
                </div>
                <input
                  className="block w-full pl-[48px] pr-[48px] py-3 bg-white border border-soft-accent rounded-lg font-body-md text-on-surface placeholder-outline-variant focus:outline-none focus:ring-2 focus:ring-soft-accent focus:border-brand-accent transition-all"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-md flex items-center text-outline hover:text-brand-accent transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                className="h-4 w-4 text-brand-accent focus:ring-soft-accent border-soft-accent rounded"
                id="remember-me"
                type="checkbox"
              />
              <label className="ml-base block font-label-sm text-label-sm text-on-surface-variant" htmlFor="remember-me">
                Keep me signed in for 30 days
              </label>
            </div>

            {/* Sign In Button */}
            <button
              className="w-full bg-brand-accent text-white py-3 px-md rounded-lg font-label-md text-label-md hover:bg-[#8494FF] active:scale-[0.98] transition-all shadow-md shadow-brand-accent/20 flex items-center justify-center gap-base disabled:opacity-75"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined text-[18px]">login</span>
                </>
              )}
            </button>
          </form>

          {/* Secondary Actions */}
          <div className="mt-xl pt-lg border-t border-outline-variant flex flex-col items-center gap-md">
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Don't have an account?{' '}
              <a className="text-brand-accent font-bold hover:underline" href="#">
                Request Access
              </a>
            </p>
            <div className="flex items-center gap-base">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                System Status: Operational
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-xl text-center">
          <p className="font-label-sm text-label-sm text-on-surface-variant/60">
            © 2026 FieldTrack Professional Systems. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
