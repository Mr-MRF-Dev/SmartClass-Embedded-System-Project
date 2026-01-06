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
  IconTemperature,
  IconCalendar,
  IconClock,
  IconDeviceDesktop,
  IconMapPin,
  IconSnowflake,
  IconSun,
  IconLeaf,
  IconFlower,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";

interface EmbeddedSystem {
  id: string;
  name: string;
  location: string;
  classroom?: string;
  status: string;
}

interface HeatingSchedule {
  id: string;
  season: string;
  month: number | null;
  weekdays: string;
  startTime: string;
  endTime: string;
  targetTemperature: number;
  enabled: boolean;
}

const MONTHS = [
  { value: 1, label: "فروردین", season: "spring" },
  { value: 2, label: "اردیبهشت", season: "spring" },
  { value: 3, label: "خرداد", season: "spring" },
  { value: 4, label: "تیر", season: "summer" },
  { value: 5, label: "مرداد", season: "summer" },
  { value: 6, label: "شهریور", season: "summer" },
  { value: 7, label: "مهر", season: "fall" },
  { value: 8, label: "آبان", season: "fall" },
  { value: 9, label: "آذر", season: "fall" },
  { value: 10, label: "دی", season: "winter" },
  { value: 11, label: "بهمن", season: "winter" },
  { value: 12, label: "اسفند", season: "winter" },
];

const WEEKDAYS = [
  { value: 6, label: "شنبه", abbr: "ش" },
  { value: 0, label: "یکشنبه", abbr: "ی" },
  { value: 1, label: "دوشنبه", abbr: "د" },
  { value: 2, label: "سه‌شنبه", abbr: "س" },
  { value: 3, label: "چهارشنبه", abbr: "چ" },
  { value: 4, label: "پنج‌شنبه", abbr: "پ" },
  { value: 5, label: "جمعه", abbr: "ج" },
];

export default function DeviceSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const [device, setDevice] = useState<EmbeddedSystem | null>(null);
  const [schedules, setSchedules] = useState<HeatingSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchDevice();
      fetchSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`/api/systems/${params.id}/schedule`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case "spring":
        return (
          <IconFlower
            size={20}
            className="text-green-600 dark:text-green-400"
          />
        );
      case "summer":
        return (
          <IconSun size={20} className="text-yellow-600 dark:text-yellow-400" />
        );
      case "fall":
        return (
          <IconLeaf
            size={20}
            className="text-orange-600 dark:text-orange-400"
          />
        );
      case "winter":
        return (
          <IconSnowflake
            size={20}
            className="text-blue-600 dark:text-blue-400"
          />
        );
      default:
        return null;
    }
  };

  const getWeekdaysLabel = (weekdaysStr: string) => {
    // Handle undefined or null weekdays (for old data)
    if (!weekdaysStr) return "همه روزها";

    const days = weekdaysStr.split(",").map(Number);
    if (days.length === 7) return "همه روزها";
    return WEEKDAYS.filter((w) => days.includes(w.value))
      .map((w) => w.abbr)
      .join("، ");
  };

  const getSchedulesForMonth = (monthNum: number) => {
    return schedules.filter(
      (s) =>
        s.month === monthNum ||
        (s.month === null &&
          s.season === MONTHS.find((m) => m.value === monthNum)?.season),
    );
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این برنامه را حذف کنید؟")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/systems/${params.id}/schedule?scheduleId=${scheduleId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) throw new Error("Failed to delete schedule");
      await fetchSchedules();
    } catch (err) {
      console.error("Error deleting schedule:", err);
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
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400"></div>
          <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            در حال بارگذاری...
          </div>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="flex min-h-screen items-center justify-center border-none! bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <Card className="max-w-md border-2 border-red-200 dark:border-red-800">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <IconDeviceDesktop
                size={32}
                className="text-red-600 dark:text-red-400"
              />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-200">
              خطا در بارگذاری
            </h2>
            <p className="mb-6 text-red-600 dark:text-red-400">
              {error || "دیوایس یافت نشد"}
            </p>
            <Button
              onClick={() => router.push("/")}
              size="lg"
              className="bg-linear-to-r from-blue-600 to-purple-600"
            >
              <IconArrowLeft size={18} className="ml-2" />
              بازگشت به صفحه اصلی
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen border-none! bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="container mx-auto space-y-8 p-6 md:p-8 lg:p-10">
        {/* Enhanced Header */}
        <div className="animate-in slide-in-from-top duration-700">
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push(`/devices/${params.id}`)}
              className="group border-2 border-gray-300 bg-white/80 backdrop-blur-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/80 dark:hover:border-blue-600 dark:hover:bg-blue-950"
            >
              <IconArrowLeft
                size={20}
                className="ml-2 transition-transform group-hover:-translate-x-1"
              />
              بازگشت به دیوایس
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 p-4 shadow-lg dark:from-orange-900 dark:via-red-900 dark:to-pink-900">
                  <IconTemperature
                    size={40}
                    className="text-red-600 dark:text-red-400"
                  />
                </div>
                <div>
                  <h1 className="bg-linear-to-r from-red-600 via-orange-600 to-pink-600 bg-clip-text text-4xl font-extrabold text-transparent drop-shadow-sm">
                    برنامه‌ریزی گرمایش
                  </h1>
                  <p className="mt-2 flex items-center gap-2 text-lg text-gray-600 dark:text-gray-300">
                    <IconDeviceDesktop size={18} />
                    {device.name}
                    {device.location && (
                      <>
                        <span className="text-gray-400">•</span>
                        <IconMapPin size={18} />
                        {device.location}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <Badge
              className={`${getStatusColor(device.status)} px-5 py-2.5 text-sm font-bold text-white shadow-md`}
            >
              {device.status === "active"
                ? "فعال"
                : device.status === "inactive"
                  ? "غیرفعال"
                  : device.status === "maintenance"
                    ? "تعمیر"
                    : device.status}
            </Badge>
          </div>

          {/* Info Banner */}
          <Card className="animate-in fade-in border-2 border-blue-200 bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-lg duration-500 dark:border-blue-800 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-100 p-3 shadow-md dark:bg-blue-900">
                  <IconCalendar
                    size={24}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    مدیریت برنامه‌های حرارتی
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    تنظیم دما و زمان شروع گرمایش بر اساس فصل و ماه سال برای
                    بهینه‌سازی مصرف انرژی
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seasonal Overview Cards */}
        {/* <div className="animate-in fade-in slide-in-from-bottom grid gap-6 duration-700 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group relative overflow-hidden border-2 border-blue-200 bg-white/80 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:border-blue-800 dark:bg-gray-800/80">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-200 opacity-20 transition-transform group-hover:scale-150 dark:bg-blue-800"></div>
            <CardContent className="relative z-10 py-6 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 shadow-md dark:from-blue-900 dark:to-cyan-900">
                <IconSnowflake
                  size={32}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <h3 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
                زمستان
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                دی، بهمن، اسفند
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-2 border-green-200 bg-white/80 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:border-green-800 dark:bg-gray-800/80">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-green-200 opacity-20 transition-transform group-hover:scale-150 dark:bg-green-800"></div>
            <CardContent className="relative z-10 py-6 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 shadow-md dark:from-green-900 dark:to-emerald-900">
                <IconFlower
                  size={32}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              <h3 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
                بهار
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                فروردین، اردیبهشت، خرداد
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-2 border-yellow-200 bg-white/80 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:border-yellow-800 dark:bg-gray-800/80">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-yellow-200 opacity-20 transition-transform group-hover:scale-150 dark:bg-yellow-800"></div>
            <CardContent className="relative z-10 py-6 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 shadow-md dark:from-yellow-900 dark:to-orange-900">
                <IconSun
                  size={32}
                  className="text-yellow-600 dark:text-yellow-400"
                />
              </div>
              <h3 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
                تابستان
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                تیر، مرداد، شهریور
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-2 border-orange-200 bg-white/80 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:border-orange-800 dark:bg-gray-800/80">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-orange-200 opacity-20 transition-transform group-hover:scale-150 dark:bg-orange-800"></div>
            <CardContent className="relative z-10 py-6 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100 shadow-md dark:from-orange-900 dark:to-red-900">
                <IconLeaf
                  size={32}
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>
              <h3 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
                پاییز
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                مهر، آبان، آذر
              </p>
            </CardContent>
          </Card>
        </div> */}

        {/* Main Schedule Form */}
        <Card className="group animate-in fade-in slide-in-from-bottom relative overflow-hidden border-2 border-blue-200 bg-white/80 shadow-2xl backdrop-blur-sm transition-all duration-700 dark:border-blue-800 dark:bg-gray-800/80">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-orange-200 to-pink-200 opacity-10 transition-transform group-hover:scale-125 dark:from-orange-800 dark:to-pink-800"></div>
          <CardHeader className="relative z-10 border-b-2 border-blue-200 pb-6 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-red-100 via-orange-100 to-pink-100 p-3 shadow-lg dark:from-red-900 dark:via-orange-900 dark:to-pink-900">
                  <IconClock
                    size={32}
                    className="text-red-600 dark:text-red-400"
                  />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
                    {showForm ? "افزودن برنامه جدید" : "برنامه‌های حرارتی"}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base text-gray-700 dark:text-gray-300">
                    {showForm
                      ? "برای هر ماه، روزهای هفته و بازه زمانی مشخص کنید"
                      : "مشاهده و مدیریت برنامه‌های ماهانه"}
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => setShowForm(!showForm)}
                size="lg"
                variant={showForm ? "outline" : "default"}
                className={
                  showForm
                    ? "border-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                    : "bg-linear-to-r from-green-500 to-emerald-500 shadow-lg hover:shadow-xl"
                }
              >
                {showForm ? "لغو" : "افزودن برنامه جدید"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pt-6">
            {showForm ? (
              <HeatingScheduleForm
                key="schedule-form"
                systemId={device.id}
                onScheduleSaved={() => {
                  fetchSchedules();
                  setShowForm(false);
                }}
              />
            ) : (
              <div className="space-y-6">
                {/* Month-based Schedule View */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {MONTHS.map((month) => {
                    const monthSchedules = getSchedulesForMonth(month.value);
                    const hasSchedules = monthSchedules.length > 0;

                    return (
                      <Card
                        key={month.value}
                        className={`group relative overflow-hidden border-2 transition-all hover:shadow-lg ${
                          hasSchedules
                            ? "border-green-200 bg-white dark:border-green-800 dark:bg-gray-800"
                            : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getSeasonIcon(month.season)}
                              <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                {month.label}
                              </CardTitle>
                            </div>
                            {hasSchedules && (
                              <Badge className="bg-green-500 text-white">
                                {monthSchedules.length} برنامه
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {hasSchedules ? (
                            monthSchedules.map((schedule) => (
                              <div
                                key={schedule.id}
                                className="rounded-lg border-2 border-gray-200 bg-linear-to-r from-blue-50 to-indigo-50 p-3 shadow-sm dark:border-gray-700 dark:from-blue-950 dark:to-indigo-950"
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <Badge
                                    variant={
                                      schedule.enabled ? "default" : "outline"
                                    }
                                    className={
                                      schedule.enabled
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                    }
                                  >
                                    {schedule.enabled ? "فعال" : "غیرفعال"}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(schedule.id)}
                                    className="h-7 w-7 p-0 text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                  >
                                    <IconTrash size={14} />
                                  </Button>
                                </div>
                                <div className="space-y-1.5 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                                      روزها:
                                    </span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                      {getWeekdaysLabel(schedule.weekdays)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                                      زمان:
                                    </span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                      {schedule.startTime} - {schedule.endTime}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                                      دما:
                                    </span>
                                    <span className="flex items-center gap-1 font-bold text-red-600 dark:text-red-400">
                                      <IconTemperature size={14} />
                                      {schedule.targetTemperature}°C
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-4 text-center text-xs text-gray-500 dark:text-gray-400">
                              هیچ برنامه‌ای تعریف نشده
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="animate-in fade-in slide-in-from-bottom border-2 border-green-200 bg-linear-to-r from-green-50 via-emerald-50 to-teal-50 shadow-lg duration-700 dark:border-green-800 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
          <CardHeader className="border-b-2 border-green-200 pb-4 dark:border-green-800">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
              <div className="rounded-xl bg-green-100 p-2 shadow-md dark:bg-green-900">
                <IconTemperature
                  size={24}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              نکات مهم برای بهینه‌سازی انرژی
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                  1
                </span>
                <span>
                  دمای پیشنهادی برای فصل سرد بین 18 تا 22 درجه سانتی‌گراد است
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                  2
                </span>
                <span>
                  برای صرفه‌جویی در مصرف انرژی، زمان شروع را متناسب با ساعات
                  حضور تنظیم کنید
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                  3
                </span>
                <span>
                  در ماه‌های گرم سال می‌توانید سیستم گرمایش را غیرفعال کنید
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                  4
                </span>
                <span>
                  تغییرات اعمال شده به‌صورت خودکار در سیستم ذخیره و اجرا می‌شود
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
