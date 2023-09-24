import { type Play } from "@prisma/client";
import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { calcPastDate, calcRank } from "~/utils/calc";
import { TRENDING_TOPIC } from "~/utils/constants";
import { kafka } from "~/utils/upstash";

interface PlayWithRelations extends Play {
  sloop: {
    artists: {
      id: string;
    }[];
    track: {
      id: string;
    };
  };
}

const historyRange = 1000 * 60 * 60 * 24;
const consumerGroupId = "group_1";
const instanceId = "instance_1";

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const c = kafka.consumer();
  const messages = await c.consume({
    consumerGroupId: consumerGroupId,
    instanceId: instanceId,
    topics: [TRENDING_TOPIC],
    autoOffsetReset: "earliest",
    autoCommit: false,
    timeout: 1000 * 60,
  });

  const plays = messages.map(
    (play) => JSON.parse(play.value) as PlayWithRelations
  );

  //sloops
  const countedPlays = plays.reduce((previous, current) => {
    previous[current.sloopId] = (previous[current.sloopId] ?? 0) + 1;
    return previous;
  }, {} as Record<string, number>);
  console.log(countedPlays);
  for (const sloop of Object.keys(countedPlays)) {
    const exists = await prisma.sloop.findUnique({ where: { id: sloop } });
    if (!exists) continue;

    const rankedSloop = await prisma.rankedSloop.findUnique({
      where: { sloopId: sloop },
      include: {
        pastPlayCounts: {
          where: { createdAt: { gt: calcPastDate(historyRange) } },
          select: { playCount: true },
        },
      },
    });
    if (!rankedSloop) continue;

    const rank = calcRank(
      countedPlays[sloop]!,
      rankedSloop.pastPlayCounts.map(({ playCount }) => playCount)
    );
    const plays = rankedSloop.plays;
    try {
      await prisma.$transaction(async () => {
        await prisma.rankedSloop.update({
          where: { sloopId: sloop },
          data: { rank: rank, plays: plays + countedPlays[sloop]! },
        });
        await prisma.sloopRank.create({
          data: { sloopId: sloop, rank: rank },
        });
        await prisma.sloopPlayCount.create({
          data: { sloopId: sloop, playCount: countedPlays[sloop]! },
        });
      });
    } catch (error) {
      continue;
    }
  }

  //tracks
  const tracks = plays.map((play) => play.sloop.track);
  const countedTrackPlays = tracks.reduce((previous, current) => {
    previous[current.id] = (previous[current.id] ?? 0) + 1;
    return previous;
  }, {} as Record<string, number>);
  console.log(countedTrackPlays);
  for (const track of Object.keys(countedTrackPlays)) {
    const exists = await prisma.track.findUnique({ where: { id: track } });
    if (!exists) continue;

    const rankedTrack = await prisma.rankedTrack.findUnique({
      where: { trackId: track },
      include: {
        pastPlayCounts: {
          where: { createdAt: { gt: calcPastDate(historyRange) } },
          select: { playCount: true },
        },
      },
    });

    if (!rankedTrack) continue;

    const rank = calcRank(
      countedTrackPlays[track]!,
      rankedTrack.pastPlayCounts.map(({ playCount }) => playCount)
    );
    const plays = rankedTrack.plays;
    try {
      await prisma.$transaction(async () => {
        await prisma.rankedTrack.update({
          where: { trackId: track },
          data: { rank: rank, plays: plays + countedTrackPlays[track]! },
        });
        await prisma.trackRank.create({
          data: { trackId: track, rank: rank },
        });
        await prisma.trackPlayCount.create({
          data: { trackId: track, playCount: countedTrackPlays[track]! },
        });
      });
    } catch (error) {
      continue;
    }
  }

  //artists
  const artists = plays.flatMap((play) => play.sloop.artists);
  const countedArtistPlays = artists.reduce((previous, current) => {
    previous[current.id] = (previous[current.id] ?? 0) + 1;
    return previous;
  }, {} as Record<string, number>);
  console.log(countedArtistPlays);
  for (const artist of Object.keys(countedArtistPlays)) {
    const exists = await prisma.artist.findUnique({ where: { id: artist } });
    if (!exists) continue;

    const rankedArtist = await prisma.rankedArtist.findUnique({
      where: { artistId: artist },
      include: {
        pastPlayCounts: {
          where: { createdAt: { gt: calcPastDate(historyRange) } },
          select: { playCount: true },
        },
      },
    });

    if (!rankedArtist) continue;

    const rank = calcRank(
      countedArtistPlays[artist]!,
      rankedArtist.pastPlayCounts.map(({ playCount }) => playCount)
    );
    const plays = rankedArtist.plays;
    try {
      await prisma.$transaction(async () => {
        await prisma.rankedArtist.update({
          where: { artistId: artist },
          data: { rank: rank, plays: plays + countedArtistPlays[artist]! },
        });
        await prisma.artistRank.create({
          data: { artistId: artist, rank: rank },
        });
        await prisma.artistPlayCount.create({
          data: { artistId: artist, playCount: countedArtistPlays[artist]! },
        });
      });
    } catch (error) {
      continue;
    }
  }
  await c.commit({
    consumerGroupId,
    instanceId,
  });
  res.status(200).send({
    ok: true,
    message: "Updated Ranks",
  });
};

export default handler;
