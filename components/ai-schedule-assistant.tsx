"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  IconSparkles,
  IconRobot,
  IconCalendar,
  IconTemperature,
  IconSun,
  IconLoader2,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { Schedule } from "@/lib/types";

interface AIScheduleAssistantProps {
  systemId: string;
  classroom?: string;
  location?: string;
  existingSchedules?: Schedule[];
  onSchedulesGenerated: (schedules: Schedule[]) => void;
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

const SEASON_LABELS: Record<string, string> = {
  spring: "بهار",
  summer: "تابستان",
  fall: "پاییز",
  winter: "زمستان",
};

export function AIScheduleAssistant({
  systemId,
  classroom,
  location,
  existingSchedules,
  onSchedulesGenerated,
}: AIScheduleAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [duration, setDuration] = useState<string>("month");
  const [preferences, setPreferences] = useState("");
  const [generatedSchedules, setGeneratedSchedules] = useState<Schedule[]>([]);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Check if AI features are enabled
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const response = await fetch("/api/ai-assistant/status");
        const data = await response.json();
        setIsAIEnabled(data.enabled);
      } catch (err) {
        console.error("Failed to check AI status:", err);
        setIsAIEnabled(false);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkAIStatus();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    setGeneratedSchedules([]);

    try {
      const response = await fetch("/api/ai-assistant/schedule-planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemId,
          classroom,
          location,
          duration,
          preferences,
          existingSchedules,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate schedules");
      }

      const data = await response.json();
      setGeneratedSchedules(data.schedules);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در تولید برنامه");
      console.error("Error generating schedules:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySchedules = () => {
    onSchedulesGenerated(generatedSchedules);
    setShowPreview(false);
    setIsOpen(false);
    setGeneratedSchedules([]);
    setPreferences("");
  };

  const getMonthLabel = (month: number | null) => {
    if (!month) return "کل فصل";
    return MONTHS.find((m) => m.value === month)?.label || `ماه ${month}`;
  };

  const getWeekdaysLabel = (weekdays: string) => {
    const days = weekdays.split(",").map(Number);
    if (days.length === 7) return "همه روزها";
    if (days.length === 5 && !days.includes(5) && !days.includes(6))
      return "روزهای کاری";
    if (days.length === 2 && days.includes(5) && days.includes(6))
      return "آخر هفته";
    return `${days.length} روز`;
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2"
        variant="outline"
        disabled={!isAIEnabled || isCheckingStatus}
        title={
          !isAIEnabled
            ? "دستیار هوشمند غیرفعال است. لطفا OLLAMA_HOST را در فایل .env تنظیم کنید."
            : "استفاده از دستیار هوشمند برای ایجاد برنامه"
        }
      >
        <IconSparkles className="h-4 w-4" />
        دستیار هوشمند برنامه‌ریزی
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent
          className="max-h-[90vh] max-w-4xl overflow-y-auto"
          dir="rtl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <IconRobot className="text-primary h-6 w-6" />
              دستیار هوشمند برنامه‌ریزی دما و نور
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right" dir="rtl">
              از هوش مصنوعی برای ایجاد برنامه بهینه دما و نور کلاس درس خود
              استفاده کنید
            </AlertDialogDescription>
          </AlertDialogHeader>

          {!showPreview ? (
            <div className="space-y-6 py-4">
              {/* Duration Selection */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <IconCalendar className="h-4 w-4" />
                  بازه زمانی برنامه
                </Label>
                <Select
                  value={duration}
                  onValueChange={(value) => value && setDuration(value)}
                >
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="انتخاب بازه زمانی" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">یک ماه</SelectItem>
                    <SelectItem value="season">یک فصل</SelectItem>
                    <SelectItem value="year">یک سال کامل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preferences */}
              <div className="space-y-2">
                <Label htmlFor="preferences">ترجیحات و توضیحات (اختیاری)</Label>
                <Textarea
                  id="preferences"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="مثال: دانش‌آموزان حساسیت به سرما دارند، لطفا دمای بالاتری تنظیم کنید. یا: در روزهای پنجشنبه کلاس‌ها زودتر تمام می‌شود."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Info Card */}
              <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
                <CardContent>
                  <div className="flex gap-3">
                    <IconSparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <div className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
                      <p className="font-medium">
                        دستیار هوشمند چه کاری انجام می‌دهد؟
                      </p>
                      <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                        <li>
                          • برنامه‌های دما و نور بهینه برای صرفه‌جویی در انرژی
                        </li>
                        <li>• تنظیمات مناسب برای فصول مختلف سال</li>
                        <li>• برنامه‌های متفاوت برای روزهای کاری و تعطیل</li>
                        <li>• در نظر گرفتن ترجیحات شما</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Message */}
              {error && (
                <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
                  <CardContent>
                    <div className="flex gap-3">
                      <IconX className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                      <div className="text-sm text-red-900 dark:text-red-100">
                        {error}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <AlertDialogCancel disabled={isGenerating}>
                  انصراف
                </AlertDialogCancel>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      در حال تولید...
                    </>
                  ) : (
                    <>
                      <IconSparkles className="h-4 w-4" />
                      تولید برنامه با هوش مصنوعی
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Generated Schedules Preview */}
              <div className="space-y-2">
                <Label className="text-lg font-semibold">
                  برنامه‌های پیشنهادی ({generatedSchedules.length} برنامه)
                </Label>
                <div className="max-h-96 space-y-3 overflow-y-auto pr-2">
                  {generatedSchedules.map((schedule, index) => (
                    <Card
                      key={index}
                      className="hover:bg-accent/50 transition-colors"
                    >
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                          <div>
                            <div className="text-muted-foreground mb-1 text-xs">
                              فصل و ماه
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {SEASON_LABELS[schedule.season]}
                              </Badge>
                              <span className="text-sm">
                                {getMonthLabel(schedule.month)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1 text-xs">
                              روزها
                            </div>
                            <div className="text-sm font-medium">
                              {getWeekdaysLabel(schedule.weekdays)}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
                              <IconTemperature className="h-3 w-3" />
                              دما
                            </div>
                            <div className="text-sm font-medium">
                              {schedule.targetTemperature}°C
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
                              <IconSun className="h-3 w-3" />
                              نور
                            </div>
                            <div className="text-sm font-medium">
                              {schedule.targetLuminance}%
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-muted-foreground mb-1 text-xs">
                              ساعات
                            </div>
                            <div className="text-sm font-medium">
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPreview(false);
                    setGeneratedSchedules([]);
                  }}
                >
                  بازگشت
                </Button>
                <Button onClick={handleApplySchedules} className="gap-2">
                  <IconCheck className="h-4 w-4" />
                  اعمال برنامه‌ها
                </Button>
              </div>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
