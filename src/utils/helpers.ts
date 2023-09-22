import axios from "axios";
import { type Chords } from "./types";

export const fetchChords = async (): Promise<
  { ok: true; data: Chords } | { ok: false }
> => {
  try {
    const response = await axios.get<Chords>("/api/chords");
    return { ok: true, data: response.data };
  } catch (error) {
    return {
      ok: false,
    };
  }
};
