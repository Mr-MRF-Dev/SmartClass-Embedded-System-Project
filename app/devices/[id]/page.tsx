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
import { DeviceEditDialog } from "@/components/device-edit-dialog";
import {
  IconArrowLeft,
  IconDeviceDesktop,
  IconMapPin,
  IconTemperature,
  IconClock,
  IconTrash,
  IconDroplet,
  IconSun,
  IconUser,
  IconBolt,
  IconAlertTriangle,
  IconCalendar,
  IconEdit,
} from "@tabler/icons-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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
}

interface DeviceReading {
  id: string;
  temperature: number | null;
  humidity: number | null;
  light: number | null;
  presence: number | null;
  currentConsumption: number | null;
  timestamp: string;
}

interface Alarm {
  id: string;
  triggeredAt: string;
  resolvedAt: string | null;
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

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [device, setDevice] = useState<EmbeddedSystem | null>(null);
  const [readings, setReadings] = useState<DeviceReading[]>([]);
  const [alarmHistory, setAlarmHistory] = useState<Alarm[]>([]);
  const [schedules, setSchedules] = useState<HeatingSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchDevice();
      fetchReadings();
      fetchAlarmHistory();
      fetchSchedules();
      // Refresh readings every 30 seconds
      const interval = setInterval(() => {
        fetchReadings();
      }, 30000);
      return () => clearInterval(interval);
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

  useEffect(() => {
    if (params.id) {
      fetchDevice();
      fetchAlarmHistory();
      // Refresh device status every 5 seconds to check for alarms
      const deviceInterval = setInterval(() => {
        fetchDevice();
        fetchAlarmHistory();
      }, 5000);
      return () => clearInterval(deviceInterval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchReadings = async () => {
    try {
      const response = await fetch(
        `/api/device-readings/${params.id}?hours=24&limit=200`,
      );
      if (!response.ok) throw new Error("Failed to fetch readings");
      const data = await response.json();
      setReadings(data);
    } catch (err) {
      console.error("Error fetching readings:", err);
    }
  };

  const fetchAlarmHistory = async () => {
    try {
      const response = await fetch(`/api/alarm-history/${params.id}?limit=50`);
      if (!response.ok) throw new Error("Failed to fetch alarm history");
      const data = await response.json();
      setAlarmHistory(data);
    } catch (err) {
      console.error("Error fetching alarm history:", err);
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSeasonLabel = (season: string) => {
    const labels: Record<string, string> = {
      spring: "بهار",
      summer: "تابستان",
      fall: "پاییز",
      winter: "زمستان",
    };
    return labels[season] || season;
  };

  const getMonthLabel = (month: number | null) => {
    if (month === null) return "کل فصل";
    const months = [
      "فروردین",
      "اردیبهشت",
      "خرداد",
      "تیر",
      "مرداد",
      "شهریور",
      "مهر",
      "آبان",
      "آذر",
      "دی",
      "بهمن",
      "اسفند",
    ];
    return months[month - 1] || "";
  };

  const getWeekdaysLabel = (weekdaysStr: string) => {
    // Handle undefined or null weekdays (for old data)
    if (!weekdaysStr) return "همه روزها";

    const WEEKDAYS = [
      { value: 6, abbr: "ش" },
      { value: 0, abbr: "ی" },
      { value: 1, abbr: "د" },
      { value: 2, abbr: "س" },
      { value: 3, abbr: "چ" },
      { value: 4, abbr: "پ" },
      { value: 5, abbr: "ج" },
    ];

    const days = weekdaysStr.split(",").map(Number);
    if (days.length === 7) return "همه روزها";
    return WEEKDAYS.filter((w) => days.includes(w.value))
      .map((w) => w.abbr)
      .join("، ");
  };

  // Convert Gregorian date to Persian/Jalali calendar month
  const getPersianMonth = (date: Date = new Date()) => {
    const gregorianYear = date.getFullYear();
    const gregorianMonth = date.getMonth() + 1;
    const gregorianDay = date.getDate();

    // Simple Gregorian to Jalali conversion
    let gy = gregorianYear;
    const gm = gregorianMonth;
    const gd = gregorianDay;

    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    // let jy: number;

    if (gy > 1600) {
      // jy = 979;
      gy -= 1600;
    } else {
      // jy = 0;
      gy -= 621;
    }

    const gy2 = gm > 2 ? gy + 1 : gy;
    let days =
      365 * gy +
      Math.floor((gy2 + 3) / 4) -
      Math.floor((gy2 + 99) / 100) +
      Math.floor((gy2 + 399) / 400) -
      80 +
      gd +
      g_d_m[gm - 1];

    // jy += 33 * Math.floor(days / 12053);
    days %= 12053;
    // jy += 4 * Math.floor(days / 1461);
    days %= 1461;

    if (days > 365) {
      // jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }

    const jm =
      days < 186
        ? 1 + Math.floor(days / 31)
        : 7 + Math.floor((days - 186) / 30);

    return jm;
  };

  const getCurrentMonthSchedules = () => {
    const currentMonth = getPersianMonth();
    return schedules.filter(
      (s) => s.enabled && (s.month === currentMonth || s.month === null),
    );
  };

  const isScheduleActiveNow = (schedule: HeatingSchedule) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Check if today is in the schedule's weekdays
    const scheduleDays = schedule.weekdays.split(",").map(Number);
    if (!scheduleDays.includes(currentDay)) {
      return false;
    }

    // Check if current time is within the schedule's time range
    return currentTime >= schedule.startTime && currentTime <= schedule.endTime;
  };

  const chartData = readings.map((reading) => ({
    time: formatTime(reading.timestamp),
    timestamp: reading.timestamp,
    temperature: reading.temperature,
    humidity: reading.humidity,
    light: reading.light,
    presence: reading.presence,
    currentConsumption: reading.currentConsumption,
  }));

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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "فعال",
      inactive: "غیرفعال",
      maintenance: "در تعمیر",
    };
    return labels[status] || status;
  };

  const handleEditSave = () => {
    fetchDevice();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400"></div>
          <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            در حال بارگذاری اطلاعات...
          </div>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Critical Alarm Banner - Sticky */}
      {device?.alarmActive && (
        <div className="sticky top-0 z-50 animate-pulse bg-linear-to-r from-red-600 via-red-700 to-red-800 text-white shadow-2xl">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <IconAlertTriangle size={32} className="animate-bounce" />
              <div>
                <div className="text-xl font-bold">
                  ⚠️ دیوایس در وضعیت بحرانی قرار دارد!
                </div>
                <div className="text-sm opacity-90">
                  دیوایس {device.name} در وضعیت بحرانی قرار دارد
                  {device.alarmTriggeredAt && (
                    <span className="mr-2">
                      - زمان شروع:{" "}
                      {new Date(device.alarmTriggeredAt).toLocaleString(
                        "fa-IR",
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto space-y-8 p-6 md:p-8 lg:p-10">
        {/* Enhanced Header */}
        <div className="animate-in slide-in-from-top flex flex-col gap-6 border-none! shadow-none! duration-700 outline-none sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/")}
              className="group border-2 border-gray-300 bg-white/80 backdrop-blur-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/80 dark:hover:border-blue-600 dark:hover:bg-blue-950"
            >
              <IconArrowLeft
                size={20}
                className="ml-2 transition-transform group-hover:-translate-x-1"
              />
              بازگشت
            </Button>
            <div>
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-linear-to-br from-blue-100 via-indigo-100 to-purple-100 p-4 shadow-lg dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900">
                  <IconDeviceDesktop
                    size={40}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <h1 className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-4xl font-extrabold text-transparent drop-shadow-sm">
                    {device.name}
                  </h1>
                  <p className="mt-2 flex items-center gap-2 text-lg text-gray-600 dark:text-gray-300">
                    <IconMapPin size={18} />
                    {device.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={`${getStatusColor(device.status)} px-5 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-105`}
            >
              {getStatusLabel(device.status)}
            </Badge>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsEditDialogOpen(true)}
              className="group border-2 border-blue-200 bg-blue-50 text-blue-600 transition-all hover:border-blue-400 hover:bg-blue-100 hover:shadow-md dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400 dark:hover:border-blue-600 dark:hover:bg-blue-900"
            >
              <IconEdit
                size={20}
                className="ml-2 transition-transform group-hover:scale-110"
              />
              ویرایش دیوایس
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleDelete}
              className="group border-2 border-red-200 bg-red-50 text-red-600 transition-all hover:border-red-400 hover:bg-red-100 hover:shadow-md dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:border-red-600 dark:hover:bg-red-900"
            >
              <IconTrash
                size={20}
                className="ml-2 transition-transform group-hover:scale-110"
              />
              حذف دیوایس
            </Button>
          </div>
        </div>

        {/* Device Info Card */}
        <Card className="group animate-in fade-in slide-in-from-left relative overflow-hidden border-2 border-gray-200 bg-white/80 shadow-xl backdrop-blur-sm transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800/80">
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-blue-200 opacity-10 transition-transform group-hover:scale-150 dark:bg-blue-800"></div>
          <CardHeader className="relative z-10 border-b-2 border-gray-200 pb-4 dark:border-gray-700">
            <CardTitle className="flex items-center gap-3 text-2xl font-extrabold text-gray-800 dark:text-gray-100">
              <div className="rounded-xl bg-linear-to-br from-blue-100 to-indigo-100 p-2.5 shadow-md dark:from-blue-900 dark:to-indigo-900">
                <IconDeviceDesktop
                  size={24}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              اطلاعات دیوایس
            </CardTitle>
            <CardDescription className="mt-2 text-base text-gray-600 dark:text-gray-400">
              مشخصات و اطلاعات کامل دیوایس
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4 pt-6">
            <div className="space-y-4">
              <div className="group/item flex items-start gap-4 rounded-xl bg-linear-to-r from-blue-50 to-indigo-50 p-4 transition-all hover:shadow-md dark:from-blue-950 dark:to-indigo-950">
                <div className="rounded-xl bg-blue-100 p-2.5 shadow-sm transition-transform group-hover/item:rotate-12 dark:bg-blue-900">
                  <IconDeviceDesktop
                    size={22}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div className="flex-1">
                  <div className="mb-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    شناسه یکتا دستگاه
                  </div>
                  <div className="font-mono text-base font-bold text-gray-800 dark:text-gray-200">
                    {device.deviceId || "تعریف نشده"}
                  </div>
                </div>
              </div>

              <div className="group/item flex items-start gap-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 transition-all hover:shadow-md dark:from-green-950 dark:to-emerald-950">
                <div className="rounded-xl bg-green-100 p-2.5 shadow-sm transition-transform group-hover/item:rotate-12 dark:bg-green-900">
                  <IconMapPin
                    size={22}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>
                <div className="flex-1">
                  <div className="mb-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    موقعیت مکانی
                  </div>
                  <div className="text-base font-bold text-gray-800 dark:text-gray-200">
                    {device.location}
                  </div>
                  {device.classroom && (
                    <div className="mt-2 inline-block rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">
                      کلاس: {device.classroom}
                    </div>
                  )}
                </div>
              </div>

              {device.description && (
                <div className="group/item flex items-start gap-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-4 transition-all hover:shadow-md dark:from-purple-950 dark:to-pink-950">
                  <div className="flex-1">
                    <div className="mb-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400">
                      توضیحات
                    </div>
                    <div className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                      {device.description}
                    </div>
                  </div>
                </div>
              )}

              {device.lastSeen && (
                <div className="group/item flex items-start gap-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 transition-all hover:shadow-md dark:from-amber-950 dark:to-orange-950">
                  <div className="rounded-xl bg-amber-100 p-2.5 shadow-sm transition-transform group-hover/item:rotate-12 dark:bg-amber-900">
                    <IconClock
                      size={22}
                      className="text-amber-600 dark:text-amber-400"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400">
                      آخرین مشاهده
                    </div>
                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {new Date(device.lastSeen).toLocaleString("fa-IR")}
                    </div>
                  </div>
                </div>
              )}

              {/* Alarm History Section */}
              <div className="mt-6 rounded-xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-4 dark:border-red-800 dark:from-red-950 dark:to-pink-950">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-red-100 p-2 shadow-sm dark:bg-red-900">
                    <IconAlertTriangle
                      size={20}
                      className="text-red-600 dark:text-red-400"
                    />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      تاریخچه وضعیت‌های بحرانی
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {alarmHistory.length > 0
                        ? `${alarmHistory.length} رویداد ثبت شده`
                        : "هیچ رویداد بحرانی ثبت نشده"}
                    </div>
                  </div>
                </div>
                {alarmHistory.length > 0 ? (
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {alarmHistory.map((alarm) => (
                      <div
                        key={alarm.id}
                        className="rounded-lg border border-red-200 bg-white p-3 shadow-sm dark:border-red-800 dark:bg-gray-800"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                              زمان شروع:
                            </div>
                            <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                              {new Date(alarm.triggeredAt).toLocaleString(
                                "fa-IR",
                              )}
                            </div>
                            {alarm.resolvedAt && (
                              <>
                                <div className="mt-2 text-xs font-semibold text-green-600 dark:text-green-400">
                                  زمان رفع:
                                </div>
                                <div className="text-sm font-bold text-green-700 dark:text-green-300">
                                  {new Date(alarm.resolvedAt).toLocaleString(
                                    "fa-IR",
                                  )}
                                </div>
                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  مدت زمان:{" "}
                                  {Math.round(
                                    (new Date(alarm.resolvedAt).getTime() -
                                      new Date(alarm.triggeredAt).getTime()) /
                                      1000 /
                                      60,
                                  )}{" "}
                                  دقیقه
                                </div>
                              </>
                            )}
                            {!alarm.resolvedAt && (
                              <div className="mt-2 inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700 dark:bg-red-900 dark:text-red-300">
                                در حال انجام
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    هیچ رویداد بحرانی ثبت نشده است
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Summary Section */}
        <Card className="animate-in fade-in slide-in-from-bottom group relative overflow-hidden border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 shadow-xl transition-all duration-700 hover:shadow-2xl dark:border-indigo-800 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-300 opacity-20 transition-transform group-hover:scale-150 dark:bg-indigo-800"></div>
          <CardHeader className="relative z-10 border-b-2 border-indigo-200 pb-4 dark:border-indigo-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 p-2.5 shadow-md dark:from-indigo-900 dark:to-purple-900">
                  <IconTemperature
                    size={24}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <div>
                  <CardTitle className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">
                    خلاصه برنامه‌های حرارتی
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {schedules.length > 0
                      ? `${getCurrentMonthSchedules().length} برنامه فعال در ماه جاری`
                      : "هیچ برنامه‌ای تعریف نشده"}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/devices/${device.id}/schedule`)}
                className="group/btn border-2 border-indigo-300 bg-white/80 text-indigo-700 transition-all hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md dark:border-indigo-700 dark:bg-gray-800/80 dark:text-indigo-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-950"
              >
                <IconClock size={16} className="ml-2" />
                مدیریت برنامه‌ها
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pt-6">
            {schedules.length > 0 ? (
              <div>
                {/* Currently Active Schedule */}
                {(() => {
                  const currentMonthSchedules = getCurrentMonthSchedules();
                  const activeNow = currentMonthSchedules.find((s) =>
                    isScheduleActiveNow(s),
                  );

                  return activeNow ? (
                    <div className="mb-6 rounded-xl border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-lg dark:border-green-600 dark:from-green-950 dark:to-emerald-950">
                      <div className="mb-3 flex items-center gap-2">
                        <Badge className="animate-pulse bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 text-white shadow-md">
                          🔥 در حال اجرا
                        </Badge>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {getMonthLabel(activeNow.month)}
                        </span>
                        <div className="mr-auto flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-300">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                          فعال الان
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="rounded-lg bg-gradient-to-br from-white to-green-50 p-3 shadow-sm dark:from-gray-800 dark:to-green-950">
                          <div className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                            روزهای هفته
                          </div>
                          <div className="flex items-center gap-2">
                            <IconCalendar
                              size={20}
                              className="text-green-600 dark:text-green-400"
                            />
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                              {getWeekdaysLabel(activeNow.weekdays)}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-lg bg-gradient-to-br from-white to-red-50 p-3 shadow-sm dark:from-gray-800 dark:to-red-950">
                          <div className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                            دمای هدف
                          </div>
                          <div className="flex items-center gap-2">
                            <IconTemperature
                              size={20}
                              className="text-red-600 dark:text-red-400"
                            />
                            <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                              {activeNow.targetTemperature}°C
                            </span>
                          </div>
                        </div>
                        <div className="rounded-lg bg-gradient-to-br from-white to-blue-50 p-3 shadow-sm dark:from-gray-800 dark:to-blue-950">
                          <div className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                            زمان شروع
                          </div>
                          <div className="flex items-center gap-2">
                            <IconClock
                              size={20}
                              className="text-blue-600 dark:text-blue-400"
                            />
                            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
                              {activeNow.startTime}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-lg bg-gradient-to-br from-white to-purple-50 p-3 shadow-sm dark:from-gray-800 dark:to-purple-950">
                          <div className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                            زمان پایان
                          </div>
                          <div className="flex items-center gap-2">
                            <IconClock
                              size={20}
                              className="text-purple-600 dark:text-purple-400"
                            />
                            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
                              {activeNow.endTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 rounded-xl border-2 border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-950">
                      <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                        <IconClock size={20} />
                        <span className="font-semibold">
                          در حال حاضر هیچ برنامه‌ای در حال اجرا نیست
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* All Schedules for Current Month */}
                {(() => {
                  const currentMonthSchedules = getCurrentMonthSchedules();
                  return currentMonthSchedules.length > 0 ? (
                    <div className="space-y-3">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                          تمام برنامه‌های ماه جاری
                        </h4>
                        <Badge className="bg-indigo-500 text-white">
                          {currentMonthSchedules.length} برنامه
                        </Badge>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {currentMonthSchedules.map((schedule) => {
                          const isActive = isScheduleActiveNow(schedule);
                          return (
                            <div
                              key={schedule.id}
                              className={`rounded-lg border-2 p-3 shadow-sm transition-all hover:shadow-md ${
                                isActive
                                  ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-600 dark:from-green-950 dark:to-emerald-950"
                                  : "border-indigo-200 bg-white dark:border-indigo-800 dark:bg-gray-800"
                              }`}
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={`text-xs ${
                                      isActive
                                        ? "animate-pulse bg-green-500"
                                        : "bg-indigo-500"
                                    }`}
                                  >
                                    {getSeasonLabel(schedule.season)}
                                  </Badge>
                                  {isActive && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-300">
                                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                                      فعال
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                  {getMonthLabel(schedule.month)}
                                </span>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    روزها:
                                  </span>
                                  <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {getWeekdaysLabel(schedule.weekdays)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    دما:
                                  </span>
                                  <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {schedule.targetTemperature}°C
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    زمان:
                                  </span>
                                  <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {schedule.startTime} - {schedule.endTime}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        هیچ برنامه فعالی برای ماه جاری تعریف نشده است
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <IconTemperature
                    size={32}
                    className="text-gray-400 dark:text-gray-600"
                  />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-gray-200">
                  هیچ برنامه حرارتی تعریف نشده
                </h3>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  برای شروع، برنامه‌های گرمایش را برای ماه‌های مختلف سال تنظیم
                  کنید
                </p>
                <Button
                  onClick={() => router.push(`/devices/${device.id}/schedule`)}
                  className="bg-linear-to-r from-indigo-500 to-purple-500 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  <IconClock size={18} className="ml-2" />
                  ایجاد برنامه جدید
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sensor Charts Section */}
        <div className="animate-in fade-in slide-in-from-bottom space-y-6 duration-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
                نمودارهای سنسورها
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                نمایش داده‌های لحظه‌ای سنسورها در 24 ساعت گذشته
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-blue-100 px-4 py-2 dark:bg-blue-900">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                زنده
              </span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Temperature Chart */}
            <Card className="group relative overflow-hidden border-2 border-red-200 bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-2xl dark:border-red-800 dark:bg-gray-800/80">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-red-200 opacity-10 transition-transform group-hover:scale-150 dark:bg-red-800"></div>
              <CardHeader className="relative z-10 border-b-2 border-red-200 pb-4 dark:border-red-800">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                  <div className="rounded-xl bg-gradient-to-br from-red-100 to-orange-100 p-2.5 shadow-md dark:from-red-900 dark:to-orange-900">
                    <IconTemperature
                      size={24}
                      className="text-red-600 dark:text-red-400"
                    />
                  </div>
                  دمای محیط
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  بر حسب درجه سانتیگراد (°C)
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" style={{ fontSize: "12px" }} />
                    <YAxis style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "2px solid #ef4444",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ fill: "#ef4444", r: 4 }}
                      activeDot={{ r: 6 }}
                      name="دما (°C)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Humidity Chart */}
            <Card className="group relative overflow-hidden border-2 border-blue-200 bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-2xl dark:border-blue-800 dark:bg-gray-800/80">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-200 opacity-10 transition-transform group-hover:scale-150 dark:bg-blue-800"></div>
              <CardHeader className="relative z-10 border-b-2 border-blue-200 pb-4 dark:border-blue-800">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                  <div className="rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 p-2.5 shadow-md dark:from-blue-900 dark:to-cyan-900">
                    <IconDroplet
                      size={24}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  رطوبت نسبی
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  بر حسب درصد (%)
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" style={{ fontSize: "12px" }} />
                    <YAxis style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "2px solid #3b82f6",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", r: 4 }}
                      activeDot={{ r: 6 }}
                      name="رطوبت (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Light Chart */}
            <Card className="group relative overflow-hidden border-2 border-yellow-200 bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-2xl dark:border-yellow-800 dark:bg-gray-800/80">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-yellow-200 opacity-10 transition-transform group-hover:scale-150 dark:bg-yellow-800"></div>
              <CardHeader className="relative z-10 border-b-2 border-yellow-200 pb-4 dark:border-yellow-800">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                  <div className="rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 p-2.5 shadow-md dark:from-yellow-900 dark:to-amber-900">
                    <IconSun
                      size={24}
                      className="text-yellow-600 dark:text-yellow-400"
                    />
                  </div>
                  شدت نور
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  سنجش میزان روشنایی محیط
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" style={{ fontSize: "12px" }} />
                    <YAxis style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "2px solid #eab308",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="light"
                      stroke="#eab308"
                      strokeWidth={3}
                      dot={{ fill: "#eab308", r: 4 }}
                      activeDot={{ r: 6 }}
                      name="نور"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Presence Chart */}
            <Card className="group relative overflow-hidden border-2 border-green-200 bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-2xl dark:border-green-800 dark:bg-gray-800/80">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-green-200 opacity-10 transition-transform group-hover:scale-150 dark:bg-green-800"></div>
              <CardHeader className="relative z-10 border-b-2 border-green-200 pb-4 dark:border-green-800">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                  <div className="rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 p-2.5 shadow-md dark:from-green-900 dark:to-emerald-900">
                    <IconUser
                      size={24}
                      className="text-green-600 dark:text-green-400"
                    />
                  </div>
                  سنسور حضور
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  تشخیص حضور افراد در محیط
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" style={{ fontSize: "12px" }} />
                    <YAxis style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "2px solid #22c55e",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="presence"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ fill: "#22c55e", r: 4 }}
                      activeDot={{ r: 6 }}
                      name="حضور"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Current Consumption Chart - Full Width */}
          <Card className="group relative overflow-hidden border-2 border-purple-200 bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:scale-[1.01] hover:shadow-2xl dark:border-purple-800 dark:bg-gray-800/80">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-purple-200 opacity-10 transition-transform group-hover:scale-150 dark:bg-purple-800"></div>
            <CardHeader className="relative z-10 border-b-2 border-purple-200 pb-4 dark:border-purple-800">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800 dark:text-gray-100">
                <div className="rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 p-3 shadow-md dark:from-purple-900 dark:to-fuchsia-900">
                  <IconBolt
                    size={28}
                    className="text-purple-600 dark:text-purple-400"
                  />
                </div>
                مصرف جریان الکتریکی
              </CardTitle>
              <CardDescription className="mt-2 text-base text-gray-600 dark:text-gray-400">
                میزان جریان مصرفی بر حسب آمپر (A)
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" style={{ fontSize: "12px" }} />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "2px solid #a855f7",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="currentConsumption"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ fill: "#a855f7", r: 4 }}
                    activeDot={{ r: 7 }}
                    name="مصرف جریان (A)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Device Edit Dialog */}
      {device && (
        <DeviceEditDialog
          device={device}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}
