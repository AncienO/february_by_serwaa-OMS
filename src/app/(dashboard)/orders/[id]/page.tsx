import { supabase } from "@/lib/supabase";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 0;

async function getOrder(id: string) {
    const { data: order } = await supabase
        .from("orders")
        .select(`
      *,
      customers (*),
      order_items (
        *,
        product_name,
        products (*)
      )
    `)
        .eq("id", id)
        .single();

    return order;
}

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        notFound();
    }

    const statusSteps = [
        { status: "pending", label: "Order Placed", icon: Clock },
        { status: "processing", label: "Processing", icon: Package },
        { status: "shipped", label: "Shipped", icon: Truck },
        { status: "delivered", label: "Delivered", icon: CheckCircle },
    ];

    const currentStepIndex = statusSteps.findIndex((step) => step.status === order.status);
    const isCancelled = order.status === "cancelled";

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/orders"
                    className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white p-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Order #{order.id.slice(0, 8)}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                    {/* Order Status */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h3 className="mb-6 text-lg font-medium text-zinc-900 dark:text-white">Order Status</h3>
                        {isCancelled ? (
                            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                                <XCircle className="h-6 w-6" />
                                <span className="font-medium">Order Cancelled</span>
                            </div>
                        ) : (
                            <div className="relative flex justify-between">
                                {statusSteps.map((step, index) => {
                                    const isCompleted = index <= currentStepIndex;
                                    const isCurrent = index === currentStepIndex;

                                    return (
                                        <div key={step.status} className="flex flex-col items-center relative z-10">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${isCompleted
                                                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                                                    : "border-zinc-200 bg-white text-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-600"
                                                    }`}
                                            >
                                                <step.icon className="h-5 w-5" />
                                            </div>
                                            <span
                                                className={`mt-2 text-xs font-medium ${isCompleted ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-500"
                                                    }`}
                                            >
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div className="absolute top-5 left-0 -z-0 h-0.5 w-full bg-zinc-200 dark:bg-zinc-800">
                                    <div
                                        className="h-full bg-zinc-900 transition-all duration-500 dark:bg-white"
                                        style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Items</h3>
                        </div>
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {/* @ts-ignore: Supabase join type issue */}
                            {order.order_items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                            {/* Placeholder for image */}
                                            <Package className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-zinc-900 dark:text-white">
                                                {/* @ts-ignore */}
                                                {item.product_name || item.products?.name || 'Unknown Item'}
                                            </p>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                SKU: {/* @ts-ignore */}
                                                {item.products?.sku || 'Custom Item'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-zinc-900 dark:text-white">
                                            GHS {item.unit_price.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-zinc-50 p-6 rounded-b-xl dark:bg-zinc-800/50">
                            <div className="flex justify-between text-base font-medium text-zinc-900 dark:text-white">
                                <span>Total</span>
                                <span>GHS {order.total_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Customer Details */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h3 className="mb-4 text-lg font-medium text-zinc-900 dark:text-white">Customer</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Name</p>
                                {/* @ts-ignore: Supabase join type issue */}
                                <p className="text-zinc-900 dark:text-white">{order.customers.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Email</p>
                                {/* @ts-ignore: Supabase join type issue */}
                                <p className="text-zinc-900 dark:text-white">{order.customers.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Phone</p>
                                {/* @ts-ignore: Supabase join type issue */}
                                <p className="text-zinc-900 dark:text-white">{order.customers.phone || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h3 className="mb-4 text-lg font-medium text-zinc-900 dark:text-white">Shipping Address</h3>
                        {/* @ts-ignore: Supabase join type issue */}
                        <p className="text-zinc-600 dark:text-zinc-300 whitespace-pre-line">
                            {order.customers.address || "No address provided"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
