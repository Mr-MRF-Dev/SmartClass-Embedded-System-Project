"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTrash, IconCheck } from "@tabler/icons-react";

interface HeatingSchedule {
  id: string;
  season: string;
  month: number | null;
  startTime: string;
  targetTemperature: number;
  enabled: boolean;
}

interface HeatingScheduleFormProps {
  systemId: string;
}

const SEASONS = [
  { value: "spring", label: "بهار" },
  { value: "summer", label: "تابستان" },
  { value: "fall", label: "پاییز" },
  { value: "winter", label: "زمستان" },
];

const MONTHS = [
  { value: null, label: "کل فصل" },
  { value: 1, label: "فروردین" },
  { value: 2, label: "اردیبهشت" },
  { value: 3, label: "خرداد" },
  { value: 4, label: "تیر" },
  { value: 5, label: "مرداد" },
  { value: 6, label: "شهریور" },
  { value: 7, label: "مهر" },
  { value: 8, label: "آبان" },
  { value: 9, label: "آذر" },
  { value: 10, label: "دی" },
  { value: 11, label: "بهمن" },
  { value: 12, label: "اسفند" },
];

export function HeatingScheduleForm({ systemId }: HeatingScheduleFormProps) {
  const [schedules, setSchedules] = useState<HeatingSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [newSchedule, setNewSchedule] = useState({
    season: "",
    month: null as number | null,
    startTime: "08:00",
    targetTemperature: 22,
    enabled: true,
  });

  useEffect(() => {
    fetchSchedules();
  }, [systemId]);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`/api/systems/${systemId}/schedule`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newSchedule.season) {
      setError("لطفا فصل را انتخاب کنید");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/systems/${systemId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchedule),
      });

      if (!response.ok) throw new Error("Failed to save schedule");

      setNewSchedule({
        season: "",
        month: null,
        startTime: "08:00",
        targetTemperature: 22,
        enabled: true,
      });
      await fetchSchedules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این برنامه را حذف کنید؟")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/systems/${systemId}/schedule?scheduleId=${scheduleId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) throw new Error("Failed to delete schedule");

      await fetchSchedules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در حذف");
    }
  };

  const getSeasonLabel = (season: string) => {
    return SEASONS.find((s) => s.value === season)?.label || season;
  };

  const getMonthLabel = (month: number | null) => {
    return MONTHS.find((m) => m.value === month)?.label || "نامشخص";
  };

  if (isLoading) {
    return <div className="py-8 text-center">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>افزودن برنامه گرمایش جدید</CardTitle>
          <CardDescription>
            برنامه‌ریزی گرمایش بر اساس فصل و ماه سال
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="season">فصل *</Label>
              <Select
                value={newSchedule.season}
                onValueChange={(value) =>
                  setNewSchedule({ ...newSchedule, season: value || "" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEASONS.map((season) => (
                    <SelectItem key={season.value} value={season.value}>
                      {season.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">ماه (اختیاری)</Label>
              <Select
                value={newSchedule.month?.toString() || ""}
                onValueChange={(value) =>
                  setNewSchedule({
                    ...newSchedule,
                    month: value ? parseInt(value) : null,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem
                      key={month.value || "all"}
                      value={month.value?.toString() || ""}
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">زمان شروع گرمایش *</Label>
              <Input
                id="startTime"
                type="time"
                value={newSchedule.startTime}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, startTime: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetTemperature">
                دمای مطلوب (درجه سانتی‌گراد) *
              </Label>
              <Input
                id="targetTemperature"
                type="number"
                min="10"
                max="35"
                step="0.5"
                value={newSchedule.targetTemperature}
                onChange={(e) =>
                  setNewSchedule({
                    ...newSchedule,
                    targetTemperature: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {error && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20">
              {error}
            </div>
          )}

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "در حال ذخیره..." : "ذخیره برنامه"}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-4 text-xl font-bold">برنامه‌های تنظیم شده</h3>
        {schedules.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              هنوز برنامه‌ای تنظیم نشده است
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {getSeasonLabel(schedule.season)}
                      </CardTitle>
                      <CardDescription>
                        {schedule.month
                          ? `ماه: ${getMonthLabel(schedule.month)}`
                          : "کل فصل"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        className={
                          schedule.enabled ? "bg-green-500" : "bg-gray-500"
                        }
                      >
                        {schedule.enabled ? "فعال" : "غیرفعال"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(schedule.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <IconTrash size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        زمان شروع:
                      </span>
                      <span className="font-medium">{schedule.startTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        دمای مطلوب:
                      </span>
                      <span className="font-medium">
                        {schedule.targetTemperature}°C
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
