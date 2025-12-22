'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SystemFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SystemForm({ onSuccess, onCancel }: SystemFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    classroom: '',
    description: '',
    status: 'active',
    ipAddress: '',
    macAddress: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/systems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create system');

      setFormData({ 
        name: '', 
        location: '', 
        classroom: '',
        description: '', 
        status: 'active',
        ipAddress: '',
        macAddress: ''
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">System Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Classroom A Monitor"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Building 1, Room 101"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="classroom">Classroom</Label>
          <Input
            id="classroom"
            value={formData.classroom}
            onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
            placeholder="e.g., Room 101"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ipAddress">IP Address</Label>
          <Input
            id="ipAddress"
            value={formData.ipAddress}
            onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
            placeholder="e.g., 192.168.1.100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="macAddress">MAC Address</Label>
          <Input
            id="macAddress"
            value={formData.macAddress}
            onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
            placeholder="e.g., AA:BB:CC:DD:EE:FF"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value || 'active' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create System'}
        </Button>
      </div>
    </form>
  );
}
