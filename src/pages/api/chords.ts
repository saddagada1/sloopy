import path from "path";
import { promises as fs } from "fs";
import { type NextApiRequest, type NextApiResponse } from "next";

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const chords = await fs.readFile(
      path.join(process.cwd(), "public", "chords.json"),
      "utf-8"
    );
    console.log(chords);
    res.status(200).json(JSON.parse(chords));
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

export default handler;
