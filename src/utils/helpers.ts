import axios from "axios";

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const postLoved = async (): Promise<{ ok: boolean }> => {
  try {
    await axios.post<{ ok: boolean }>("/api/loved");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
    };
  }
};
