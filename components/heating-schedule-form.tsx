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
import {
  IconTrash,
  IconCheck,
  IconTemperature,
  IconCalendar,
} from "@tabler/icons-react";

interface HeatingSchedule {
  id: string;
  season: string;
  month: number;
  weekdays: string;
  startTime: string;
  endTime: string;
  targetTemperature: number;
  targetLuminance: number;
  enabled: boolean;
}

interface HeatingScheduleFormProps {
  systemId: string;
  onScheduleSaved?: () => void;
}

const SEASONS = [
  { value: "spring", label: "بهار" },
  { value: "summer", label: "تابستان" },
  { value: "fall", label: "پاییز" },
  { value: "winter", label: "زمستان" },
];

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

export function HeatingScheduleForm({
  systemId,
  onScheduleSaved,
}: HeatingScheduleFormProps) {
  const [schedules, setSchedules] = useState<HeatingSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [newSchedule, setNewSchedule] = useState({
    season: "spring",
    month: 1,
    weekdays: [0, 1, 2, 3, 4, 5, 6] as number[],
    startTime: "08:00",
    endTime: "18:00",
    targetTemperature: 22,
    targetLuminance: 50,
    enabled: true,
  });

  useEffect(() => {
    console.log("Schedule state updated:", newSchedule.weekdays);
  }, [newSchedule.weekdays]);

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

  const checkOverlap = () => {
    // Check if the new schedule overlaps with any existing schedules
    const overlapping = schedules.find((existing) => {
      // Skip if different month (unless one is null - meaning whole season)
      if (
        existing.month !== newSchedule.month &&
        existing.month !== null &&
        newSchedule.month !== null
      ) {
        return false;
      }

      // Skip if disabled
      if (!existing.enabled) {
        return false;
      }

      // Get days for both schedules
      const existingDays = existing.weekdays.split(",").map(Number);
      const newDays = newSchedule.weekdays;

      // Find common days between the two schedules
      const commonDays = existingDays.filter((day) => newDays.includes(day));

      // If no common days, no overlap possible
      if (commonDays.length === 0) {
        return false;
      }

      // Check if times overlap on these common days
      const existingStart = existing.startTime;
      const existingEnd = existing.endTime;
      const newStart = newSchedule.startTime;
      const newEnd = newSchedule.endTime;

      // Two time ranges overlap if:
      // (StartA < EndB) and (EndA > StartB)
      const timesOverlap = newStart < existingEnd && newEnd > existingStart;

      // Only flag as overlap if both days AND times overlap
      return timesOverlap;
    });

    return overlapping;
  };

  const handleSave = async () => {
    if (!newSchedule.season) {
      setError("لطفا فصل را انتخاب کنید");
      return;
    }

    if (newSchedule.weekdays.length === 0) {
      setError("لطفا حداقل یک روز را انتخاب کنید");
      return;
    }

    if (!newSchedule.startTime || !newSchedule.endTime) {
      setError("لطفا زمان شروع و پایان را مشخص کنید");
      return;
    }

    if (newSchedule.startTime >= newSchedule.endTime) {
      setError("زمان شروع باید قبل از زمان پایان باشد");
      return;
    }

    // Check for overlapping schedules
    const overlappingSchedule = checkOverlap();
    if (overlappingSchedule) {
      const existingDays = overlappingSchedule.weekdays.split(",").map(Number);
      const newDays = newSchedule.weekdays;
      const commonDays = existingDays.filter((day) => newDays.includes(day));

      const WEEKDAYS_MAP: Record<number, string> = {
        0: "یکشنبه",
        1: "دوشنبه",
        2: "سه‌شنبه",
        3: "چهارشنبه",
        4: "پنج‌شنبه",
        5: "جمعه",
        6: "شنبه",
      };

      const dayNames = commonDays.map((d) => WEEKDAYS_MAP[d]).join("، ");

      setError(
        `تداخل زمانی در روزهای ${dayNames}: برنامه موجود ${overlappingSchedule.startTime}-${overlappingSchedule.endTime}`,
      );
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/systems/${systemId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSchedule,
          weekdays: newSchedule.weekdays.join(","),
        }),
      });

      if (!response.ok) throw new Error("Failed to save schedule");

      setNewSchedule({
        season: "spring",
        weekdays: [0, 1, 2, 3, 4, 5, 6],
        month: 1,
        startTime: "08:00",
        endTime: "18:00",
        targetTemperature: 22,
        targetLuminance: 50,
        enabled: true,
      });
      await fetchSchedules();
      if (onScheduleSaved) {
        onScheduleSaved();
      }
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

  const getWeekdaysLabel = (weekdaysStr: string) => {
    // Handle undefined or null weekdays (for old data)
    if (!weekdaysStr) return "تمام روزهای هفته";

    const days = weekdaysStr.split(",").map(Number);
    if (days.length === 7) return "تمام روزهای هفته";
    return WEEKDAYS.filter((w) => days.includes(w.value))
      .map((w) => w.abbr)
      .join("، ");
  };

  const toggleWeekday = (day: number) => {
    console.log(
      "Toggling day:",
      day,
      "Current weekdays:",
      newSchedule.weekdays,
    );
    setNewSchedule((prev) => {
      const weekdays = prev.weekdays.includes(day)
        ? prev.weekdays.filter((d) => d !== day)
        : [...prev.weekdays, day].sort();
      console.log("New weekdays:", weekdays);
      return { ...prev, weekdays };
    });
  };

  if (isLoading) {
    return <div className="py-8 text-center">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-200 pb-4 dark:border-gray-700">
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
            افزودن برنامه گرمایش جدید
          </CardTitle>
          <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
            برنامه‌ریزی گرمایش بر اساس فصل و ماه سال
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="season">فصل *</Label>
              <Select
                value={newSchedule.season}
                onValueChange={(value) => {
                  const firstMonthOfSeason =
                    MONTHS.find((m) => m.season === value)?.value || 1;
                  setNewSchedule({
                    ...newSchedule,
                    season: value || "",
                    month: firstMonthOfSeason,
                  });
                }}
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
              <Label htmlFor="month">ماه *</Label>
              <Select
                value={newSchedule.month.toString()}
                onValueChange={(value) => {
                  if (value) {
                    setNewSchedule({
                      ...newSchedule,
                      month: parseInt(value),
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.filter(
                    (month) => month.season === newSchedule.season,
                  ).map((month) => (
                    <SelectItem
                      key={month.value}
                      value={month.value.toString()}
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">زمان شروع *</Label>
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
              <Label htmlFor="endTime">زمان پایان *</Label>
              <Input
                id="endTime"
                type="time"
                value={newSchedule.endTime}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, endTime: e.target.value })
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

            <div className="space-y-2">
              <Label htmlFor="targetLuminance">
                سطح روشنایی مطلوب (0-100%) *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="targetLuminance"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={newSchedule.targetLuminance}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      targetLuminance: parseInt(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <div className="w-16 rounded-lg bg-gray-100 px-3 py-2 text-center font-bold text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                  {newSchedule.targetLuminance}%
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>روزهای هفته *</Label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const isSelected = newSchedule.weekdays.includes(day.value);
                return (
                  <Button
                    key={day.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWeekday(day.value)}
                    className={`min-w-[70px] transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-500 text-white hover:bg-blue-600 dark:border-blue-600 dark:bg-blue-600"
                        : "border-gray-300 hover:border-blue-400 dark:border-gray-600"
                    }`}
                  >
                    <IconCalendar size={16} className="ml-1" />
                    {day.label}
                  </Button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              انتخاب شده:{" "}
              {newSchedule.weekdays.length === 7
                ? "تمام روزها"
                : newSchedule.weekdays.length === 0
                  ? "هیچ روزی"
                  : `${newSchedule.weekdays.length} روز`}
            </p>
          </div>

          {error && (
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 py-6 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
          >
            {isSaving ? "در حال ذخیره..." : "ذخیره برنامه"}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">
          برنامه‌های تنظیم شده
        </h3>
        {schedules.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <IconTemperature size={32} className="text-gray-400" />
              </div>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                هنوز برنامه‌ای تنظیم نشده است
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {schedules.map((schedule) => (
              <Card
                key={schedule.id}
                className="border-2 border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
              >
                <CardHeader className="border-b border-gray-200 pb-4 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {getSeasonLabel(schedule.season)}
                      </CardTitle>
                      <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                        {schedule.month
                          ? `ماه: ${getMonthLabel(schedule.month)}`
                          : "کل فصل"}
                      </CardDescription>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Badge
                        className={`${
                          schedule.enabled ? "bg-green-500" : "bg-gray-500"
                        } px-3 py-1 text-xs font-semibold text-white`}
                      >
                        {schedule.enabled ? "فعال" : "غیرفعال"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(schedule.id)}
                        className="border-red-200 text-red-600 transition-all hover:border-red-400 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:border-red-600 dark:hover:bg-red-950"
                      >
                        <IconTrash size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-950">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      روزهای هفته:
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {getWeekdaysLabel(schedule.weekdays)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      بازه زمانی:
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {schedule.startTime} - {schedule.endTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      دمای مطلوب:
                    </span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {schedule.targetTemperature}°C
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      سطح روشنایی:
                    </span>
                    <span className="font-bold text-yellow-600 dark:text-yellow-400">
                      {schedule.targetLuminance}%
                    </span>
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
