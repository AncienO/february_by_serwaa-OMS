'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function DeleteOrderButton({ orderId, canDelete = true }: { orderId: string; canDelete?: boolean }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!canDelete) return null;

    function handleDelete() {
        toast("Are you sure?", {
            description: "This action cannot be undone.",
            action: {
                label: "Delete",
                onClick: async () => {
                    setIsDeleting(true);
                    try {
                        const { error } = await supabase
                            .from('orders')
                            .delete()
                            .eq('id', orderId);

                        if (error) throw error;

                        toast.success('Order deleted successfully');
                        router.refresh();
                    } catch (error) {
                        console.error('Error deleting order:', error);
                        toast.error('Failed to delete order');
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
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
        >
            {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </Button>
    );
}
