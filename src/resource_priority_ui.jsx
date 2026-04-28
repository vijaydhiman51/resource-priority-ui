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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Resource Priority Generator</h1>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">
              {editIndex !== null ? "Edit Resource" : "Add Resource"}
            </h2>

            <div className="grid md:grid-cols-4 gap-4">
              <Input
                placeholder="Resource ID"
                value={resource.Id}
                onChange={(e) => handleInput("Id", e.target.value)}
              />

              <Input
                placeholder="Resource Name"
                value={resource.Name}
                onChange={(e) => handleInput("Name", e.target.value)}
              />

              <Input
                placeholder="Program"
                value={resource.Program}
                onChange={(e) => handleInput("Program", e.target.value)}
              />

              <Input
                placeholder="Season Hours"
                value={resource.SeasonHours}
                onChange={(e) => handleInput("SeasonHours", e.target.value)}
              />
            </div>

            <div>
              <p className="font-medium mb-3">Available Days</p>
              <div className="grid md:grid-cols-4 gap-3">
                {DAYS.filter((d) => d !== "Holiday").map((day) => (
                  <label
                    key={day}
                    className="flex items-center gap-2 border rounded-xl p-3"
                  >
                    <Checkbox
                      checked={resource.AvailableDays.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3">
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
                {editIndex !== null ? "Update Resource" : "Add Resource"}
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

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Resources Added</h2>
              <Button onClick={generateGrid} className="rounded-xl">
                Generate Priority Grid
              </Button>
            </div>

            <div className="space-y-2">
              {resources.map((r, index) => (
                <div
                  key={index}
                  className="border rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{r.Name}</p>
                    <p className="text-sm text-muted-foreground">
                      Program: {r.Program} | Hours: {r.SeasonHours}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => editResource(index)}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      className="rounded-xl"
                      onClick={() => deleteResource(index)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {grid.length > 0 && (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Final Priority Grid
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border p-3 text-left">Row</th>
                      {DAYS.map((day) => (
                        <th key={day} className="border p-3 text-left">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grid.map((row, index) => (
                      <tr key={index}>
                        <td className="border p-3">{index + 1}</td>
                        {DAYS.map((day) => (
                          <td key={day} className="border p-3">
                            {row[day] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ResourcePriorityUI;
