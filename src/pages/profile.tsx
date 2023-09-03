import Avatar from "boring-avatars";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { PiGear } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import LabelValueBar from "~/components/ui/LabelValueBar";
import { keyReference } from "~/utils/constants";
import { api } from "~/utils/api";
import Loading from "~/components/utils/Loading";

const Profile: NextPage = ({}) => {
  const { data: session } = useSession();
  const [avatarContainerRef, { height }] = useElementSize();
  const {
    data: sloops,
    isLoading,
    error,
  } = api.sloops.getUserSloops.useQuery();

  if (isLoading) {
    return <Loading />;
  }

  if (!sloops || error) {
    return <div>ERROR</div>;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Profile</title>
      </Head>
      <div className="flex flex-col px-4 pt-6">
        <div className="flex justify-between">
          <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
            Profile
          </h2>
          <Link href="/settings" className="flex items-center">
            <PiGear className="mr-2 text-lg sm:text-xl" /> Settings
          </Link>
        </div>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          {session?.user.name ?? session?.user.username}
        </h1>
        <div ref={avatarContainerRef} className="flex gap-4">
          {height && (
            <div
              style={{ width: height }}
              className="relative aspect-square flex-shrink-0 overflow-hidden rounded-full"
            >
              {session!.user.image ? (
                <Image
                  src={session!.user.image}
                  alt={`${session?.user.username}'s profile picture`}
                  fill
                  className="object-cover"
                />
              ) : (
                <Avatar
                  size={height}
                  name={session!.user.name ?? session?.user.username}
                  variant="marble"
                  square
                  colors={keyReference.map((key) => key.colour)}
                />
              )}
            </div>
          )}
          <div className="flex flex-1 flex-col justify-between gap-1">
            <LabelValueBar
              label="sloops"
              value="34"
              style="bg-secondary text-primary"
            />
            <LabelValueBar label="following" value="223" style="bg-gray-400" />
            <LabelValueBar label="followers" value="634" style="bg-gray-200" />
          </div>
        </div>
        <div className="mt-10 w-full flex-1">
          {sloops.map((sloop, index) => (
            <Link href={`/editor/${sloop.id}`} key={index}>
              {`${sloop.name} is ${sloop.isPrivate ? "private" : "public"}`}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};
export default Profile;
