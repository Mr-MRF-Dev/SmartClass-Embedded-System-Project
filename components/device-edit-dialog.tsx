"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

interface EmbeddedSystem {
  id: string;
  name: string;
  location: string;
  classroom?: string;
  description?: string;
  status: string;
  deviceId?: string;
  ipAddress?: string;
  macAddress?: string;
}

interface DeviceEditDialogProps {
  device: EmbeddedSystem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function DeviceEditDialog({
  device,
  open,
  onOpenChange,
  onSave,
}: DeviceEditDialogProps) {
  const [formData, setFormData] = useState({
    name: device.name,
    location: device.location,
    classroom: device.classroom || "",
    description: device.description || "",
    status: device.status,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/systems/${device.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          classroom: formData.classroom || null,
          description: formData.description || null,
          status: formData.status,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update device");
      }

      onSave();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update device");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[90vh] max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>ویرایش دیوایس</AlertDialogTitle>
          <AlertDialogDescription>
            به‌روزرسانی اطلاعات و وضعیت دیوایس
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid max-h-[60vh] gap-4 overflow-y-auto px-1 py-4">
          {error && (
            <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-900">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="name">نام دیوایس</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="نام دیوایس را وارد کنید"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">وضعیت</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => {
                if (value) {
                  setFormData({ ...formData, status: value });
                }
              }}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">فعال</SelectItem>
                <SelectItem value="inactive">غیرفعال</SelectItem>
                <SelectItem value="maintenance">در تعمیر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">موقعیت مکانی</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="موقعیت مکانی را وارد کنید"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="classroom">کلاس (اختیاری)</Label>
            <Input
              id="classroom"
              value={formData.classroom}
              onChange={(e) =>
                setFormData({ ...formData, classroom: e.target.value })
              }
              placeholder="نام کلاس را وارد کنید"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">توضیحات (اختیاری)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="توضیحات را وارد کنید"
              rows={3}
            />
          </div>

          {device.deviceId && (
            <div className="grid gap-2">
              <Label>شناسه دیوایس</Label>
              <Input value={device.deviceId} disabled className="bg-gray-100" />
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSaving}>لغو</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
