import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Pencil, Trash2 } from "lucide-react";
import ResourcePriorityGenerator from "./ResourcePriorityGenerator";
import initialResources from "./data.json";

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

function generateColorFromIndex(index) {
  const hue = (index * 137.508) % 360;
  return `hsl(${Math.round(hue)}, 45%, 90%)`;
}

const resourcesWithColors = initialResources
  .map((item, index) => ({
    ...item,
    Color: generateColorFromIndex(index),
    ToggleAllowedDays: [...item.AvailableDays],
  }))
  .sort((a, b) => a.SeasonHours - b.SeasonHours);

function ResourcePriorityUI() {
  const emptyResource = {
    Id: "",
    Name: "",
    Program: "",
    SeasonHours: "",
    AvailableDays: [],
    Color: "",
    ToggleAllowedDays: [],
  };

  const [resource, setResource] = useState(emptyResource);

  const [resources, setResources] =
    useState(resourcesWithColors);

  const [grid, setGrid] = useState([]);

  const [editIndex, setEditIndex] =
    useState(null);

  const createEngine = () => {
    return new ResourcePriorityGenerator({
      availableDaysOrder: "asc",

      priorityOrder: [
        {
          key: "SeasonHours",
          order: "asc",
        },
      ],
    });
  };

  const handleInput = (field, value) => {
    setResource((prev) => ({ ...prev, [field]: value }));
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


  const regenerateGrid = (
    updatedResources
  ) => {
    const engine = createEngine();

    setGrid(
      engine.buildGrid(updatedResources)
    );
  };


  const toggleResourceDay = (
    resourceIndex,
    day
  ) => {

    const updatedResources =
      resources.map((item, index) => {

        if (index !== resourceIndex) {
          return item;
        }

        if (
          !item.ToggleAllowedDays.includes(day)
        ) {
          return item;
        }

        const exists =
          item.AvailableDays.includes(day);

        return {
          ...item,

          AvailableDays: exists
            ? item.AvailableDays.filter(
              (d) => d !== day
            )
            : [
              ...item.AvailableDays,
              day,
            ],
        };
      });

    setResources(updatedResources);

    regenerateGrid(updatedResources);
  };

  /**** SAVE RESOURCE ****/

  const saveResource = () => {

    if (!resource.Name || !resource.Id) {
      return;
    }

    const formattedResource = {
      ...resource,

      Id: Number(resource.Id),

      SeasonHours: Number(
        resource.SeasonHours || 0
      ),

      Color:
        editIndex !== null
          ? resources[editIndex].Color
          : generateColorFromIndex(
            resources.length
          ),

      ToggleAllowedDays: [
        ...resource.AvailableDays,
      ],
    };

    let updatedResources;

    if (editIndex !== null) {

      updatedResources = resources
        .map((item, index) =>
          index === editIndex
            ? formattedResource
            : item
        )
        .sort(
          (a, b) =>
            a.SeasonHours -
            b.SeasonHours
        );

      setEditIndex(null);

    } else {

      updatedResources = [
        ...resources,
        formattedResource,
      ].sort(
        (a, b) =>
          a.SeasonHours -
          b.SeasonHours
      );
    }

    setResources(updatedResources);

    regenerateGrid(updatedResources);

    setResource(emptyResource);
  };

  /**** EDIT RESOURCE ****/

  const editResource = (index) => {

    const selected = resources[index];

    setResource({
      ...selected,

      Id: String(selected.Id),

      SeasonHours: String(
        selected.SeasonHours
      ),
    });

    setEditIndex(index);
  };

  /**** DELETE RESOURCE ****/

  const deleteResource = (index) => {

    const updatedResources =
      resources.filter(
        (_, i) => i !== index
      );

    setResources(updatedResources);

    regenerateGrid(updatedResources);

    if (editIndex === index) {
      setResource(emptyResource);
      setEditIndex(null);
    }
  };

  /**** CANCEL EDIT ****/

  const cancelEdit = () => {
    setResource(emptyResource);
    setEditIndex(null);
  };

  /**** MANUAL GENERATE ****/

  const generateGrid = () => {
    regenerateGrid(resources);
  };

  return (
    <div className="min-h-screen bg-background p-4">

      <div className="max-w-7xl mx-auto space-y-5">

        <h1 className="text-2xl font-bold">
          Resource Priority Generator
        </h1>

        <Card className="rounded-2xl shadow-sm">

          <CardContent className="p-4 space-y-3">

            <h2 className="text-lg font-semibold">
              {editIndex !== null
                ? "Edit Resource"
                : "Add Resource"}
            </h2>

            <div className="grid md:grid-cols-[120px_1fr_1fr_120px] gap-2">

              <Input
                placeholder="ID"
                value={resource.Id}
                onChange={(e) =>
                  handleInput(
                    "Id",
                    e.target.value
                  )
                }
              />

              <Input
                placeholder="Name"
                value={resource.Name}
                onChange={(e) =>
                  handleInput(
                    "Name",
                    e.target.value
                  )
                }
              />

              <Input
                placeholder="Program"
                value={resource.Program}
                onChange={(e) =>
                  handleInput(
                    "Program",
                    e.target.value
                  )
                }
              />

              <Input
                placeholder="Hours"
                value={resource.SeasonHours}
                onChange={(e) =>
                  handleInput(
                    "SeasonHours",
                    e.target.value
                  )
                }
              />
            </div>

            <div>

              <p className="font-medium mb-2 text-sm">
                Available Days
              </p>

              <div className="grid grid-cols-4 md:grid-cols-8 gap-1">

                {DAYS.map((day) => (

                  <label
                    key={day}

                    className="
                      flex
                      items-center
                      justify-center
                      gap-1
                      border
                      rounded-md
                      px-1.5
                      py-1
                      text-[11px]
                      min-h-[32px]
                    "
                  >

                    <Checkbox
                      checked={
                        resource.AvailableDays.includes(
                          day
                        )
                      }

                      onCheckedChange={() =>
                        handleDayToggle(day)
                      }
                    />

                    <span>
                      {DAY_SHORT[day]}
                    </span>

                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">

              <Button
                onClick={saveResource}
                className="rounded-lg px-3"
              >
                <Save className="w-4 h-4" />
              </Button>

              {editIndex !== null && (

                <Button
                  variant="outline"
                  onClick={cancelEdit}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {(resources.length > 0 ||
          grid.length > 0) && (

            <Card className="rounded-2xl shadow-sm">

              <CardContent className="p-5">

                <div className="
                flex
                items-center
                justify-between
                mb-4
              ">

                  <h2 className="text-lg font-semibold">
                    Priority Layout
                  </h2>

                  <Button
                    onClick={generateGrid}
                    className="rounded-xl"
                  >
                    Generate Grid
                  </Button>
                </div>

                <div className="
                grid
                lg:grid-cols-[400px_1fr]
                gap-6
                items-start
              ">

                  <div className="space-y-3">

                    {resources.map((r, index) => (

                      <div
                        key={index}

                        className="
                        border
                        rounded-lg
                        p-2
                      "

                        style={{
                          backgroundColor: "white",
                        }}
                      >

                        <p className="font-semibold">
                          {r.Name}
                        </p>

                        <p className="
                        text-xs
                        text-muted-foreground
                        mb-2
                      ">
                          {r.SeasonHours} h
                        </p>

                        <div className="
                        flex
                        flex-wrap
                        items-center
                        gap-1
                      ">

                          {DAYS.map((day) => {

                            const isAvailable =
                              r.AvailableDays.includes(
                                day
                              );

                            const canToggle =
                              r.ToggleAllowedDays.includes(
                                day
                              );

                            return (
                              <span
                                key={day}

                                onClick={() =>
                                  canToggle &&
                                  toggleResourceDay(
                                    index,
                                    day
                                  )
                                }

                                className="
                                px-2
                                py-0.5
                                rounded
                                border
                                text-[11px]
                              "

                                style={{
                                  cursor: canToggle
                                    ? "pointer"
                                    : "not-allowed",

                                  backgroundColor:
                                    isAvailable
                                      ? r.Color
                                      : "#e5e7eb",
                                }}
                              >
                                {DAY_SHORT[day]}
                              </span>
                            );
                          })}

                          <Button
                            variant="outline"
                            size="sm"

                            onClick={() =>
                              editResource(index)
                            }

                            className="
                            h-7
                            w-7
                            min-w-[28px]
                            p-0
                            shrink-0
                          "
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"

                            onClick={() =>
                              deleteResource(index)
                            }

                            className="
                            h-7
                            w-7
                            min-w-[28px]
                            p-0
                            shrink-0
                          "
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {grid.length > 0 && (

                    <div className="overflow-x-auto">

                      <table className="
                      w-full
                      border-collapse
                      text-sm
                    ">

                        <thead>

                          <tr>

                            {DAYS.map((day) => (

                              <th
                                key={day}

                                className="
                                border
                                p-2
                                text-left
                              "
                              >
                                {DAY_SHORT[day]}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>

                          {grid.map((row, index) => (

                            <tr key={index}>

                              {DAYS.map((day) => {

                                const resourceName =
                                  row[day];

                                const matchedResource =
                                  resources.find(
                                    (r) =>
                                      r.Name ===
                                      resourceName
                                  );

                                return (
                                  <td
                                    key={day}

                                    className="
                                    border
                                    p-2
                                  "

                                    style={{
                                      backgroundColor:
                                        matchedResource?.Color ||
                                        "white",
                                    }}
                                  >
                                    {resourceName || "-"}
                                  </td>
                                );
                              })}
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