import Avatar from "boring-avatars";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { PiGear } from "react-icons/pi";
import DropdownMenu from "~/components/ui/DropdownMenu";
import LabelValueBar from "~/components/ui/LabelValueBar";
import { keyReference } from "~/utils/constants";

const Profile: NextPage = ({}) => {
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>Sloopy - Profile</title>
      </Head>
      <div className="flex flex-col px-4 pt-6">
        <div className="flex justify-between">
          <h2 className="font-display text-xl text-gray-400">profile</h2>
          <DropdownMenu menuX="left" menuY="bottom">
            <Link href="/settings" className="flex items-center">
              <PiGear className="mr-2 text-lg" /> Settings
            </Link>
          </DropdownMenu>
        </div>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-2 text-4xl font-bold">
          {session?.user.name}
        </h1>
        <div className="flex gap-2">
          <div className="relative aspect-square w-28 flex-shrink-0 overflow-hidden rounded-md">
            {session!.user.image ? (
              <Image
                src={session!.user.image}
                alt={`${session?.user.username}'s profile picture`}
                fill
                className="object-cover"
              />
            ) : (
              <Avatar
                size={112}
                name={session!.user.name!}
                variant="marble"
                square
                colors={keyReference.map((key) => key.colour)}
              />
            )}
          </div>
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
      </div>
    </>
  );
};
export default Profile;
