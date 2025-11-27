import { supabase } from "@/lib/supabase";
import { Mail, Phone, MapPin, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DeleteRowButton } from "@/components/DeleteRowButton";

export const revalidate = 0;

async function getCustomers(query?: string) {
    let dbQuery = supabase
        .from("customers")
        .select("*")
        .order("name");

    if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%`);
    }

    const { data: customers } = await dbQuery;
    return customers || [];
}

export default async function CustomersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;
    const customers = await getCustomers(q);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Customers</h2>
                    <p className="text-zinc-500">View and manage your customer base.</p>
                </div>
                <Link href="/customers/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Customer
                    </Button>
                </Link>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                    <form action="/customers" method="GET">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            name="q"
                            defaultValue={q}
                            placeholder="Search customers..."
                            className="pl-10"
                        />
                    </form>
                </div>
            </div>

            {customers.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 py-12 text-center">
                    <div className="rounded-full bg-zinc-100 p-3">
                        <Search className="h-6 w-6 text-zinc-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-zinc-900">No customers found</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                        {q ? `No results for "${q}"` : "Get started by adding a new customer."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {customers.map((customer) => (
                        <div
                            key={customer.id}
                            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center text-xl font-bold text-zinc-900">
                                    {customer.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-medium text-zinc-900">{customer.name}</h3>
                                    <p className="text-xs text-zinc-500">Customer ID: {customer.id.slice(0, 8)}</p>
                                </div>
                                <div className="ml-auto">
                                    <DeleteRowButton table="customers" id={customer.id} />
                                </div>
                            </div>
                            <div className="space-y-3 text-sm text-zinc-600">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-zinc-400" />
                                    <span>{customer.email}</span>
                                </div>
                                {customer.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-zinc-400" />
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 text-zinc-400 mt-0.5" />
                                        <span>{customer.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
