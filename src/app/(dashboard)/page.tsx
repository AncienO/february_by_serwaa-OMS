import { createClient } from "@/lib/supabase-server";
import { ShoppingBag, DollarSign, Package, Clock } from "lucide-react";

export const revalidate = 60;

async function getDashboardData() {
  const supabase = await createClient();
  const { count: ordersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { data: orders } = await supabase
    .from("orders")
    .select("total_amount, status, created_at, id, customers(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: productsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  const { data: totalRevenue } = await supabase.rpc('get_total_revenue');

  return {
    ordersCount: ordersCount || 0,
    productsCount: productsCount || 0,
    totalRevenue: totalRevenue || 0,
    recentOrders: orders || [],
  };
}

export default async function Home() {
  const { ordersCount, productsCount, totalRevenue, recentOrders } = await getDashboardData();

  const stats = [
    {
      name: "Total Orders",
      value: ordersCount,
      icon: ShoppingBag,
      change: "+12%",
      changeType: "positive",
    },
    {
      name: "Total Revenue",
      value: `GHS${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      change: "+2.5%",
      changeType: "positive",
    },
    {
      name: "Total Products",
      value: productsCount,
      icon: Package,
      change: "+5",
      changeType: "positive",
    },
    {
      name: "Pending Orders",
      value: recentOrders.filter((o) => o.status === "pending").length,
      icon: Clock,
      change: "-2",
      changeType: "negative",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h2>
        <p className="text-zinc-500">Overview of your store's performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-zinc-500">Total Revenue</h3>
            <DollarSign className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900">GHS {totalRevenue.toFixed(2)}</div>
          {/* <p className="text-xs text-zinc-500">+20.1% from last month</p> */}
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-zinc-500">Orders</h3>
            <ShoppingBag className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900">+{ordersCount}</div>
          {/* <p className="text-xs text-zinc-500">+180.1% from last month</p> */}
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-zinc-500">Products</h3>
            <Package className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900">{productsCount}</div>
          {/* <p className="text-xs text-zinc-500">+19% from last month</p> */}
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-zinc-500">Pending Orders</h3>
            <Clock className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900">{recentOrders.filter((o) => o.status === "pending").length}</div>
          {/* <p className="text-xs text-zinc-500">+201 since last hour</p> */}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="p-6 border-b border-zinc-200">
          <h3 className="text-lg font-medium text-zinc-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {/* @ts-ignore: Supabase join type issue */}
                    {order.customers?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                    GHS {order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
