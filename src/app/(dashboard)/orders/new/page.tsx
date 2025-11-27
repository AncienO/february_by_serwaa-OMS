'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Customer {
    id: string;
    name: string;
    email: string;
}

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
}

interface OrderItem {
    productId: string;
    quantity: number;
    isCustom: boolean;
    customName: string;
    customPrice: number;
}

export default function CreateOrderPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [orderItems, setOrderItems] = useState<OrderItem[]>([{ productId: '', quantity: 1, isCustom: false, customName: '', customPrice: 0 }]);

    useEffect(() => {
        async function fetchData() {
            const { data: customersData } = await supabase.from('customers').select('*').order('name');
            const { data: productsData } = await supabase.from('products').select('*').order('name');

            if (customersData) setCustomers(customersData);
            if (productsData) setProducts(productsData);
        }
        fetchData();
    }, []);

    const handleAddItem = () => {
        setOrderItems([...orderItems, { productId: '', quantity: 1, isCustom: false, customName: '', customPrice: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
        const newItems = [...orderItems];
        // @ts-ignore
        newItems[index][field] = value;

        // Reset fields when switching types
        if (field === 'isCustom') {
            if (value) {
                newItems[index].productId = '';
            } else {
                newItems[index].customName = '';
                newItems[index].customPrice = 0;
            }
        }

        setOrderItems(newItems);
    };

    const calculateTotal = () => {
        return orderItems.reduce((total, item) => {
            if (item.isCustom) {
                return total + (item.customPrice || 0) * item.quantity;
            }
            const product = products.find((p) => p.id === item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    };

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!selectedCustomerId) {
            setError('Please select a customer.');
            setIsLoading(false);
            return;
        }

        // Validate items
        for (const item of orderItems) {
            if (item.quantity < 1) {
                setError('Quantity must be at least 1.');
                setIsLoading(false);
                return;
            }
            if (item.isCustom) {
                if (!item.customName || !item.customPrice) {
                    setError('Please provide a name and price for custom items.');
                    setIsLoading(false);
                    return;
                }
            } else {
                if (!item.productId) {
                    setError('Please select a product for all items.');
                    setIsLoading(false);
                    return;
                }
            }
        }

        try {
            // 1. Get Current User
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError('You must be logged in to create an order.');
                setIsLoading(false);
                return;
            }

            // 1.5 Self-healing: Ensure employee record exists
            const { data: employee } = await supabase
                .from('employees')
                .select('id')
                .eq('id', user.id)
                .single();

            if (!employee) {
                // Employee record missing, create it now
                const { error: createEmployeeError } = await supabase
                    .from('employees')
                    .insert({
                        id: user.id,
                        email: user.email!,
                        first_name: user.user_metadata.first_name || user.user_metadata.full_name?.split(' ')[0] || 'Unknown',
                        last_name: user.user_metadata.last_name || user.user_metadata.full_name?.split(' ').slice(1).join(' ') || 'User',
                        username: user.user_metadata.username || user.email?.split('@')[0],
                        role: 'Staff'
                    });

                if (createEmployeeError) {
                    console.error('Failed to auto-create employee record:', createEmployeeError);
                    // Don't return here, try to proceed, maybe the trigger caught it or it's a race condition
                }
            }

            // 2. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    customer_id: selectedCustomerId,
                    user_id: user.id,
                    status: 'pending',
                    total_amount: calculateTotal(),
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const itemsToInsert = orderItems.map((item) => {
                if (item.isCustom) {
                    return {
                        order_id: order.id,
                        product_id: null,
                        product_name: item.customName,
                        quantity: item.quantity,
                        unit_price: item.customPrice,
                    };
                } else {
                    const product = products.find((p) => p.id === item.productId);
                    return {
                        order_id: order.id,
                        product_id: item.productId,
                        product_name: product!.name, // Store snapshot of name
                        quantity: item.quantity,
                        unit_price: product!.price,
                    };
                }
            });

            const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);

            if (itemsError) throw itemsError;

            router.push('/orders');
            router.refresh();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/orders"
                    className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white p-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                        Create New Order
                    </h2>
                    <p className="text-sm text-zinc-500">
                        Place a new order for a customer.
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    {/* Customer Selection */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-zinc-900">Customer</h3>
                        <div className="space-y-2">
                            <label htmlFor="customer" className="text-sm font-medium text-zinc-900">
                                Select Customer
                            </label>
                            <select
                                id="customer"
                                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
                                value={selectedCustomerId}
                                onChange={(e) => setSelectedCustomerId(e.target.value)}
                                required
                            >
                                <option value="">Select a customer...</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name} ({customer.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-zinc-900">Items</h3>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {orderItems.map((item, index) => (
                                <div key={index} className="flex flex-col gap-4 p-4 border border-zinc-100 rounded-lg bg-zinc-50/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`custom-${index}`}
                                                checked={item.isCustom}
                                                onChange={(e) => handleItemChange(index, 'isCustom', e.target.checked)}
                                                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                                            />
                                            <label htmlFor={`custom-${index}`} className="text-sm font-medium text-zinc-700">
                                                Custom Item
                                            </label>
                                        </div>
                                        {orderItems.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                                onClick={() => handleRemoveItem(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex items-end gap-4">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-sm font-medium text-zinc-900">
                                                {item.isCustom ? 'Item Name' : 'Product'}
                                            </label>
                                            {item.isCustom ? (
                                                <Input
                                                    value={item.customName}
                                                    onChange={(e) => handleItemChange(index, 'customName', e.target.value)}
                                                    placeholder="Enter item name"
                                                    required
                                                />
                                            ) : (
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
                                                    value={item.productId}
                                                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select product...</option>
                                                    {products.map((product) => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.name} (GHS {product.price}) - {product.stock_quantity} in stock
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>

                                        {item.isCustom && (
                                            <div className="w-32 space-y-2">
                                                <label className="text-sm font-medium text-zinc-900">
                                                    Price (GHS)
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.customPrice}
                                                    onChange={(e) => handleItemChange(index, 'customPrice', parseFloat(e.target.value))}
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                        )}

                                        <div className="w-24 space-y-2">
                                            <label className="text-sm font-medium text-zinc-900">
                                                Qty
                                            </label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-zinc-200">
                            <div className="text-right">
                                <p className="text-sm text-zinc-500">Total Amount</p>
                                <p className="text-2xl font-bold text-zinc-900">
                                    GHS {calculateTotal().toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            onClick={() => router.back()}
                            className="bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Order
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
