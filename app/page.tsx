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
  IconCalendar,
  IconMapPin,
  IconLogout,
  IconAlertTriangle,
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
  alarmActive?: boolean;
  alarmTriggeredAt?: string | null;
  createdAt: string;
  _count?: { heatingSchedules: number };
}

interface AlarmInfo {
  hasAlarms: boolean;
  alarms: Array<{
    id: string;
    name: string;
    deviceId: string | null;
    location: string;
    alarmTriggeredAt: string | null;
  }>;
  count: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [systems, setSystems] = useState<EmbeddedSystem[]>([]);
  const [alarmInfo, setAlarmInfo] = useState<AlarmInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSystemForm, setShowSystemForm] = useState(false);

  const fetchData = async () => {
    try {
      const systemsRes = await fetch("/api/systems");
      if (systemsRes.ok) setSystems(await systemsRes.json());

      const alarmsRes = await fetch("/api/alarms");
      if (alarmsRes.ok) setAlarmInfo(await alarmsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh alarms and systems every 5 seconds
    const interval = setInterval(() => {
      fetch("/api/alarms")
        .then((res) => res.json())
        .then((data) => setAlarmInfo(data))
        .catch(console.error);
      fetch("/api/systems")
        .then((res) => res.json())
        .then((data) => setSystems(data))
        .catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید از سیستم خارج شوید؟")) {
      return;
    }

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert("خطا در خروج از سیستم");
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Critical Alarm Banner - Sticky */}
      {alarmInfo?.hasAlarms && (
        <div className="sticky top-0 z-50 animate-pulse bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shadow-2xl">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <IconAlertTriangle size={32} className="animate-bounce" />
              <div>
                <div className="text-xl font-bold">
                  ⚠️ وضعیت بحرانی شناسایی شد!
                </div>
                <div className="text-sm opacity-90">
                  {alarmInfo.count} دیوایس در وضعیت بحرانی:{" "}
                  {alarmInfo.alarms.map((a) => a.name).join("، ")}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-white/30 bg-white/20 text-white hover:bg-white/30"
              onClick={() => {
                if (alarmInfo.alarms.length > 0) {
                  router.push(`/devices/${alarmInfo.alarms[0].id}`);
                }
              }}
            >
              مشاهده جزئیات
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto space-y-8 p-6 md:p-8 lg:p-10">
        {/* Header Section with Enhanced Animation */}
        <div className="animate-in fade-in slide-in-from-top flex flex-col gap-6 duration-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <h1 className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-5xl font-extrabold text-transparent drop-shadow-sm">
              پنل مدیریت SmartClass
            </h1>
            <p className="flex items-center gap-2 text-xl text-gray-600 dark:text-gray-300">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
              مدیریت هوشمند و برنامه‌ریزی سیستم‌های تعبیه‌شده
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleLogout}
              size="lg"
              variant="outline"
              className="group border-2 border-red-300 bg-white text-red-600 shadow-lg transition-all hover:scale-105 hover:border-red-500 hover:bg-red-50 hover:text-red-700 hover:shadow-xl active:scale-95"
            >
              <IconLogout
                size={20}
                className="ml-2 transition-transform group-hover:-translate-x-1"
              />
              خروج
            </Button>
            <Button
              onClick={() => setShowSystemForm(true)}
              size="lg"
              className="group bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl transition-all hover:scale-105 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:shadow-2xl active:scale-95"
            >
              <IconPlus
                size={20}
                className="ml-2 transition-transform group-hover:rotate-90"
              />
              افزودن دیوایس جدید
            </Button>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          <Card className="group relative overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:border-blue-900 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-200 opacity-20 transition-transform group-hover:scale-150 dark:bg-blue-800"></div>
            <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                تعداد کل دیوایس‌ها
              </CardTitle>
              <div className="rounded-full bg-blue-100 p-3 shadow-md transition-transform group-hover:rotate-12 dark:bg-blue-900">
                <IconServer
                  size={24}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                {systems.length}
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                سیستم ثبت‌شده
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-2 border-green-200 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:border-green-900 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-green-200 opacity-20 transition-transform group-hover:scale-150 dark:bg-green-800"></div>
            <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                دیوایس‌های فعال
              </CardTitle>
              <div className="rounded-full bg-green-100 p-3 shadow-md transition-transform group-hover:rotate-12 dark:bg-green-900">
                <IconSettings
                  size={24}
                  className="animate-spin-slow text-green-600 dark:text-green-400"
                />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold text-green-600 dark:text-green-400">
                {
                  systems.filter(
                    (s) => s.status === "active" || s.status === "online",
                  ).length
                }
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                آنلاین و در دسترس
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:border-purple-900 dark:from-purple-950 dark:via-fuchsia-950 dark:to-pink-950">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-purple-200 opacity-20 transition-transform group-hover:scale-150 dark:bg-purple-800"></div>
            <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                برنامه‌های فعال
              </CardTitle>
              <div className="rounded-full bg-purple-100 p-3 shadow-md transition-transform group-hover:rotate-12 dark:bg-purple-900">
                <IconCalendar
                  size={24}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold text-purple-600 dark:text-purple-400">
                {systems.reduce(
                  (sum, s) => sum + (s._count?.heatingSchedules || 0),
                  0,
                )}
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                برنامه زمان‌بندی
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:border-amber-900 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-200 opacity-20 transition-transform group-hover:scale-150 dark:bg-amber-800"></div>
            <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                وضعیت سیستم
              </CardTitle>
              <div className="rounded-full bg-amber-100 p-3 shadow-md transition-transform group-hover:rotate-12 dark:bg-amber-900">
                <IconServer
                  size={24}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                عملیاتی
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                همه سیستم‌ها آماده
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Devices Section with Enhanced Cards */}
        <div className="animate-in fade-in slide-in-from-bottom duration-700">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
                دیوایس‌های من
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                مدیریت و کنترل تمامی دستگاه‌های هوشمند
              </p>
            </div>
          </div>

          {systems.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300 bg-white/50 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
              <CardContent className="py-20 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                  <IconServer
                    size={48}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-700 dark:text-gray-300">
                  هنوز دیوایسی وجود ندارد
                </h3>
                <p className="mb-6 text-gray-500 dark:text-gray-400">
                  اولین دیوایس خود را اضافه کنید و شروع به مدیریت کنید
                </p>
                <Button
                  onClick={() => setShowSystemForm(true)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700"
                >
                  <IconPlus size={20} className="ml-2" />
                  افزودن اولین دیوایس
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {systems.map((system, index) => {
                // Check if this device has an active alarm from alarmInfo
                const hasAlarm =
                  alarmInfo?.alarms?.some((alarm) => alarm.id === system.id) ||
                  false;
                return (
                  <Card
                    key={system.id}
                    className={`group animate-in fade-in slide-in-from-bottom relative cursor-pointer overflow-hidden border-2 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl ${
                      hasAlarm
                        ? "animate-pulse border-red-500 bg-gradient-to-br from-red-50/90 via-red-100/80 to-pink-50/90 dark:border-red-600 dark:from-red-950/90 dark:via-red-900/80 dark:to-pink-950/90"
                        : "border-gray-200 bg-white/80 hover:border-blue-400 dark:border-gray-700 dark:bg-gray-800/80 dark:hover:border-blue-600"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => router.push(`/devices/${system.id}`)}
                  >
                    {/* Gradient Overlay on Hover */}
                    <div
                      className={`absolute inset-0 transition-all duration-300 ${
                        hasAlarm
                          ? "bg-gradient-to-br from-red-500/10 to-pink-500/10 group-hover:from-red-500/15 group-hover:to-pink-500/15"
                          : "bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5"
                      }`}
                    ></div>

                    {/* Alarm Indicator Badge */}
                    {hasAlarm && (
                      <div className="absolute top-2 left-2 z-20 rounded-full bg-red-600 p-1.5 shadow-lg">
                        <IconAlertTriangle
                          size={16}
                          className="animate-bounce text-white"
                        />
                      </div>
                    )}

                    <CardHeader className="relative z-10 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="mb-2 text-xl font-bold text-gray-800 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                            {system.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 text-base text-gray-600 dark:text-gray-400">
                            <IconMapPin size={16} />
                            {system.location}
                          </CardDescription>
                          {system.deviceId && (
                            <div className="mt-3 inline-block rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 font-mono text-xs font-medium text-gray-700 shadow-sm dark:from-gray-700 dark:to-gray-600 dark:text-gray-300">
                              ID: {system.deviceId}
                            </div>
                          )}
                        </div>
                        <Badge
                          className={`${getStatusColor(system.status)} shrink-0 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-transform group-hover:scale-110`}
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

                    <CardContent className="relative z-10 space-y-4">
                      <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        {system.description || "بدون توضیحات اضافی"}
                      </p>

                      {/* Stats Bar */}
                      <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 shadow-sm dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 p-2.5 shadow-sm transition-transform group-hover:scale-110 dark:from-blue-900 dark:to-indigo-900">
                            <IconSettings
                              size={18}
                              className="text-blue-600 dark:text-blue-400"
                            />
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                              {system._count?.heatingSchedules || 0}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              برنامه فعال
                            </div>
                          </div>
                        </div>
                        {system.lastSeen && (
                          <div className="text-left">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              آخرین بروزرسانی
                            </div>
                            <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              {new Date(system.lastSeen).toLocaleTimeString(
                                "fa-IR",
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="group/btn flex-1 border-blue-200 bg-blue-50 font-semibold transition-all hover:border-blue-400 hover:bg-blue-100 hover:shadow-md dark:border-blue-800 dark:bg-blue-950 dark:hover:border-blue-600 dark:hover:bg-blue-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/devices/${system.id}`);
                          }}
                        >
                          <IconSettings
                            size={16}
                            className="ml-2 transition-transform group-hover/btn:rotate-90"
                          />
                          مدیریت
                          <IconArrowRight
                            size={16}
                            className="mr-2 transition-transform group-hover/btn:-translate-x-1"
                          />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="group/delete border-red-200 bg-red-50 text-red-600 transition-all hover:border-red-400 hover:bg-red-100 hover:shadow-md dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:border-red-600 dark:hover:bg-red-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDevice(system.id, system.name);
                          }}
                        >
                          <IconTrash
                            size={16}
                            className="transition-transform group-hover/delete:scale-110"
                          />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
