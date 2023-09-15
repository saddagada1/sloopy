import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const calcVideoTimestamp = (position: number) => {
  const minutes = Math.floor(position / 60);
  const seconds = position % 60;
  return `${minutes}:${
    seconds.toString().length === 1 ? "0" + seconds : seconds
  }`;
};

export const clamp = (
  value: number,
  lowerBound: number,
  upperBound: number
) => {
  return Math.min(Math.max(lowerBound, value), upperBound);
};

export const rand = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const calcRelativeTime = (time: Date) => {
  return dayjs(time).fromNow();
};

export const calcTimeOfDay = () => {
  const now = new Date();
  const hours = now.getHours();
  if (hours < 12) return "Good Morning";
  if (hours >= 12 && hours < 18) return "Good Afternoon";
  if (hours >= 18 && hours < 24) return "Good Evening";
};
