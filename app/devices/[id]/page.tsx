"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeatingScheduleForm } from "@/components/heating-schedule-form";
import {
  IconArrowLeft,
  IconDeviceDesktop,
  IconMapPin,
  IconCalendar,
  IconTemperature,
  IconClock,
  IconTrash,
} from "@tabler/icons-react";

interface EmbeddedSystem {
  id: string;
  name: string;
  location: string;
  classroom?: string;
  description?: string;
  status: string;
  deviceId?: string;
  lastSeen?: string;
  createdAt: string;
}

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [device, setDevice] = useState<EmbeddedSystem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchDevice();
    }
  }, [params.id]);

  const fetchDevice = async () => {
    try {
      const response = await fetch(`/api/systems/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch device");
      const data = await response.json();
      setDevice(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در بارگذاری");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `آیا مطمئن هستید که می‌خواهید دیوایس "${device?.name}" را حذف کنید؟\nاین عمل غیرقابل بازگشت است و تمام برنامه‌های مرتبط نیز حذف خواهند شد.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/systems/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete device");

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در حذف دیوایس");
      alert("خطا در حذف دیوایس. لطفا دوباره تلاش کنید.");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500",
      online: "bg-green-500",
      inactive: "bg-gray-500",
      offline: "bg-gray-500",
      maintenance: "bg-yellow-500",
      error: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg text-red-500">
            {error || "دیوایس یافت نشد"}
          </div>
          <Button onClick={() => router.push("/")}>بازگشت به صفحه اصلی</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <IconArrowLeft size={16} />
              بازگشت
            </Button>
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold">
                <IconDeviceDesktop size={32} />
                {device.name}
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                مدیریت و برنامه‌ریزی گرمایش
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(device.status)}>
              {device.status}
            </Badge>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-700"
            >
              <IconTrash size={16} />
              حذف دیوایس
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات دیوایس</CardTitle>
              <CardDescription>مشخصات و اطلاعات کلی دیوایس</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <IconDeviceDesktop
                    size={20}
                    className="mt-0.5 text-gray-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      شناسه یکتا
                    </div>
                    <div className="font-medium">
                      {device.deviceId || "تعریف نشده"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IconMapPin size={20} className="mt-0.5 text-gray-500" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      موقعیت
                    </div>
                    <div className="font-medium">{device.location}</div>
                    {device.classroom && (
                      <div className="text-sm text-gray-500">
                        کلاس: {device.classroom}
                      </div>
                    )}
                  </div>
                </div>

                {device.description && (
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        توضیحات
                      </div>
                      <div className="text-sm">{device.description}</div>
                    </div>
                  </div>
                )}

                {device.lastSeen && (
                  <div className="flex items-start gap-3">
                    <IconClock size={20} className="mt-0.5 text-gray-500" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        آخرین مشاهده
                      </div>
                      <div className="text-sm">
                        {new Date(device.lastSeen).toLocaleString("fa-IR")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconTemperature size={24} />
                برنامه‌ریزی گرمایش
              </CardTitle>
              <CardDescription>
                تنظیم زمان شروع و دمای مطلوب بر اساس فصل و ماه
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HeatingScheduleForm systemId={device.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
