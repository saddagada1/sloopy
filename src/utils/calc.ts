import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { mode, pitchClassColours } from "./constants";
import { type Sloop } from "@prisma/client";
import { type Loop } from "./types";
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

export const calcSloopColours = (sloop: Sloop) => {
  const loops = sloop.loops as Loop[];

  if (loops.length > 0) {
    return loops.map((loop) => pitchClassColours[loop.key]!);
  }

  return [
    pitchClassColours[sloop.key]!,
    mode[sloop.mode] === "Major"
      ? pitchClassColours[sloop.key - 3 ?? 12 - 3]!
      : pitchClassColours[sloop.key + 3 ?? -1 + 3]!,
  ];
};

export const calcTrimmedString = (str: string) => {
  return str.replace(/\s+/g, " ").trim();
};

export const calcUsername = (email?: string) => {
  return (
    email?.split("@")[0]?.slice(0, 5) +
      Math.random().toString(36).slice(2, 10) ??
    Math.random().toString(36).slice(0, 13)
  );
};

export const calcPastDate = (range: number) => {
  const now = new Date().getTime();
  return new Date(now - range);
};

export const calcRank = (initial: number, values: number[]) => {
  let rank = 0;
  if (values.length > 0) {
    const mean =
      values.reduce((previous, current) => previous + current, 0) /
      values.length;
    const distances = values.map((value) =>
      Math.pow(Math.abs(value - mean), 2)
    );
    const quotient =
      values.length > 1
        ? distances.reduce((previous, current) => previous + current, 0) /
          (values.length - 1)
        : distances.reduce((previous, current) => previous + current, 0);
    const deviation = Math.sqrt(quotient);
    rank = deviation !== 0 ? initial - mean / deviation : initial - mean;
    //console.log(mean, distances, quotient, deviation, rank);
  }
  return rank;
};
