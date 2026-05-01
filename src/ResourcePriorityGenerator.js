class ResourcePriorityGenerator {
  constructor() {
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
  }

  /**** BASIC HELPERS ****/

  canUse(resource, day) {
    if (day === this.DayType.Holiday) {
      return resource.HolidayAvailable;
    }
    return resource.AvailableDays.includes(day);
  }

  // Holiday treated as equal to any weekday
  totalAvailableDays(resource) {
    let count = resource.AvailableDays.length;

    if (resource.HolidayAvailable) {
      count += 1;
    }

    return count;
  }

  /**** CORE PRIORITY LOGIC (NO NAME/ID DEPENDENCY) ****/

  compare(a, b) {
    const aDays = this.totalAvailableDays(a);
    const bDays = this.totalAvailableDays(b);

    // 1. Fewer days → higher priority
    if (aDays !== bDays) {
      return aDays - bDays;
    }

    // 2. Lower SeasonHours
    if (a.SeasonHours !== b.SeasonHours) {
      return a.SeasonHours - b.SeasonHours;
    }

    // 3. No business-based fallback
    return 0;
  }

  /**** GLOBAL PRIORITY (STABLE) ****/

  getGlobalPriority(resources) {
    return resources
      .map((r, i) => ({ ...r, __index: i })) // attach stable index
      .sort((a, b) => {
        const cmp = this.compare(a, b);
        if (cmp !== 0) return cmp;

        // deterministic neutral fallback
        return a.__index - b.__index;
      });
  }

  /**** DAY FILTER (NO RE-SORTING) ****/

  getPriority(globalList, day) {
    return globalList.filter((r) => this.canUse(r, day));
  }

  /**** SAFE FETCH ****/

  getByIndex(list, index) {
    return index < list.length ? list[index].Name : "";
  }

  /**** BUILD GRID ****/

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