'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Users, LogOut, UserCog } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Orders', href: '/orders', icon: ShoppingBag },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
];

const adminNavigation = [
    { name: 'Staff', href: '/admin/staff', icon: UserCog },
];

interface SidebarProps {
    role?: string | null;
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const navItems = role === 'Admin' ? [...navigation, ...adminNavigation] : navigation;

    return (
        <div className="hidden md:flex h-full w-64 flex-col bg-white border-r border-zinc-200">
            <div className="flex h-16 items-center px-6 border-b border-zinc-200 gap-3">
                <div className="relative h-8 w-8">
                    <Image
                        src="/fbs.png"
                        alt="FBS Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                <h1 className="text-xl font-bold text-zinc-900">FBS Management</h1>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                ? 'bg-zinc-100 text-zinc-900'
                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                                }`}
                        >
                            <item.icon
                                className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-500'
                                    }`}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-zinc-200 p-4 space-y-1">

                <button
                    onClick={handleLogout}
                    className="w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                >
                    <LogOut
                        className="mr-3 h-5 w-5 flex-shrink-0 text-zinc-400 group-hover:text-zinc-500"
                        aria-hidden="true"
                    />
                    Logout
                </button>
            </div>
        </div>
    );
}
