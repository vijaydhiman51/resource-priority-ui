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

  // Check if resource can be used on given day
  canUse = (resource, day) => resource.AvailableDays.includes(day);

  // Total available days (PRIMARY ranking factor)
  totalAvailableDays = (resource) => resource.AvailableDays.length;

  /**** CORE PRIORITY LOGIC ****/

  /*
    FINAL RULE:

    1. Fewer available days → higher priority
    2. If tie → lower SeasonHours
  */
  compare = (a, b) => {
    const aDays = this.totalAvailableDays(a);
    const bDays = this.totalAvailableDays(b);

    // PRIMARY: scarcity
    if (aDays !== bDays) {
      return aDays - bDays;
    }

    // SECONDARY: load balancing
    return a.SeasonHours - b.SeasonHours;
  };

  /**** UNIFIED PRIORITY (ALL DAYS SAME) ****/

  getPriority(resources, day) {
    return resources
      .filter((r) => this.canUse(r, day))
      .sort((a, b) => this.compare(a, b));
  }

  /**** SAFE FETCH ****/

  getByIndex(list, index) {
    return index < list.length ? list[index].Name : "";
  }

  /**** BUILD GRID ****/

  buildGrid(resources) {
    const rows = [];
    const maxRows = resources.length;

    for (let i = 0; i < maxRows; i++) {
      const row = {};

      row[this.DayType.Sunday] = this.getByIndex(
        this.getPriority(resources, this.DayType.Sunday),
        i
      );

      row[this.DayType.Monday] = this.getByIndex(
        this.getPriority(resources, this.DayType.Monday),
        i
      );

      row[this.DayType.Tuesday] = this.getByIndex(
        this.getPriority(resources, this.DayType.Tuesday),
        i
      );

      row[this.DayType.Wednesday] = this.getByIndex(
        this.getPriority(resources, this.DayType.Wednesday),
        i
      );

      row[this.DayType.Thursday] = this.getByIndex(
        this.getPriority(resources, this.DayType.Thursday),
        i
      );

      row[this.DayType.Friday] = this.getByIndex(
        this.getPriority(resources, this.DayType.Friday),
        i
      );

      row[this.DayType.Saturday] = this.getByIndex(
        this.getPriority(resources, this.DayType.Saturday),
        i
      );

      // Holiday handled separately but same logic
      row[this.DayType.Holiday] = this.getByIndex(
        resources
          .filter((r) => r.HolidayAvailable)
          .sort((a, b) => this.compare(a, b)),
        i
      );

      // Keep only meaningful rows
      if (Object.values(row).some((v) => v)) {
        rows.push(row);
      }
    }

    return rows;
  }

  /**** PRINT ****/

  print(grid) {
    const orderedDays = Object.values(this.DayType);

    console.log("\nFINAL ROW-WISE PRIORITY GRID");
    console.log("=".repeat(120));

    let header = "Row  ";
    for (const day of orderedDays) {
      header += `| ${day.padEnd(10)}`;
    }

    console.log(header);
    console.log("-".repeat(120));

    let rowNo = 1;

    for (const row of grid) {
      let line = `${String(rowNo).padEnd(4)} `;

      for (const day of orderedDays) {
        line += `| ${(row[day] || "").padEnd(10)}`;
      }

      console.log(line);
      rowNo++;
    }
  }
}

export default ResourcePriorityGenerator;