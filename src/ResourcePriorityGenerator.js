class ResourcePriorityGenerator {
  constructor(config = {}) {
    this.DayType = {
      Sunday: "Sunday",
      Monday: "Monday",
      Tuesday: "Tuesday",
      Wednesday: "Wednesday",
      Thursday: "Thursday",
      Friday: "Friday",
      Saturday: "Saturday",
      Holiday: "Holiday",
    };

    // AvailableDays sort direction
    // default: asc
    this.availableDaysOrder = config.availableDaysOrder || "asc";

    // Additional tie-breakers
    // Example:
    // [
    //   { key: "SeasonHours", order: "asc" },
    //   { key: "Cost", order: "desc" }
    // ]
    this.priorityOrder = config.priorityOrder || [];
  }

  canUse(resource, day) {
    return resource.AvailableDays?.includes(day);
  }

  totalAvailableDays(resource) {
    return resource.AvailableDays?.length || 0;
  }

  getValue(resource, key) {
    if (!(key in resource)) return null;

    const value = resource[key];
    if (Array.isArray(value)) return value.length;

    return value;
  }

  compare(a, b) {
    const aDays = this.totalAvailableDays(a);
    const bDays = this.totalAvailableDays(b);

    if (aDays !== bDays)
      return this.availableDaysOrder === "desc" ? bDays - aDays : aDays - bDays;

    for (const rule of this.priorityOrder) {
      const { key, order = "asc" } = rule;

      const aVal = this.getValue(a, key);
      const bVal = this.getValue(b, key);

      if (aVal == null && bVal == null) continue;

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (aVal !== bVal) return order === "desc" ? bVal - aVal : aVal - bVal;
    }

    return 0;
  }

  getGlobalPriority(resources) {
    return resources
      .map((r, i) => ({ ...r, __index: i }))
      .sort((a, b) => {
        const cmp = this.compare(a, b);
        if (cmp !== 0) return cmp;

        return a.__index - b.__index;
      });
  }

  getPriority(globalList, day) {
    return globalList.filter((r) => this.canUse(r, day));
  }

  getByIndex(list, index) {
    return index < list.length ? list[index].Name : "";
  }

  buildGrid(resources) {
    const rows = [];
    const globalPriority = this.getGlobalPriority(resources);
    const maxRows = resources.length;
    const days = Object.values(this.DayType);

    for (let i = 0; i < maxRows; i++) {
      const row = {};

      for (const day of days) {
        const list = this.getPriority(globalPriority, day);
        row[day] = this.getByIndex(list, i);
      }

     if (Object.values(row).some((v) => v)) {
        rows.push(row);
      }
    }

    return rows;
  }
}

export default ResourcePriorityGenerator;