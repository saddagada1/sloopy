import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { PiCamera, PiHeart, PiTrash } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import { api } from "~/utils/api";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import SafeImage from "~/components/ui/SafeImage";
import { paginationLimit } from "~/utils/constants";
import ErrorView from "~/components/utils/ErrorView";
import SloopList from "~/components/ui/SloopList";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import clsx from "clsx";
import {
  type Dispatch,
  type SetStateAction,
  useRef,
  useState,
  useMemo,
} from "react";
import { AnimatePresence } from "framer-motion";
import Modal from "~/components/ui/Modal";
import StyledTitle from "~/components/ui/form/StyledTitle";
import Image from "next/image";
import toast from "react-hot-toast";
import LoadingButton from "~/components/ui/LoadingButton";
import axios from "axios";
import NoData from "~/components/ui/NoData";
import ScrollPagination from "~/components/ui/ScrollPagination";

interface ProfileImageModalProps {
  setVisible: Dispatch<SetStateAction<boolean>>;
  height: number;
}

const ProfileImageModal: React.FC<ProfileImageModalProps> = ({
  setVisible,
  height,
}) => {
  const { data: session, update: updateSession } = useSession();
  const [profileImage, setProfileImage] = useState<File>();
  const profileImageRef = useRef<HTMLInputElement>(null!);
  const { mutateAsync: changeProfileImage, isLoading: changingProfileImage } =
    api.users.changeImage.useMutation();
  const { mutateAsync: deleteProfileImage } =
    api.users.deleteImage.useMutation();

  const handleProfileImageUpload = (file?: File) => {
    const accept = "image/jpeg image/jpg image/png";
    if (!file) return;
    if (file.size > 2097152) {
      toast.error("Max File Size: 2MB");
      return;
    }
    if (!accept.includes(file.type)) {
      toast.error("Only JPEG, JPG and PNG Files");
      return;
    }
    setProfileImage(file);
  };

  const handleSaveProfileImage = async () => {
    if (!profileImage) return;
    try {
      const url = await changeProfileImage();
      const response = await axios.put(url, profileImage);
      if (response.status !== 200) {
        toast.error("Error: Could Not Change Profile Image");
      }
      toast.success("Success: Changed Profile Image");
      await updateSession();
    } catch (error) {
      toast.error("Error: Could Not Change Profile Image");
    }
    setVisible(false);
  };

  const handleDeleteProfileImage = async () => {
    try {
      await deleteProfileImage();
      toast.success("Success: Deleted Profile Image");
      await updateSession();
    } catch (error) {
      toast.error("Error: Could Not Delete Profile Image");
    }
    setVisible(false);
  };

  return (
    <Modal setVisible={setVisible}>
      <StyledTitle title="Profile Image" />
      <div className="mb-6 flex flex-col items-center">
        <input
          className="hidden"
          ref={profileImageRef}
          type="file"
          name="file"
          onChange={(e) =>
            e.target.files && handleProfileImageUpload(e.target.files[0])
          }
        />
        <button
          style={{ height: height }}
          onClick={() =>
            profileImageRef.current && profileImageRef.current.click()
          }
          className="relative flex aspect-square flex-col items-center justify-center gap-1 overflow-hidden rounded-full border border-dashed border-secondary text-base text-gray-400 sm:text-lg"
        >
          {!profileImage && !session?.user.image ? (
            <>
              <PiCamera className="text-xl sm:text-2xl" />
              <p>Select</p>
            </>
          ) : (
            <Image
              unoptimized
              src={
                profileImage
                  ? URL.createObjectURL(profileImage)
                  : session?.user.image ?? ""
              }
              alt="Profile Image Preview"
              fill
              className="object-cover"
            />
          )}
        </button>
      </div>
      <div className="relative mt-2 flex h-14 w-full gap-2 font-display text-base font-bold sm:text-lg">
        {session?.user.image && (
          <button
            onClick={() => void handleDeleteProfileImage()}
            className="flex aspect-square items-center justify-center rounded-md border border-red-500 bg-red-100 text-2xl text-red-500 sm:text-3xl"
          >
            <PiTrash />
          </button>
        )}
        <button
          onClick={() => setVisible(false)}
          className="flex flex-1 items-center justify-center rounded-md border border-gray-300 bg-gray-200"
        >
          Cancel
        </button>
        <LoadingButton
          onClick={() => void handleSaveProfileImage()}
          loading={changingProfileImage}
          disabled={changingProfileImage}
          className="flex flex-1 items-center justify-center rounded-md bg-secondary text-primary"
        >
          Save
        </LoadingButton>
      </div>
    </Modal>
  );
};

const Profile: NextPage = ({}) => {
  const router = useRouter();
  const [imageContainerRef, { height }] = useElementSize();
  const [changeProfileImage, setChangeProfileImage] = useState(false);
  const { data: session } = useSession();
  const {
    data: user,
    isLoading: fetchingUser,
    error: userError,
  } = api.users.getSessionUser.useQuery();
  const {
    data: sloops,
    isLoading: fetchingSloops,
    isFetching: fetchingNext,
    error: sloopsError,
    fetchNextPage,
    hasNextPage,
  } = api.sloops.getSloops.useInfiniteQuery(
    {
      limit: paginationLimit,
    },
    {
      getNextPageParam: (page) => page.next,
    }
  );
  const data = useMemo(() => {
    if (router.query.tab === "private") {
      return sloops?.pages
        .flatMap((page) => page.items)
        .filter((sloop) => sloop.isPrivate);
    } else {
      return sloops?.pages
        .flatMap((page) => page.items)
        .filter((sloop) => !sloop.isPrivate);
    }
  }, [sloops, router.query.tab]);

  if (fetchingUser || fetchingSloops) {
    return <Loading />;
  }

  if ((!user || userError) ?? (!sloops || sloopsError)) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Profile</title>
      </Head>
      <AnimatePresence>
        {changeProfileImage && (
          <ProfileImageModal
            setVisible={setChangeProfileImage}
            height={height}
          />
        )}
      </AnimatePresence>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Profile
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          {session?.user.name ?? session?.user.username}
        </h1>
        <div ref={imageContainerRef} className="flex gap-4">
          <button onClick={() => setChangeProfileImage(true)}>
            <SafeImage
              url={session?.user.image}
              alt={user.username}
              width={height}
              className="relative aspect-square overflow-hidden rounded-full"
            />
          </button>
          <div className="flex flex-1 flex-col justify-between gap-4">
            <div className="flex border-b border-gray-300 pb-4">
              <div className="flex flex-1 flex-col items-start gap-1 border-r border-gray-300">
                <p className="px-2 font-display text-xs text-gray-400 sm:text-sm">
                  Sloops
                </p>
                <p className="w-full text-center text-sm font-semibold sm:text-base">
                  {user.sloopsCount.toLocaleString(undefined, {
                    notation: "compact",
                  })}
                </p>
              </div>
              <Link
                href="/followers"
                className="flex flex-1 flex-col items-start gap-1 border-r border-gray-300"
              >
                <p className="px-2 font-display text-xs text-gray-400 sm:text-sm">
                  Followers
                </p>
                <p className="w-full text-center text-sm font-semibold sm:text-base">
                  {user.followersCount.toLocaleString(undefined, {
                    notation: "compact",
                  })}
                </p>
              </Link>
              <Link
                href="/following"
                className="flex flex-1 flex-col items-start gap-1"
              >
                <p className="px-2 font-display text-xs text-gray-400 sm:text-sm">
                  Following
                </p>
                <p className="w-full text-center text-sm font-semibold sm:text-base">
                  {user.followingCount.toLocaleString(undefined, {
                    notation: "compact",
                  })}
                </p>
              </Link>
            </div>
            <div className="flex gap-2 text-center font-display text-base font-semibold sm:text-lg">
              <Link
                href="/settings"
                className="flex-1 rounded-md border border-gray-300 bg-gray-200 px-2 py-2.5"
              >
                Settings
              </Link>
              <Link
                href="/likes"
                className="flex aspect-square h-full items-center justify-center rounded-md border border-gray-300 bg-gray-200 text-2xl sm:text-3xl"
              >
                <PiHeart />
              </Link>
            </div>
          </div>
        </div>
        {session?.user.bio && (
          <div className="mt-4 flex w-full flex-col items-start gap-1 border-t border-gray-300 pt-4">
            <p className="font-display text-xs text-gray-400 sm:text-sm">Bio</p>
            <p className="w-full text-sm font-semibold sm:text-base">
              {session?.user.bio}
            </p>
          </div>
        )}
        <div className="my-4 flex gap-2 border-t border-gray-300 pt-4 text-center font-display text-base font-semibold sm:text-lg">
          <button
            onClick={() =>
              void router.replace(`/profile?tab=published`, undefined, {
                shallow: true,
              })
            }
            className={clsx(
              "flex-1 rounded-md px-2 py-2.5",
              router.query.tab !== "private"
                ? "bg-secondary text-primary"
                : "border border-gray-300 bg-gray-200"
            )}
          >
            Published
          </button>
          <button
            onClick={() =>
              void router.replace(`/profile?tab=private`, undefined, {
                shallow: true,
              })
            }
            className={clsx(
              "flex-1 rounded-md px-2 py-2.5",
              router.query.tab === "private"
                ? "bg-secondary text-primary"
                : "border border-gray-300 bg-gray-200"
            )}
          >
            Private
          </button>
        </div>
        {data && data.length > 0 ? (
          <ScrollPagination
            onClickNext={() => void fetchNextPage()}
            hasNext={!!hasNextPage}
            fetchingNext={fetchingNext}
          >
            <SloopList sloops={data} profile />
          </ScrollPagination>
        ) : (
          <NoData>
            {sloops.pages[0] && sloops.pages[0]?.items.length > 0
              ? "No Sloops"
              : "No sloops have been created :("}
          </NoData>
        )}
      </div>
    </>
  );
};

export default WithAuth(Profile);
