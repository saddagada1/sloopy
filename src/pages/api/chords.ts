import path from "path";
import { promises as fs } from "fs";
import { type NextApiRequest, type NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const chords = await fs.readFile(
    path.resolve(process.cwd(), "./public/chords.json"),
    "utf-8"
  );
  res.status(200).json(JSON.parse(chords));
};

export default handler;
