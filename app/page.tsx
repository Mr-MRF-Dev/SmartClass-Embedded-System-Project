"use client";

import { useEffect, useState } from "react";
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
import { SensorForm } from "@/components/sensor-form";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  IconTemperature,
  IconDroplet,
  IconSun,
  IconActivity,
  IconPlus,
  IconDevices,
  IconServer,
  IconBolt,
} from "@tabler/icons-react";

interface EmbeddedSystem {
  id: string;
  name: string;
  location: string;
  classroom?: string;
  description?: string;
  status: string;
  lastSeen?: string;
  createdAt: string;
  sensors: Sensor[];
  _count?: { sensors: number };
}

interface Sensor {
  id: string;
  name: string;
  type: string;
  unit?: string;
  currentValue?: number;
  status: string;
  embeddedSystemId: string;
  embeddedSystem?: { name: string };
  updatedAt: string;
}

export default function Dashboard() {
  const [systems, setSystems] = useState<EmbeddedSystem[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSystemForm, setShowSystemForm] = useState(false);
  const [showSensorForm, setShowSensorForm] = useState(false);

  const fetchData = async () => {
    try {
      const [systemsRes, sensorsRes] = await Promise.all([
        fetch("/api/systems"),
        fetch("/api/sensors"),
      ]);

      if (systemsRes.ok) setSystems(await systemsRes.json());
      if (sensorsRes.ok) setSensors(await sensorsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSensorIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      temperature: <IconTemperature size={20} />,
      humidity: <IconDroplet size={20} />,
      light: <IconSun size={20} />,
      power: <IconBolt size={20} />,
    };
    return icons[type] || <IconActivity size={20} />;
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
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">SmartClass Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and manage embedded systems
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowSystemForm(true)}>
              <IconPlus size={16} className="mr-2" />
              Add System
            </Button>
            <Button onClick={() => setShowSensorForm(true)} variant="outline">
              <IconPlus size={16} className="mr-2" />
              Add Sensor
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Systems
              </CardTitle>
              <IconServer size={20} className="text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systems.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sensors
              </CardTitle>
              <IconDevices size={20} className="text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sensors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Online Sensors
              </CardTitle>
              <IconActivity size={20} className="text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sensors.filter((d) => d.status === "online").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold">Embedded Systems</h2>
          {systems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  No systems found. Add your first system!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {systems.map((system) => (
                <Card key={system.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{system.name}</CardTitle>
                        <CardDescription>{system.location}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(system.status)}>
                        {system.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                      {system.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {system.sensors?.length || 0} sensor(s)
                      </span>
                      {system.lastSeen && (
                        <span className="text-xs text-gray-500">
                          {new Date(system.lastSeen).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold">Sensors</h2>
          {sensors.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  No sensors found. Add your first sensor!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {sensors.map((sensor) => (
                <Card key={sensor.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getSensorIcon(sensor.type)}
                        <div>
                          <CardTitle className="text-base">
                            {sensor.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {sensor.embeddedSystem?.name}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        className={getStatusColor(sensor.status)}
                        variant="outline"
                      >
                        {sensor.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {sensor.currentValue !== null &&
                      sensor.currentValue !== undefined
                        ? `${sensor.currentValue} ${sensor.unit || ""}`
                        : "N/A"}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {sensor.updatedAt
                        ? `Updated: ${new Date(
                            sensor.updatedAt,
                          ).toLocaleString()}`
                        : "No readings yet"}
                    </p>
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
            <AlertDialogTitle>Add New Embedded System</AlertDialogTitle>
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

      <AlertDialog open={showSensorForm} onOpenChange={setShowSensorForm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Sensor</AlertDialogTitle>
          </AlertDialogHeader>
          <SensorForm
            systems={systems}
            onSuccess={() => {
              setShowSensorForm(false);
              fetchData();
            }}
            onCancel={() => setShowSensorForm(false)}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
