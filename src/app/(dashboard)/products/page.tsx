import { supabase } from "@/lib/supabase";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DeleteRowButton } from "@/components/DeleteRowButton";

export const revalidate = 0;

async function getProducts() {
    const { data: products } = await supabase
        .from("products")
        .select("*")
        .order("name");

    return products || [];
}

export default async function ProductsPage() {
    const products = await getProducts();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Products</h2>
                    <p className="text-zinc-500">Manage your product inventory.</p>
                </div>
                <Link
                    href="/products/new"
                    className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Link>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="h-10 w-full rounded-md border border-zinc-200 bg-white pl-10 pr-4 text-sm placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="aspect-square w-full bg-zinc-100">
                            {/* Placeholder for product image */}
                            <div className="flex h-full items-center justify-center text-zinc-400">
                                No Image
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-medium text-zinc-900">{product.name}</h3>
                            <p className="text-sm text-zinc-500">{product.sku}</p>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-lg font-bold text-zinc-900">
                                    GHS {product.price.toFixed(2)}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.stock_quantity > 10
                                            ? "bg-green-100 text-green-800"
                                            : product.stock_quantity > 0
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {product.stock_quantity} in stock
                                    </span>
                                    <Link href={`/products/${product.id}/edit`}>
                                        <Button variant="outline" size="sm" className="h-7 px-2">
                                            Edit
                                        </Button>
                                    </Link>
                                    <DeleteRowButton table="products" id={product.id} className="h-7 w-7" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
