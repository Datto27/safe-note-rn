export const parseTime = (time: number): string => {
  let timeStr = '';
  if (time < 10) {
    timeStr = `0${time}`;
  } else {
    timeStr = `${time}`;
  }

  return timeStr;
};
