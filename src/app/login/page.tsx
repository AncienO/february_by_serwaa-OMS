'use client';

import { useState, Suspense } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { toast } from 'sonner';

function LoginForm() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let emailToUse = identifier;

            // If identifier is not an email, try to find the email by username
            if (!identifier.includes('@')) {
                const { data, error } = await supabase.rpc('get_email_by_username', {
                    username_input: identifier
                });

                if (error || !data) {
                    throw new Error('Invalid username or password');
                }
                emailToUse = data;
            }

            const { error } = await supabase.auth.signInWithPassword({
                email: emailToUse,
                password,
            });

            if (error) {
                if (error.message.includes('Email not confirmed')) {
                    throw new Error('Please check your email to confirm your account before logging in.');
                }
                throw error;
            }

            toast.success('Logged in successfully');
            router.push('/');
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col lg:flex-row">
            {/* Left Side - Image */}
            <div className="flex w-full lg:w-1/2 items-center justify-center bg-white p-12">
                <div className="relative w-full max-w-md aspect-square">
                    <Image
                        src="/fbs-logo.png"
                        alt="FBS Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-black text-white p-8 lg:p-12">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight">FBS Management</h1>
                        <p className="mt-2 text-sm text-gray-400">
                            Sign in to your account
                        </p>
                    </div>

                    {message && (
                        <div className="rounded-md bg-blue-500/10 p-4 text-sm text-blue-500 border border-blue-500/20">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="identifier" className="text-gray-300">Username</Label>
                            <Input
                                id="identifier"
                                type="text"
                                placeholder="username"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500 focus:border-white focus:ring-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-300">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="**********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500 focus:border-white focus:ring-white"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-white text-black hover:bg-gray-200"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-gray-500">Don't have an account? </span>
                        <Link href="/signup" className="font-medium text-white hover:underline">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
