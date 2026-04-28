// Main class that contains complete resource priority logic
class ResourcePriorityGenerator {
  // Constructor runs automatically when object is created
  constructor() {
    // Centralized day names to avoid hardcoded strings everywhere
    // This helps prevent spelling mistakes like "Monady"
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

  /**** BASIC HELPER FUNCTIONS ****/

  // Check if a resource is available for a given day
  // Example:
  // AvailableDays = ["Monday", "Tuesday"]
  // canUse(resource, "Monday") => true
  canUse = (resource, day) => resource.AvailableDays.includes(day);

  // Check whether resource has weekend availability
  // Returns true if Saturday OR Sunday exists
  hasWeekendOption = (resource) =>
    resource.AvailableDays.includes(this.DayType.Saturday) ||
    resource.AvailableDays.includes(this.DayType.Sunday);

  // Count only weekday availability
  // Excludes: Saturday, Sunday, Holiday
  weekdayCount = (resource) =>
    resource.AvailableDays.filter(
      (day) =>
        day !== this.DayType.Saturday &&
        day !== this.DayType.Sunday &&
        day !== this.DayType.Holiday,
    ).length;

  // Count total number of available days
  // Example: ["Mon", "Tue", "Wed"] => 3
  totalAvailableDays = (resource) => resource.AvailableDays.length;

  // Detect if resource is mainly a weekend resource
  //
  // Rule:
  // Must have: Saturday - Sunday AND maximum 2 weekdays
  //
  // Example:
  // 1. Sat + Sun + Monday => true
  // 2. Full week => false
  isWeekendSpecial(resource) {
    const hasSaturday = resource.AvailableDays.includes(this.DayType.Saturday);

    const hasSunday = resource.AvailableDays.includes(this.DayType.Sunday);

    const weekdayCount = this.weekdayCount(resource);

    return hasSaturday && hasSunday && weekdayCount <= 2;
  }

  /**** WEEKDAY PRIORITY LOGIC ****/

  // Used for: Monday => Friday
  // Lower number = Higher Priority
  getWeekdayPriority(resources, day) {
    return (
      resources

        // Keep only resources usable on this day
        .filter((resource) => this.canUse(resource, day))

        // Sort resources based on priority rules
        .sort((a, b) => {
          // Internal function to calculate numeric priority
          const getPriority = (resource) => {
            const hasWeekend = this.hasWeekendOption(resource);

            const totalDays = this.totalAvailableDays(resource);

            // RULE 1:
            // Weekday-only resources should be used first
            // because weekend-capable resources should be preserved
            if (!hasWeekend) {
              // RULE 2:
              // Very low used resource gets highest priority
              if (resource.SeasonHours <= 2) return 0;

              // RULE 3:
              // Used more, still weekday-only
              return 2;
            }

            // RULE 4:
            // Weekend resource with limited total availability
            if (hasWeekend && totalDays <= 4) return 1;

            // RULE 5:
            // Fully flexible resource goes last
            return 3;
          };

          // Compare numeric priorities first
          const p1 = getPriority(a);
          const p2 = getPriority(b);

          if (p1 !== p2) return p1 - p2;

          // Tie-breaker 1:
          // Fewer available days gets higher priority
          const aDays = this.hasWeekendOption(a)
            ? this.totalAvailableDays(a)
            : 0;

          const bDays = this.hasWeekendOption(b)
            ? this.totalAvailableDays(b)
            : 0;

          if (aDays !== bDays) return aDays - bDays;

          // Tie-breaker 2:
          // Less season usage gets higher priority
          return a.SeasonHours - b.SeasonHours;
        })
    );
  }

  /**** WEEKEND PRIORITY LOGIC ****/

  // Used for: Saturday  - Sunday
  getWeekendPriority(resources, day) {
    return (
      resources

        // Keep only usable resources
        .filter((resource) => this.canUse(resource, day))

        // Sort priority
        .sort((a, b) => {
          // Weekend-special resources should come first
          const aPriority = this.isWeekendSpecial(a) ? 0 : 1;

          const bPriority = this.isWeekendSpecial(b) ? 0 : 1;

          if (aPriority !== bPriority) return aPriority - bPriority;

          // Less used resource gets priority
          if (a.SeasonHours !== b.SeasonHours)
            return a.SeasonHours - b.SeasonHours;

          // Fewer available days gets priority
          return this.totalAvailableDays(a) - this.totalAvailableDays(b);
        })
    );
  }

  /**** HOLIDAY PRIORITY LOGIC ****/

  // Same logic as weekend
  // But only HolidayAvailable = true resources allowed
  getHolidayPriority(resources) {
    return (
      resources

        // Keep only holiday-allowed resources
        .filter((resource) => resource.HolidayAvailable)

        // Apply sorting logic
        .sort((a, b) => {
          const aPriority = this.isWeekendSpecial(a) ? 0 : 1;

          const bPriority = this.isWeekendSpecial(b) ? 0 : 1;

          if (aPriority !== bPriority) return aPriority - bPriority;

          if (a.SeasonHours !== b.SeasonHours)
            return a.SeasonHours - b.SeasonHours;

          return this.totalAvailableDays(a) - this.totalAvailableDays(b);
        })
    );
  }

  /**** SAFE FETCH FUNCTION ****/

  // Safely get resource name from sorted list
  //
  // Prevents: undefined errors
  getByIndex(list, index) {
    if (index >= list.length) return "";

    return list[index].Name;
  }

  /**** BUILD FINAL GRID ****/

  // This is the main scheduling function
  //
  // Creates row-wise final priority grid
  buildGrid(resources) {
    // Final output rows
    const rows = [];

    // Max rows possible = total resources
    const maxRows = resources.length;

    // Build rows one by one
    for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
      // Single row object
      const row = {};

      // For every day:
      // Get sorted priority list
      // Pick resource by row index

      row[this.DayType.Sunday] = this.getByIndex(
        this.getWeekendPriority(resources, this.DayType.Sunday),
        rowIndex,
      );

      row[this.DayType.Monday] = this.getByIndex(
        this.getWeekdayPriority(resources, this.DayType.Monday),
        rowIndex,
      );

      row[this.DayType.Tuesday] = this.getByIndex(
        this.getWeekdayPriority(resources, this.DayType.Tuesday),
        rowIndex,
      );

      row[this.DayType.Wednesday] = this.getByIndex(
        this.getWeekdayPriority(resources, this.DayType.Wednesday),
        rowIndex,
      );

      row[this.DayType.Thursday] = this.getByIndex(
        this.getWeekdayPriority(resources, this.DayType.Thursday),
        rowIndex,
      );

      row[this.DayType.Friday] = this.getByIndex(
        this.getWeekdayPriority(resources, this.DayType.Friday),
        rowIndex,
      );

      row[this.DayType.Saturday] = this.getByIndex(
        this.getWeekendPriority(resources, this.DayType.Saturday),
        rowIndex,
      );

      row[this.DayType.Holiday] = this.getByIndex(
        this.getHolidayPriority(resources),
        rowIndex,
      );

      // Check if row contains at least one real value
      const hasValues = Object.values(row).some(
        (value) => value && value.trim() !== "",
      );

      // Only keep non-empty rows
      if (hasValues) {
        rows.push(row);
      }
    }

    return rows;
  }

  /**** PRINT FINAL OUTPUT ****/

  // Print table in console
  print(grid) {
    // Fixed display order of columns
    const orderedDays = [
      this.DayType.Sunday,
      this.DayType.Monday,
      this.DayType.Tuesday,
      this.DayType.Wednesday,
      this.DayType.Thursday,
      this.DayType.Friday,
      this.DayType.Saturday,
      this.DayType.Holiday,
    ];

    console.log("\nFINAL ROW-WISE PRIORITY GRID");
    console.log("=".repeat(120));

    // Build header row
    let header = "Row  ";

    for (const day of orderedDays) {
      header += `| ${day.padEnd(10)}`;
    }

    console.log(header);
    console.log("-".repeat(120));

    // Start row numbering
    let rowNo = 1;

    // Print each row
    for (const row of grid) {
      let line = `${String(rowNo).padEnd(4)} `;

      for (const day of orderedDays) {
        const value = row[day] || "";
        line += `| ${value.padEnd(10)}`;
      }

      console.log(line);
      rowNo++;
    }
  }

  /**** DEFAULT FALLBACK DATA ****/

  // Used if data.json file is missing
  getDefaultData() {
    return [
      {
        Id: 1,
        Name: "PAR-1",
        Program: "A",
        AvailableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        SeasonHours: 1,
        HolidayAvailable: false,
      },
    ];
  }
}
export default ResourcePriorityGenerator;