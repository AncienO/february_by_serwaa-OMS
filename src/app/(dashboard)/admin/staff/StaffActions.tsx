'use client';

import { useState } from 'react';
import { deleteStaff, initiateRoleUpgrade } from '@/app/actions/staff';
import { Trash2, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StaffActionsProps {
    employee: any;
    currentUserId: string;
}

export function StaffActions({ employee, currentUserId }: StaffActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);

    if (employee.id === currentUserId) return null;

    const handleDelete = () => {
        toast("Are you sure?", {
            description: "This action cannot be undone.",
            action: {
                label: "Delete",
                onClick: async () => {
                    setIsDeleting(true);
                    try {
                        const result = await deleteStaff(employee.id);
                        if (result.success) {
                            toast.success('Staff member deleted successfully');
                        } else {
                            toast.error(result.error as string);
                        }
                    } catch (error) {
                        toast.error('An unexpected error occurred');
                    } finally {
                        setIsDeleting(false);
                    }
                },
            },
            cancel: {
                label: "Cancel",
                onClick: () => { },
            },
        });
    };

    const handleUpgrade = () => {
        toast("Upgrade to Admin?", {
            description: "They will receive an email to verify.",
            action: {
                label: "Upgrade",
                onClick: async () => {
                    setIsUpgrading(true);
                    try {
                        const result = await initiateRoleUpgrade(employee.id, employee.email);
                        if (result.success) {
                            toast.success('Upgrade invitation sent successfully');
                        } else {
                            toast.error(result.error as string);
                        }
                    } catch (error) {
                        toast.error('An unexpected error occurred');
                    } finally {
                        setIsUpgrading(false);
                    }
                },
            },
            cancel: {
                label: "Cancel",
                onClick: () => { },
            },
        });
    };

    return (
        <div className="flex items-center gap-2">
            {employee.role !== 'Admin' && employee.pending_role !== 'Admin' && (
                <button
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className="p-2 text-zinc-400 hover:text-purple-600 transition-colors disabled:opacity-50"
                    title="Upgrade to Admin"
                >
                    {isUpgrading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                </button>
            )}
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Delete Staff"
            >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
        </div>
    );
}
