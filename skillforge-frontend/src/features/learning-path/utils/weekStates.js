export function computeWeekStates(weeks) {
  const states = new Map();

  let currentFound = false;

  (weeks ?? []).forEach((week, index) => {
    if (week.completed) {
      states.set(week.week, "completed");
      return;
    }

    const previousCompleted =
      index === 0 || Boolean(weeks[index - 1]?.completed);

    if (previousCompleted && !currentFound) {
      currentFound = true;
      states.set(week.week, "current");
    } else if (!previousCompleted) {
      states.set(week.week, "locked");
    } else {
      states.set(week.week, "pending");
    }
  });

  return states;
}
