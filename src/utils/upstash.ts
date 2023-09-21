import { Redis } from "@upstash/redis";
import { Kafka } from "@upstash/kafka";
import { env } from "~/env.mjs";

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export const kafka = new Kafka({
  url: env.UPSTASH_KAFKA_REST_URL,
  username: env.UPSTASH_KAFKA_REST_USERNAME,
  password: env.UPSTASH_KAFKA_REST_PASSWORD,
});
