import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import ResourcePriorityGenerator from "./ResourcePriorityGenerator";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Holiday",
];

const DAY_SHORT = {
  Sunday: "Sun",
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Holiday: "Hol",
};

function ResourcePriorityUI() {
  const emptyResource = {
    Id: "",
    Name: "",
    Program: "",
    SeasonHours: "",
    HolidayAvailable: false,
    AvailableDays: [],
  };

  const [resource, setResource] = useState(emptyResource);
  const [resources, setResources] = useState([]);
  const [grid, setGrid] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const handleInput = (field, value) => {
    setResource((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDayToggle = (day) => {
    setResource((prev) => {
      const exists = prev.AvailableDays.includes(day);

      return {
        ...prev,
        AvailableDays: exists
          ? prev.AvailableDays.filter((d) => d !== day)
          : [...prev.AvailableDays, day],
      };
    });
  };

  const saveResource = () => {
    if (!resource.Name || !resource.Id) return;

    const formattedResource = {
      ...resource,
      Id: Number(resource.Id),
      SeasonHours: Number(resource.SeasonHours || 0),
    };

    if (editIndex !== null) {
      setResources((prev) =>
        prev.map((item, index) =>
          index === editIndex ? formattedResource : item
        )
      );
      setEditIndex(null);
    } else {
      setResources((prev) => [...prev, formattedResource]);
    }

    setResource(emptyResource);
  };

  const editResource = (index) => {
    const selected = resources[index];

    setResource({
      ...selected,
      Id: String(selected.Id),
      SeasonHours: String(selected.SeasonHours),
    });

    setEditIndex(index);
  };

  const deleteResource = (index) => {
    setResources((prev) => prev.filter((_, i) => i !== index));

    if (editIndex === index) {
      setResource(emptyResource);
      setEditIndex(null);
    }
  };

  const cancelEdit = () => {
    setResource(emptyResource);
    setEditIndex(null);
  };

  const generateGrid = () => {
    const app = new ResourcePriorityGenerator();
    const result = app.buildGrid(resources);
    setGrid(result);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-5">
        <h1 className="text-2xl font-bold">Resource Priority Generator</h1>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-4">
            <h2 className="text-lg font-semibold">
              {editIndex !== null ? "Edit Resource" : "Add Resource"}
            </h2>

            <div className="grid md:grid-cols-4 gap-3">
              <Input
                placeholder="ID"
                value={resource.Id}
                onChange={(e) => handleInput("Id", e.target.value)}
              />

              <Input
                placeholder="Name"
                value={resource.Name}
                onChange={(e) => handleInput("Name", e.target.value)}
              />

              <Input
                placeholder="Program"
                value={resource.Program}
                onChange={(e) => handleInput("Program", e.target.value)}
              />

              <Input
                placeholder="Hours"
                value={resource.SeasonHours}
                onChange={(e) => handleInput("SeasonHours", e.target.value)}
              />
            </div>

            <div>
              <p className="font-medium mb-2 text-sm">Available Days</p>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {DAYS.filter((d) => d !== "Holiday").map((day) => (
                  <label
                    key={day}
                    className="flex items-center justify-center gap-2 border rounded-lg px-2 py-2 text-sm"
                  >
                    <Checkbox
                      checked={resource.AvailableDays.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <span>{DAY_SHORT[day]}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={resource.HolidayAvailable}
                onCheckedChange={(value) =>
                  handleInput("HolidayAvailable", !!value)
                }
              />
              <span>Holiday Available</span>
            </label>

            <div className="flex gap-3">
              <Button onClick={saveResource} className="rounded-xl">
                {editIndex !== null ? "Update" : "Add"}
              </Button>

              {editIndex !== null && (
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {(resources.length > 0 || grid.length > 0) && (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Priority Layout</h2>
                <Button onClick={generateGrid} className="rounded-xl">
                  Generate Grid
                </Button>
              </div>

              <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
                <div className="space-y-3">
                  {resources.map((r, index) => (
                    <div
                      key={index}
                      className="border rounded-xl p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{r.Name}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.SeasonHours} h
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editResource(index)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteResource(index)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 text-xs">
                        {DAYS.filter((d) => d !== "Holiday").map((day) => (
                          <span
                            key={day}
                            className={`px-2 py-1 rounded border ${
                              r.AvailableDays.includes(day)
                                ? "bg-muted"
                                : "opacity-40"
                            }`}
                          >
                            {DAY_SHORT[day]}
                          </span>
                        ))}
                        {r.HolidayAvailable && (
                          <span className="px-2 py-1 rounded border bg-muted">
                            Hol
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {grid.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr>
                          {DAYS.map((day) => (
                            <th key={day} className="border p-2 text-left">
                              {DAY_SHORT[day]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {grid.map((row, index) => (
                          <tr key={index}>
                            {DAYS.map((day) => (
                              <td key={day} className="border p-2">
                                {row[day] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ResourcePriorityUI;
