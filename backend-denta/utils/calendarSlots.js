export const generateTimeSlots = (
  start = "08:00",
  end = "18:00",
  stepMinutes = 30,
) => {
  const slots = [];
  const toMin = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  for (let m = toMin(start); m < toMin(end); m += stepMinutes) {
    const h = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    slots.push(`${h}:${mm}`);
  }

  return slots;
};
