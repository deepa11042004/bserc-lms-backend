const crypto = require('crypto');
const path = require('path');
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

let cachedClient = null;
let cachedRegion = null;

const createHttpError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const getRequiredS3Config = () => {
  const region = String(process.env.AWS_REGION || '').trim();
  const bucket = String(process.env.AWS_S3_BUCKET || '').trim();
  if (!region || !bucket) throw createHttpError('S3 configuration missing.', 500);
  return { region, bucket };
};

const getS3Client = (region) => {
  if (cachedClient && cachedRegion === region) return cachedClient;
  const hasStatic = Boolean(process.env.AWS_ACCESS_KEY_ID) && Boolean(process.env.AWS_SECRET_ACCESS_KEY);
  cachedClient = new S3Client({
    region,
    credentials: hasStatic
      ? { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY }
      : undefined,
  });
  cachedRegion = region;
  return cachedClient;
};

async function uploadAvatar({ buffer, contentType, originalName, userId }) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0)
    throw createHttpError('File is empty.');
  if (buffer.length > MAX_AVATAR_SIZE)
    throw createHttpError('Avatar must be under 5 MB.');
  if (!ALLOWED_TYPES.includes(contentType))
    throw createHttpError('Only JPEG, PNG, WebP or GIF images are allowed.');

  const { region, bucket } = getRequiredS3Config();
  const s3 = getS3Client(region);
  const ext = path.extname(String(originalName || '')).toLowerCase() || '.jpg';
  const key = `users/avatars/${userId}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  // Return only the key — the URL is the backend proxy endpoint
  return { key };
}

async function streamAvatarToResponse(s3Key, res) {
  const { region, bucket } = getRequiredS3Config();
  const s3 = getS3Client(region);
  const s3Response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: s3Key }));

  res.setHeader('Content-Type', s3Response.ContentType || 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 24h in browser
  if (s3Response.ContentLength) res.setHeader('Content-Length', s3Response.ContentLength);

  s3Response.Body.pipe(res);
}

async function deleteAvatar(s3Key) {
  if (!s3Key) return;
  const { region, bucket } = getRequiredS3Config();
  const s3 = getS3Client(region);
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: s3Key }));
}

module.exports = { uploadAvatar, streamAvatarToResponse, deleteAvatar, MAX_AVATAR_SIZE };
