import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { createClient } from "@/lib/supabase-server";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let role = null;
    if (user) {
        const { data: employee } = await supabase
            .from('employees')
            .select('role')
            .eq('id', user.id)
            .single();
        role = employee?.role;
    }

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-zinc-50">
            <MobileNav role={role} />
            <Sidebar role={role} />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}
