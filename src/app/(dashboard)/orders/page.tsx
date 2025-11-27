import { createClient } from "@/lib/supabase-server";
import { Plus } from "lucide-react";
import Link from "next/link";
import { DeleteOrderButton } from "@/components/DeleteOrderButton";
import { UpdateOrderStatusButton } from "@/components/UpdateOrderStatusButton";

export const revalidate = 0;

async function getOrders() {
    const supabase = await createClient();
    const { data: orders } = await supabase
        .from("orders")
        .select("*, customers(name, email), employees(first_name, last_name)")
        .order("created_at", { ascending: false });

    return orders || [];
}

export default async function OrdersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userRole = 'Staff';
    if (user) {
        const { data: employee } = await supabase
            .from('employees')
            .select('role')
            .eq('id', user.id)
            .single();
        if (employee) userRole = employee.role;
    }

    const orders = await getOrders();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Orders</h2>
                    <p className="text-zinc-500">Manage and track your orders.</p>
                </div>
                <Link
                    href="/orders/new"
                    className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Order
                </Link>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 text-zinc-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Order ID</th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Responsible</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {orders.map((order) => {
                                const isOwner = order.user_id === user?.id;
                                const isAdmin = userRole === 'Admin';
                                const canDelete = isAdmin || isOwner;

                                return (
                                    <tr key={order.id} className="hover:bg-zinc-50">
                                        <td className="px-6 py-4 font-medium text-zinc-900">
                                            #{order.id.slice(0, 8)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                {/* @ts-ignore: Supabase join type issue */}
                                                <span className="font-medium text-zinc-900">{order.customers?.name}</span>
                                                {/* @ts-ignore: Supabase join type issue */}
                                                <span className="text-xs text-zinc-500">{order.customers?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${order.status === "delivered"
                                                    ? "bg-green-100 text-green-800"
                                                    : order.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : order.status === "cancelled"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-zinc-100 text-zinc-800"
                                                    }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600">
                                            {/* @ts-ignore: Supabase join type issue */}
                                            {order.employees ? `${order.employees.first_name || ''} ${order.employees.last_name || ''}`.trim() || 'Staff' : "-"}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600">
                                            GHS {order.total_amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <UpdateOrderStatusButton orderId={order.id} currentStatus={order.status} />
                                                <DeleteOrderButton orderId={order.id} canDelete={canDelete} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
