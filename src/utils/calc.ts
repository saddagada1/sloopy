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
