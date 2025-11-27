'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Users, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Orders', href: '/orders', icon: ShoppingBag },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
];

export function MobileNav() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden border-b border-zinc-200 bg-white">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8">
                        <Image
                            src="/fbs.png"
                            alt="FBS Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-lg font-bold text-zinc-900">FBS Management</h1>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {isOpen && (
                <div className="absolute top-16 left-0 w-full bg-white border-b border-zinc-200 z-50 shadow-lg">
                    <nav className="flex flex-col p-4 space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? 'bg-zinc-100 text-zinc-900'
                                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                                        }`}
                                >
                                    <item.icon
                                        className={`mr-3 h-5 w-5 ${isActive ? 'text-zinc-900' : 'text-zinc-400'
                                            }`}
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}

                    </nav>
                </div>
            )}
        </div>
    );
}
