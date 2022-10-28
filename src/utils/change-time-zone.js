function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

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
    [
      padTo2Digits(time.getDate()),
      padTo2Digits(time.getMonth() + 1),
      time.getFullYear(),
    ].join("/") +
    ", " +
    [
      padTo2Digits(time.getHours()),
      padTo2Digits(time.getMinutes()),
      padTo2Digits(time.getSeconds()),
    ].join(":");
  return dformat;
}
