"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SystemForm } from "@/components/system-form";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  IconPlus,
  IconServer,
  IconSettings,
  IconArrowRight,
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
  _count?: { heatingSchedules: number };
}

export default function Dashboard() {
  const router = useRouter();
  const [systems, setSystems] = useState<EmbeddedSystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSystemForm, setShowSystemForm] = useState(false);

  const fetchData = async () => {
    try {
      const systemsRes = await fetch("/api/systems");
      if (systemsRes.ok) setSystems(await systemsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteDevice = async (deviceId: string, deviceName: string) => {
    if (
      !confirm(
        `آیا مطمئن هستید که می‌خواهید دیوایس "${deviceName}" را حذف کنید؟\nاین عمل غیرقابل بازگشت است.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/systems/${deviceId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete device");

      await fetchData();
    } catch (error) {
      console.error("Error deleting device:", error);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">پنل مدیریت SmartClass</h1>
            <p className="text-gray-600 dark:text-gray-400">
              مدیریت و برنامه‌ریزی سیستم‌های تعبیه‌شده
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowSystemForm(true)}>
              <IconPlus size={16} className="mr-2" />
              افزودن دیوایس
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                تعداد کل دیوایس‌ها
              </CardTitle>
              <IconServer size={20} className="text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systems.length}</div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold">دیوایس‌ها</h2>
          {systems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  دیوایسی یافت نشد. اولین دیوایس را اضافه کنید!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {systems.map((system) => (
                <Card
                  key={system.id}
                  className="cursor-pointer transition-shadow hover:shadow-lg"
                  onClick={() => router.push(`/devices/${system.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{system.name}</CardTitle>
                        <CardDescription>{system.location}</CardDescription>
                        {system.deviceId && (
                          <div className="mt-1 text-xs text-gray-500">
                            شناسه: {system.deviceId}
                          </div>
                        )}
                      </div>
                      <Badge className={getStatusColor(system.status)}>
                        {system.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      {system.description || "بدون توضیحات"}
                    </p>
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {system._count?.heatingSchedules || 0} برنامه گرمایش
                      </span>
                      {system.lastSeen && (
                        <span className="text-xs text-gray-500">
                          {new Date(system.lastSeen).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/devices/${system.id}`);
                        }}
                      >
                        <IconSettings size={16} className="mr-2" />
                        مدیریت و برنامه‌ریزی
                        <IconArrowRight size={16} className="mr-2" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDevice(system.id, system.name);
                        }}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showSystemForm} onOpenChange={setShowSystemForm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>افزودن دیوایس جدید</AlertDialogTitle>
          </AlertDialogHeader>
          <SystemForm
            onSuccess={() => {
              setShowSystemForm(false);
              fetchData();
            }}
            onCancel={() => setShowSystemForm(false)}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
