'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { CreateOrderRequest, Customer } from '@/lib/types';

interface OrderFormProps {
  customerId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function OrderForm({ customerId, onSuccess, onCancel }: OrderFormProps) {
  const [formData, setFormData] = useState<CreateOrderRequest>({
    customerId: customerId || '',
    orderAmount: 0,
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await api.customers.getAll();
      setCustomers(data);
    } catch (error) {
      toast({
        title: 'Failed to load customers',
        description: 'Unable to fetch customers list.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.orders.create({
        ...formData,
        orderDate: new Date().toISOString(),
      });
      toast({
        title: 'Order created',
        description: 'The order has been added successfully.',
      });
      setFormData({ customerId: customerId || '', orderAmount: 0 });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Failed to create order',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData((prev) => ({
      ...prev,
      orderAmount: value,
    }));
  };

  const handleCustomerChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      customerId: value,
    }));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add New Order</CardTitle>
        <CardDescription>Create a new order for a customer.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!customerId && (
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={formData.customerId}
                onValueChange={handleCustomerChange}
                disabled={isLoadingCustomers}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer._id} value={customer._id}>
                      {customer.name} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Order Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.orderAmount}
              onChange={handleAmountChange}
              required
              placeholder="Enter order amount"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !formData.customerId}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Create Order'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
