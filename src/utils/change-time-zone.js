export function changeTimeZone(date, timeZone) {
  if (typeof date === "string") {
    return new Date(
      new Date(date).toLocaleString("en-US", {
        timeZone,
      })
    );
  }

  const time = new Date(
    date.toLocaleString("en-US", {
      timeZone,
    })
  );

  const dformat =
    [time.getMonth() + 1, time.getDate(), time.getFullYear()].join("/") +
    " " +
    [time.getHours(), time.getMinutes(), time.getSeconds()].join(":");
  return dformat;
}
