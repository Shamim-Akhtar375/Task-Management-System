import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      localStorage.setItem('accessToken', res.data.accessToken);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
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
          <p className="text-textMuted">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <input 
              {...register('email')} 
              type="email" 
              className="input-field" 
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-danger text-sm mt-1">{errors.email.message}</p>}
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="label mb-0">Password</label>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-secondary transition-colors">Forgot password?</Link>
            </div>
            <input 
              {...register('password')} 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
            />
            {errors.password && <p className="text-danger text-sm mt-1">{errors.password.message}</p>}
          </div>
          
          <button type="submit" disabled={isLoading} className="btn-primary w-full flex justify-center items-center gap-2 mt-6">
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            Sign In
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-textMuted">
          Don't have an account? <Link to="/signup" className="text-primary hover:text-secondary font-medium transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
