import { type Like } from "@prisma/client";
import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { calcPastDate, calcRank } from "~/utils/calc";
import { LOVED_TOPIC } from "~/utils/constants";
import { kafka } from "~/utils/upstash";

interface LikeWithRelations extends Like {
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
const consumerGroupId = "group_2";
const instanceId = "instance_2";

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const c = kafka.consumer();
  const messages = await c.consume({
    consumerGroupId: consumerGroupId,
    instanceId: instanceId,
    topics: [LOVED_TOPIC],
    autoOffsetReset: "earliest",
    autoCommit: false,
    timeout: 1000 * 60,
  });

  console.log(messages);

  const likes = messages.map(
    (like) => JSON.parse(like.value) as LikeWithRelations
  );

  //sloops
  const countedLikes = likes.reduce((previous, current) => {
    previous[current.sloopId] = (previous[current.sloopId] ?? 0) + 1;
    return previous;
  }, {} as Record<string, number>);
  console.log(countedLikes);
  for (const sloop of Object.keys(countedLikes)) {
    const exists = await prisma.sloop.findUnique({ where: { id: sloop } });
    if (!exists) continue;

    const rankedSloop = await prisma.rankedSloop.findUnique({
      where: { sloopId: sloop },
      include: {
        pastLikeCounts: {
          where: { createdAt: { gt: calcPastDate(historyRange) } },
          select: { likeCount: true },
        },
      },
    });
    if (!rankedSloop) continue;

    const rank = calcRank(
      countedLikes[sloop]!,
      rankedSloop.pastLikeCounts.map(({ likeCount }) => likeCount)
    );
    try {
      await prisma.$transaction(async () => {
        await prisma.rankedSloop.update({
          where: { sloopId: sloop },
          data: { likeRank: rank },
        });
        await prisma.sloopLikeRank.create({
          data: { sloopId: sloop, likeRank: rank },
        });
        await prisma.sloopLikeCount.create({
          data: { sloopId: sloop, likeCount: countedLikes[sloop]! },
        });
      });
    } catch (error) {
      continue;
    }
  }

  //tracks
  const tracks = likes.map((like) => like.sloop.track);
  const countedTrackLikes = tracks.reduce((previous, current) => {
    previous[current.id] = (previous[current.id] ?? 0) + 1;
    return previous;
  }, {} as Record<string, number>);
  console.log(countedTrackLikes);
  for (const track of Object.keys(countedTrackLikes)) {
    const exists = await prisma.track.findUnique({ where: { id: track } });
    if (!exists) continue;

    const rankedTrack = await prisma.rankedTrack.findUnique({
      where: { trackId: track },
      include: {
        pastLikeCounts: {
          where: { createdAt: { gt: calcPastDate(historyRange) } },
          select: { likeCount: true },
        },
      },
    });

    if (!rankedTrack) continue;

    const rank = calcRank(
      countedTrackLikes[track]!,
      rankedTrack.pastLikeCounts.map(({ likeCount }) => likeCount)
    );
    const likes = rankedTrack.likes;
    try {
      await prisma.$transaction(async () => {
        await prisma.rankedTrack.update({
          where: { trackId: track },
          data: { likeRank: rank, likes: likes + countedTrackLikes[track]! },
        });
        await prisma.trackLikeRank.create({
          data: { trackId: track, likeRank: rank },
        });
        await prisma.trackLikeCount.create({
          data: { trackId: track, likeCount: countedTrackLikes[track]! },
        });
      });
    } catch (error) {
      continue;
    }
  }

  //artists
  const artists = likes.flatMap((like) => like.sloop.artists);
  const countedArtistLikes = artists.reduce((previous, current) => {
    previous[current.id] = (previous[current.id] ?? 0) + 1;
    return previous;
  }, {} as Record<string, number>);
  console.log(countedArtistLikes);
  for (const artist of Object.keys(countedArtistLikes)) {
    const exists = await prisma.artist.findUnique({ where: { id: artist } });
    if (!exists) continue;

    const rankedArtist = await prisma.rankedArtist.findUnique({
      where: { artistId: artist },
      include: {
        pastLikeCounts: {
          where: { createdAt: { gt: calcPastDate(historyRange) } },
          select: { likeCount: true },
        },
      },
    });

    if (!rankedArtist) continue;

    const rank = calcRank(
      countedArtistLikes[artist]!,
      rankedArtist.pastLikeCounts.map(({ likeCount }) => likeCount)
    );
    const likes = rankedArtist.likes;
    try {
      await prisma.$transaction(async () => {
        await prisma.rankedArtist.update({
          where: { artistId: artist },
          data: { likeRank: rank, likes: likes + countedArtistLikes[artist]! },
        });
        await prisma.artistLikeRank.create({
          data: { artistId: artist, likeRank: rank },
        });
        await prisma.artistLikeCount.create({
          data: { artistId: artist, likeCount: countedArtistLikes[artist]! },
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
    message: "Updated Liked Ranks",
  });
};

export default handler;
