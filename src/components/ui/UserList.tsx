import clsx from "clsx";
import { useRouter } from "next/router";
import { useElementSize } from "usehooks-ts";
import SafeImage from "./SafeImage";
import { pitchClassColours } from "~/utils/constants";

interface ListUser {
  name: string | null;
  image: string | null;
  username: string;
}

interface UserListProps {
  users: ListUser[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  const router = useRouter();
  const [imageContainerRef, { width }] = useElementSize();
  return (
    <ul ref={imageContainerRef} className="w-full flex-1">
      {users.map((user, index) => (
        <li
          key={index}
          className={clsx(
            "flex cursor-pointer",
            index !== users.length - 1 && "mb-4 border-b border-gray-300 pb-4"
          )}
          onClick={() => void router.push(`/${user.username}`)}
        >
          <SafeImage
            url={user.image}
            alt={user.username}
            width={width * 0.13}
            className="relative mr-4 aspect-square flex-shrink-0 overflow-hidden rounded-full"
            colours={Object.keys(pitchClassColours).map(
              (key) => pitchClassColours[parseInt(key)]!
            )}
          />
          <div
            style={{ height: width * 0.13 }}
            className="flex flex-col justify-between overflow-hidden"
          >
            <h1 className="truncate font-display text-lg font-semibold leading-none sm:text-xl">
              {user.username}
            </h1>
            <p className="truncate text-sm text-gray-400 sm:text-base">
              {user.name ?? user.username}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};
export default UserList;
