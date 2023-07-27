import { type Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";

interface StyledLinkProps {
  label: string;
  href: Url;
  style?: React.CSSProperties;
}

const StyledLink: React.FC<StyledLinkProps> = ({ label, href, style }) => {
  return (
    <div className="w-full text-xs underline sm:text-sm" style={style}>
      <Link href={href}>{`${label}`}</Link>
    </div>
  );
};
export default StyledLink;
