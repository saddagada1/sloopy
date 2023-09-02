import { useEffect, useState } from "react";

export const useSpotifyWebSDK = (token?: string) => {
  const [player, setPlayer] = useState<Spotify.Player>();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    if (!token) return;

    const player = new window.Spotify.Player({
      name: "Sloopy Spotify Player",
      getOAuthToken: (cb) => {
        cb(token);
      },
      volume: 0.5,
    });

    setPlayer(player);

    player.addListener("ready", ({ device_id }) => {
      setDeviceId(device_id);
      setIsReady(true);
    });
    player.addListener("not_ready", ({ device_id }) => {
      setDeviceId(device_id);
      setIsReady(false);
    });
    player.addListener("initialization_error", (error) => {
      setError("init: " + error.message);
    });
    player.addListener("authentication_error", (error) => {
      setError("auth: " + error.message);
    });
    player.addListener("account_error", (error) => {
      setError("acc: " + error.message);
    });
    player.addListener("playback_error", (error) => {
      setError("play: " + error.message);
    });

    void player.connect();

    return () => {
      player.removeListener("ready");
      player.removeListener("not_ready");
      player.removeListener("initialization_error");
      player.removeListener("authentication_error");
      player.removeListener("account_error");
      player.removeListener("playback_error");
      player.disconnect();
    };
  }, [token]);

  return { player, isReady, error, deviceId };
};
