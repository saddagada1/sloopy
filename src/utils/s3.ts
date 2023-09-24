import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/env.mjs";

const s3 = new S3Client({
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_ACCESS_KEY_SECRET,
  },
  region: env.S3_REGION,
});

export const getObject = async (image: string) => {
  const get_params = {
    Bucket: env.S3_NAME,
    Key: image,
  };
  const get_command = new GetObjectCommand(get_params);
  const get_signed_url = await getSignedUrl(s3, get_command, {
    expiresIn: 3600,
  });

  return get_signed_url;
};

export const getObjects = async (images: string[]) => {
  const get_params = images.map((name) => ({
    Bucket: env.S3_NAME,
    Key: name,
  }));
  const get_commands = get_params.map((params) => new GetObjectCommand(params));
  const get_signed_urls = get_commands.map(
    async (command) => await getSignedUrl(s3, command, { expiresIn: 3600 })
  );
  return Promise.all(get_signed_urls);
};

export const uploadObject = async (image: string) => {
  const upload_params = {
    Bucket: env.S3_NAME,
    Key: image,
  };
  const upload_command = new PutObjectCommand(upload_params);
  const upload_signed_url = await getSignedUrl(s3, upload_command, {
    expiresIn: 60,
  });
  return upload_signed_url;
};

export const deleteObject = async (image: string) => {
  const delete_params = {
    Bucket: env.S3_NAME,
    Key: image,
  };
  const delete_command = new DeleteObjectCommand(delete_params);
  await s3.send(delete_command);
};
