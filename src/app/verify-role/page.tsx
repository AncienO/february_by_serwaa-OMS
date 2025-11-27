import { verifyRoleUpgrade } from '@/app/actions/staff';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';

export default async function VerifyRolePage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const { token } = await searchParams;

    if (!token) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4">
                <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm text-center">
                    <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-zinc-900 mb-2">Invalid Request</h1>
                    <p className="text-zinc-500 mb-6">No verification token provided.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const result = await verifyRoleUpgrade(token);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm text-center">
                {result.success ? (
                    <>
                        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Role Upgraded!</h1>
                        <p className="text-zinc-500 mb-6">You are now an Admin. Please log in to access admin features.</p>
                    </>
                ) : (
                    <>
                        <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Verification Failed</h1>
                        <p className="text-zinc-500 mb-6">{result.error as string}</p>
                    </>
                )}
                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
}
