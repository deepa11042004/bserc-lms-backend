const crypto = require('crypto');
const path = require('path');
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const MAX_FILE_SIZE = 50 * 1024 * 1024;

let cachedClient = null;
let cachedRegion = null;

const createHttpError = (message, status = 500) => {
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

const buildPublicUrl = (bucket, region, key) =>
  `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key).replace(/%2F/g, '/')}`;

async function uploadAssignmentFile({ buffer, contentType, originalName }) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0)
    throw createHttpError('File is empty.', 400);
  if (buffer.length > MAX_FILE_SIZE)
    throw createHttpError('File exceeds the 50 MB limit.', 400);

  const { region, bucket } = getRequiredS3Config();
  const s3 = getS3Client(region);
  const ext = path.extname(String(originalName || '')).toLowerCase() || '';
  const key = `assignments/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
      ContentDisposition: `attachment; filename="${encodeURIComponent(String(originalName || 'file'))}"`,
    })
  );

  return { key, url: buildPublicUrl(bucket, region, key), fileSize: buffer.length };
}

async function streamAssignmentToResponse(s3Key, { contentType, originalName, fileSize }, res) {
  const { region, bucket } = getRequiredS3Config();
  const s3 = getS3Client(region);
  const s3Response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: s3Key }));

  const mime = contentType || s3Response.ContentType || 'application/octet-stream';
  const filename = encodeURIComponent(String(originalName || path.basename(s3Key)));
  const size = fileSize || s3Response.ContentLength;

  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'private, no-cache');
  if (size) res.setHeader('Content-Length', size);

  s3Response.Body.pipe(res);
}

async function deleteAssignmentFile(s3Key) {
  if (!s3Key) return;
  const { region, bucket } = getRequiredS3Config();
  const s3 = getS3Client(region);
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: s3Key }));
}

module.exports = { uploadAssignmentFile, streamAssignmentToResponse, deleteAssignmentFile, MAX_FILE_SIZE };
