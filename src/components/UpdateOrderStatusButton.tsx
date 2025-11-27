'use client';

import { useState } from 'react';
import { updateOrderStatus } from '@/app/actions/orders';
import { Button } from '@/components/ui/Button';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UpdateOrderStatusButtonProps {
    orderId: string;
    currentStatus: string;
}

export function UpdateOrderStatusButton({ orderId, currentStatus }: UpdateOrderStatusButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (currentStatus !== 'pending') return null;

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const result = await updateOrderStatus(orderId, 'delivered');
            if (result.success) {
                toast.success('Order marked as delivered');
            } else {
                toast.error(result.error as string);
            }
        } catch (error) {
            toast.error('Failed to update order status');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleUpdate}
            disabled={isLoading}
            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
            title="Mark as Delivered"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Check className="h-4 w-4" />
            )}
        </Button>
    );
}
