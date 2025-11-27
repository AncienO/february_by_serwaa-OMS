import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { StaffActions } from "./StaffActions";

export const revalidate = 0;

export default async function AdminStaffPage() {
    const supabase = await createClient();

    // 1. Check if user is admin (Double check in page for safety)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: currentUserProfile } = await supabase
        .from('employees')
        .select('role')
        .eq('id', user.id)
        .single();

    if (currentUserProfile?.role !== 'Admin') {
        redirect('/');
    }

    // 2. Fetch all employees
    const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Staff Management</h2>
                    <p className="text-zinc-500">Manage your team members and their roles.</p>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 text-zinc-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Username</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {employees?.map((employee) => (
                                <tr key={employee.id} className="hover:bg-zinc-50">
                                    <td className="px-6 py-4 font-medium text-zinc-900">
                                        {employee.first_name} {employee.last_name}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600">
                                        {employee.email}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600">
                                        {employee.username || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${employee.role === 'Admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}
                                        >
                                            {employee.role}
                                        </span>
                                        {employee.pending_role === 'Admin' && (
                                            <span className="ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Pending Admin
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${employee.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {employee.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600">
                                        {new Date(employee.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StaffActions employee={employee} currentUserId={user.id} />
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
