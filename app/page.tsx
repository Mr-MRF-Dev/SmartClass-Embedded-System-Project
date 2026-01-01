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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto space-y-8 p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
              پنل مدیریت SmartClass
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              مدیریت و برنامه‌ریزی سیستم‌های تعبیه‌شده
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowSystemForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
            >
              <IconPlus size={18} className="ml-2" />
              افزودن دیوایس
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-1">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg transition-shadow hover:shadow-xl dark:border-blue-800 dark:from-blue-950 dark:to-purple-950">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                تعداد کل دیوایس‌ها
              </CardTitle>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <IconServer
                  size={24}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {systems.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="mb-6 text-3xl font-bold text-gray-800 dark:text-gray-200">
            دیوایس‌ها
          </h2>
          {systems.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
              <CardContent className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <IconServer size={32} className="text-gray-400" />
                </div>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  دیوایسی یافت نشد. اولین دیوایس را اضافه کنید!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {systems.map((system) => (
                <Card
                  key={system.id}
                  className="group cursor-pointer border-2 border-gray-200 bg-white transition-all duration-300 hover:border-blue-400 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
                  onClick={() => router.push(`/devices/${system.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
                          {system.name}
                        </CardTitle>
                        <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                          {system.location}
                        </CardDescription>
                        {system.deviceId && (
                          <div className="mt-2 inline-block rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                            {system.deviceId}
                          </div>
                        )}
                      </div>
                      <Badge
                        className={`${getStatusColor(system.status)} shrink-0 px-3 py-1 text-xs font-semibold text-white`}
                      >
                        {system.status === "active"
                          ? "فعال"
                          : system.status === "inactive"
                            ? "غیرفعال"
                            : system.status === "maintenance"
                              ? "تعمیر"
                              : system.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="line-clamp-2 min-h-[2.5rem] text-sm text-gray-600 dark:text-gray-400">
                      {system.description || "بدون توضیحات"}
                    </p>
                    <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-3 dark:from-blue-950 dark:to-purple-950">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                          <IconSettings
                            size={16}
                            className="text-blue-600 dark:text-blue-400"
                          />
                        </div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {system._count?.heatingSchedules || 0} برنامه
                        </span>
                      </div>
                      {system.lastSeen && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(system.lastSeen).toLocaleTimeString(
                            "fa-IR",
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-blue-200 transition-all hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-600 dark:hover:bg-blue-950"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/devices/${system.id}`);
                        }}
                      >
                        <IconSettings size={16} className="ml-2" />
                        مدیریت
                        <IconArrowRight size={16} className="ml-2" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 transition-all hover:border-red-400 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:border-red-600 dark:hover:bg-red-950"
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
