'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AddProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const sku = formData.get('sku') as string;
        const price = parseFloat(formData.get('price') as string);
        const stock_quantity = parseInt(formData.get('stock_quantity') as string);
        const image_url = formData.get('image_url') as string;

        try {
            const { error: insertError } = await supabase.from('products').insert({
                name,
                sku,
                price,
                stock_quantity,
                image_url: image_url || null,
            });

            if (insertError) throw insertError;

            router.push('/products');
            router.refresh();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/products"
                    className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white p-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Add New Product
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Create a new product in your inventory.
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/30 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-zinc-900 dark:text-white">
                            Product Name
                        </label>
                        <Input id="name" name="name" required placeholder="e.g. Classic White T-Shirt" />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="sku" className="text-sm font-medium text-zinc-900 dark:text-white">
                                SKU
                            </label>
                            <Input id="sku" name="sku" required placeholder="e.g. TSH-WHT-001" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="stock_quantity" className="text-sm font-medium text-zinc-900 dark:text-white">
                                Stock Quantity
                            </label>
                            <Input
                                id="stock_quantity"
                                name="stock_quantity"
                                type="number"
                                required
                                min="0"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="price" className="text-sm font-medium text-zinc-900 dark:text-white">
                            Price (GHS)
                        </label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="image_url" className="text-sm font-medium text-zinc-900 dark:text-white">
                            Image URL (Optional)
                        </label>
                        <Input id="image_url" name="image_url" type="url" placeholder="https://..." />
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            onClick={() => router.back()}
                            className="bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Product
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
