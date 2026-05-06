import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema)
  });

  const password = watch("password", "");
  
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length > 5) score += 1;
    if (password.length > 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/signup', { name: data.name, email: data.email, password: data.password });
      localStorage.setItem('accessToken', res.data.accessToken);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
      
      <div className="glass-card w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">TaskFlow</h1>
          <p className="text-textMuted">Create a new account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input {...register('name')} className="input-field" placeholder="John Doe" />
            {errors.name && <p className="text-danger text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Email Address</label>
            <input {...register('email')} type="email" className="input-field" placeholder="you@example.com" />
            {errors.email && <p className="text-danger text-sm mt-1">{errors.email.message}</p>}
          </div>
          
          <div>
            <label className="label">Password</label>
            <input {...register('password')} type="password" className="input-field" placeholder="••••••••" />
            {password.length > 0 && (
              <div className="mt-2 flex gap-1 h-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={clsx(
                    "flex-1 rounded-full",
                    i <= strength ? 
                      (strength < 3 ? "bg-danger" : strength < 4 ? "bg-warning" : "bg-success") 
                      : "bg-surface border border-borderGlass"
                  )} />
                ))}
              </div>
            )}
            {errors.password && <p className="text-danger text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <input {...register('confirmPassword')} type="password" className="input-field" placeholder="••••••••" />
            {errors.confirmPassword && <p className="text-danger text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>
          
          <button type="submit" disabled={isLoading} className="btn-primary w-full flex justify-center items-center gap-2 mt-6">
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            Sign Up
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-textMuted">
          Already have an account? <Link to="/login" className="text-primary hover:text-secondary font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
