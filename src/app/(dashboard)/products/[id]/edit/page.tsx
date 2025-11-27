'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [product, setProduct] = useState<any>(null);

    useEffect(() => {
        async function fetchProduct() {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                setError('Failed to load product');
            } else {
                setProduct(data);
            }
            setIsFetching(false);
        }
        fetchProduct();
    }, [id]);

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
            const { error: updateError } = await supabase
                .from('products')
                .update({
                    name,
                    sku,
                    price,
                    stock_quantity,
                    image_url: image_url || null,
                })
                .eq('id', id);

            if (updateError) throw updateError;

            router.push('/products');
            router.refresh();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }

    if (isFetching) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-4">
                <p className="text-zinc-500">Product not found</p>
                <Link href="/products">
                    <Button variant="outline">Go Back</Button>
                </Link>
            </div>
        );
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
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-400">
                        Edit Product
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Update product details.
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
                        <Input
                            id="name"
                            name="name"
                            required
                            defaultValue={product.name}
                            placeholder="e.g. Classic White T-Shirt"
                        />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="sku" className="text-sm font-medium text-zinc-900 dark:text-white">
                                SKU
                            </label>
                            <Input
                                id="sku"
                                name="sku"
                                required
                                defaultValue={product.sku}
                                placeholder="e.g. TSH-WHT-001"
                            />
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
                                defaultValue={product.stock_quantity}
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
                            defaultValue={product.price}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="image_url" className="text-sm font-medium text-zinc-900 dark:text-white">
                            Image URL (Optional)
                        </label>
                        <Input
                            id="image_url"
                            name="image_url"
                            type="url"
                            defaultValue={product.image_url || ''}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
