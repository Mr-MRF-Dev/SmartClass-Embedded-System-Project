"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SystemFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SystemForm({ onSuccess, onCancel }: SystemFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    classroom: "",
    description: "",
    status: "active",
    ipAddress: "",
    macAddress: "",
    deviceId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/systems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create system");

      setFormData({
        name: "",
        location: "",
        classroom: "",
        description: "",
        status: "active",
        ipAddress: "",
        macAddress: "",
        deviceId: "",
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">نام دیوایس *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="مثال: سیستم گرمایش کلاس A"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">موقعیت *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="مثال: ساختمان 1، اتاق 101"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="classroom">کلاس</Label>
          <Input
            id="classroom"
            value={formData.classroom}
            onChange={(e) =>
              setFormData({ ...formData, classroom: e.target.value })
            }
            placeholder="مثال: اتاق 101"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">توضیحات</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="توضیحات اختیاری..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deviceId">شناسه یکتای دیوایس *</Label>
        <Input
          id="deviceId"
          value={formData.deviceId}
          onChange={(e) =>
            setFormData({ ...formData, deviceId: e.target.value })
          }
          placeholder="e.g., DEVICE-001"
          required
        />
        <p className="text-xs text-gray-500">
          شناسه یکتای دیوایس برای شناسایی و کنترل
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ipAddress">آدرس IP</Label>
          <Input
            id="ipAddress"
            value={formData.ipAddress}
            onChange={(e) =>
              setFormData({ ...formData, ipAddress: e.target.value })
            }
            placeholder="مثال: 192.168.1.100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="macAddress">آدرس MAC</Label>
          <Input
            id="macAddress"
            value={formData.macAddress}
            onChange={(e) =>
              setFormData({ ...formData, macAddress: e.target.value })
            }
            placeholder="مثال: AA:BB:CC:DD:EE:FF"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">وضعیت</Label>
        <Select
          value={formData.status}
          onValueChange={(value) =>
            setFormData({ ...formData, status: value || "active" })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">فعال</SelectItem>
            <SelectItem value="inactive">غیرفعال</SelectItem>
            <SelectItem value="maintenance">در حال تعمیر</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            انصراف
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "در حال ایجاد..." : "ایجاد دیوایس"}
        </Button>
      </div>
    </form>
  );
}
