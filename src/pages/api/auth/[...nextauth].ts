import { type NextApiRequest, type NextApiResponse } from "next";
import NextAuth from "next-auth/next";
import { authOptions } from "~/server/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await NextAuth(req, res, authOptions(req, res));
}
