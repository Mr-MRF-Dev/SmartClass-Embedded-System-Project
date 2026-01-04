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
  IconDroplet,
  IconSun,
  IconUser,
  IconBolt,
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

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [device, setDevice] = useState<EmbeddedSystem | null>(null);
  const [readings, setReadings] = useState<DeviceReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchDevice();
      fetchReadings();
      // Refresh readings every 30 seconds
      const interval = setInterval(() => {
        fetchReadings();
      }, 30000);
      return () => clearInterval(interval);
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto space-y-8 p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <IconArrowLeft size={18} className="ml-2" />
              بازگشت
            </Button>
            <div>
              <h1 className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
                <div className="rounded-full bg-gradient-to-r from-blue-100 to-purple-100 p-3 dark:from-blue-900 dark:to-purple-900">
                  <IconDeviceDesktop
                    size={32}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                {device.name}
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                مدیریت و برنامه‌ریزی گرمایش
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={`${getStatusColor(device.status)} px-4 py-2 text-sm font-semibold text-white`}
            >
              {device.status === "active"
                ? "فعال"
                : device.status === "inactive"
                  ? "غیرفعال"
                  : device.status === "maintenance"
                    ? "تعمیر"
                    : device.status}
            </Badge>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="flex items-center gap-2 border-red-200 text-red-600 transition-all hover:border-red-400 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:border-red-600 dark:hover:bg-red-950"
            >
              <IconTrash size={18} className="ml-2" />
              حذف دیوایس
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2 border-gray-200 bg-white shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 pb-4 dark:border-gray-700">
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                اطلاعات دیوایس
              </CardTitle>
              <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                مشخصات و اطلاعات کلی دیوایس
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                    <IconDeviceDesktop
                      size={20}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                      شناسه یکتا
                    </div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                      {device.deviceId || "تعریف نشده"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                    <IconMapPin
                      size={20}
                      className="text-green-600 dark:text-green-400"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                      موقعیت
                    </div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                      {device.location}
                    </div>
                    {device.classroom && (
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        کلاس: {device.classroom}
                      </div>
                    )}
                  </div>
                </div>

                {device.description && (
                  <div className="flex items-start gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                    <div className="flex-1">
                      <div className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                        توضیحات
                      </div>
                      <div className="text-sm text-gray-800 dark:text-gray-200">
                        {device.description}
                      </div>
                    </div>
                  </div>
                )}

                {device.lastSeen && (
                  <div className="flex items-start gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                    <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                      <IconClock
                        size={20}
                        className="text-purple-600 dark:text-purple-400"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                        آخرین مشاهده
                      </div>
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {new Date(device.lastSeen).toLocaleString("fa-IR")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg transition-shadow hover:shadow-xl dark:border-blue-800 dark:from-blue-950 dark:to-purple-950">
            <CardHeader className="border-b border-blue-200 pb-4 dark:border-blue-800">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <IconTemperature
                    size={24}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                برنامه‌ریزی گرمایش
              </CardTitle>
              <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                تنظیم زمان شروع و دمای مطلوب بر اساس فصل و ماه
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <HeatingScheduleForm systemId={device.id} />
            </CardContent>
          </Card>
        </div>

        {/* Sensor Charts Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            نمودارهای سنسورها
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Temperature Chart */}
            <Card className="border-2 border-red-200 bg-white shadow-lg dark:border-red-800 dark:bg-gray-800">
              <CardHeader className="border-b border-red-200 pb-4 dark:border-red-800">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                  <div className="rounded-full bg-red-100 p-2 dark:bg-red-900">
                    <IconTemperature
                      size={24}
                      className="text-red-600 dark:text-red-400"
                    />
                  </div>
                  دما (°C)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                      name="دما (°C)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Humidity Chart */}
            <Card className="border-2 border-blue-200 bg-white shadow-lg dark:border-blue-800 dark:bg-gray-800">
              <CardHeader className="border-b border-blue-200 pb-4 dark:border-blue-800">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                    <IconDroplet
                      size={24}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  رطوبت (%)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name="رطوبت (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Light Chart */}
            <Card className="border-2 border-yellow-200 bg-white shadow-lg dark:border-yellow-800 dark:bg-gray-800">
              <CardHeader className="border-b border-yellow-200 pb-4 dark:border-yellow-800">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                  <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900">
                    <IconSun
                      size={24}
                      className="text-yellow-600 dark:text-yellow-400"
                    />
                  </div>
                  نور
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="light"
                      stroke="#eab308"
                      strokeWidth={2}
                      dot={false}
                      name="نور"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Presence Chart */}
            <Card className="border-2 border-green-200 bg-white shadow-lg dark:border-green-800 dark:bg-gray-800">
              <CardHeader className="border-b border-green-200 pb-4 dark:border-green-800">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                  <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                    <IconUser
                      size={24}
                      className="text-green-600 dark:text-green-400"
                    />
                  </div>
                  حضور
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="presence"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                      name="حضور"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Current Consumption Chart - Full Width */}
          <Card className="border-2 border-purple-200 bg-white shadow-lg dark:border-purple-800 dark:bg-gray-800">
            <CardHeader className="border-b border-purple-200 pb-4 dark:border-purple-800">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                  <IconBolt
                    size={24}
                    className="text-purple-600 dark:text-purple-400"
                  />
                </div>
                مصرف جریان (A)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="currentConsumption"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                    name="مصرف جریان (A)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
