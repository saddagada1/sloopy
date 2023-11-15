export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const putImage = async (url: string, file: File) => {
  const response = await fetch(url, { method: "PUT", body: file });
  if (response.status === 200) {
    return true;
  }
  return false;
};
