'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SensorFormProps {
  systems: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SensorForm({ systems, onSuccess, onCancel }: SensorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'temperature',
    unit: '°C',
    embeddedSystemId: '',
    status: 'online'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/sensors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create sensor');

      setFormData({ 
        name: '', 
        type: 'temperature', 
        unit: '°C', 
        embeddedSystemId: '', 
        status: 'online' 
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
        <Label htmlFor="sensor-name">Sensor Name *</Label>
        <Input
          id="sensor-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Temperature Sensor 1"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Sensor Type *</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => {
            const units: Record<string, string> = {
              temperature: '°C',
              humidity: '%',
              light: 'lux',
              pressure: 'hPa',
              power: 'W',
              other: ''
            };
            if (value) {
              setFormData({ ...formData, type: value, unit: units[value] || '' });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="temperature">Temperature</SelectItem>
            <SelectItem value="humidity">Humidity</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="pressure">Pressure</SelectItem>
            <SelectItem value="power">Power</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unit</Label>
        <Input
          id="unit"
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          placeholder="e.g., °C, %, lux"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="system">Embedded System *</Label>
        <Select
          value={formData.embeddedSystemId}
          onValueChange={(value) => setFormData({ ...formData, embeddedSystemId: value || '' })}
          required
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {systems.map((system) => (
              <SelectItem key={system.id} value={system.id}>
                {system.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sensor-status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value || 'online' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="error">Error</SelectItem>
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
          {isLoading ? 'Creating...' : 'Create Sensor'}
        </Button>
      </div>
    </form>
  );
}
