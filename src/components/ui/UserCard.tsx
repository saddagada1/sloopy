import Link from "next/link";
import SafeImage from "./SafeImage";
import { pitchClassColours } from "~/utils/constants";

interface UserCardProps {
  width: number;
  user: {
    username: string;
    image: string | null;
  };
}

const UserCard: React.FC<UserCardProps> = ({ width, user }) => {
  return (
    <Link style={{ width: width / 3 }} href={`/${user.username}`}>
      <SafeImage
        className="relative mb-2 aspect-square overflow-hidden rounded-full"
        url={user.image}
        alt={user.username}
        width={width / 3}
        colours={Object.keys(pitchClassColours).map(
          (key) => pitchClassColours[parseInt(key)]!
        )}
      />
      <p className="truncate text-sm font-semibold sm:text-base">
        {user.username}
      </p>
    </Link>
  );
};

export default UserCard;
