'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteRowButtonProps {
    table: 'products' | 'customers' | 'orders';
    id: string;
    className?: string;
}

export function DeleteRowButton({ table, id, className }: DeleteRowButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    function handleDelete() {
        toast("Are you sure?", {
            description: "This action cannot be undone.",
            action: {
                label: "Delete",
                onClick: async () => {
                    setIsDeleting(true);
                    try {
                        const { error } = await supabase
                            .from(table)
                            .delete()
                            .eq('id', id);

                        if (error) {
                            if (error.code === '23503') {
                                toast.error(`Cannot delete this ${table.slice(0, -1)} because it is referenced by other records.`);
                            } else {
                                throw error;
                            }
                        } else {
                            toast.success(`${table.slice(0, -1)} deleted successfully`);
                            router.refresh();
                        }
                    } catch (error) {
                        console.error(`Error deleting from ${table}:`, error);
                        toast.error('Failed to delete record');
                    } finally {
                        setIsDeleting(false);
                    }
                },
            },
            cancel: {
                label: "Cancel",
                onClick: () => setIsDeleting(false),
            },
        });
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className={`h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 ${className}`}
        >
            {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </Button>
    );
}
