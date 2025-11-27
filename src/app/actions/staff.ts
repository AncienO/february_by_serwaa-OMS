'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendRoleVerificationEmail } from '@/lib/email';
import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';

export async function deleteStaff(userId: string) {
    try {
        if (!supabaseAdmin) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

        // 1. Delete from Supabase Auth (requires Service Role)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) throw authError;

        // 2. Delete from employees table (should cascade if set up, but let's be explicit or rely on cascade)
        // Assuming cascade delete is NOT set up on auth.users -> public.employees, we might need to delete manually.
        // However, usually we delete from public.employees and let a trigger handle auth, OR delete from auth and let cascade handle public.
        // Let's try deleting from auth first. If public.employees has a foreign key to auth.users with ON DELETE CASCADE, it's automatic.
        // If not, we should delete from public.employees using the admin client as well to be safe.

        const { error: dbError } = await supabaseAdmin
            .from('employees')
            .delete()
            .eq('id', userId);

        if (dbError) throw dbError;

        revalidatePath('/admin/staff');
        return { success: true };
    } catch (error) {
        console.error('Error deleting staff:', error);
        return { success: false, error: 'Failed to delete staff member' };
    }
}

export async function initiateRoleUpgrade(userId: string, email: string) {
    try {
        if (!supabaseAdmin) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

        const token = randomBytes(32).toString('hex');

        // Update employee record with pending role and token
        const { error } = await supabaseAdmin
            .from('employees')
            .update({
                pending_role: 'Admin',
                role_change_token: token,
            })
            .eq('id', userId);

        if (error) throw error;

        // Send verification email
        const emailResult = await sendRoleVerificationEmail(email, token);
        if (!emailResult.success) throw new Error('Failed to send email');

        revalidatePath('/admin/staff');
        return { success: true };
    } catch (error) {
        console.error('Error initiating upgrade:', error);
        return { success: false, error: 'Failed to initiate role upgrade' };
    }
}

export async function verifyRoleUpgrade(token: string) {
    try {
        if (!supabaseAdmin) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

        // Find user with this token
        const { data: employee, error: fetchError } = await supabaseAdmin
            .from('employees')
            .select('id, pending_role')
            .eq('role_change_token', token)
            .single();

        if (fetchError || !employee) throw new Error('Invalid or expired token');

        if (employee.pending_role !== 'Admin') throw new Error('Invalid pending role');

        // Update role and clear token
        const { error: updateError } = await supabaseAdmin
            .from('employees')
            .update({
                role: 'Admin',
                pending_role: null,
                role_change_token: null,
            })
            .eq('id', employee.id);

        if (updateError) throw updateError;

        return { success: true };
    } catch (error) {
        console.error('Error verifying upgrade:', error);
        return { success: false, error: 'Failed to verify role upgrade' };
    }
}
