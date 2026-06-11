const crypto = require('crypto');
const path = require('path');
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } = require('@aws-sdk/client-s3');

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

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
  if (!region || !bucket) {
    throw createHttpError('S3 configuration is missing. Set AWS_REGION and AWS_S3_BUCKET.', 500);
  }
  return { region, bucket };
};

const getS3Client = (region) => {
  if (cachedClient && cachedRegion === region) return cachedClient;

  const hasStaticCredentials =
    Boolean(process.env.AWS_ACCESS_KEY_ID) && Boolean(process.env.AWS_SECRET_ACCESS_KEY);

  cachedClient = new S3Client({
    region,
    credentials: hasStaticCredentials
      ? { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY }
      : undefined,
  });
  cachedRegion = region;
  return cachedClient;
};

const buildPublicUrl = (bucket, region, key) => {
  const encodedKey = encodeURIComponent(key).replace(/%2F/g, '/');
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
};

const deriveResourceType = (mimeType, originalName) => {
  const mime = String(mimeType || '').toLowerCase();
  const ext = path.extname(String(originalName || '')).toLowerCase();

  if (mime === 'application/pdf' || ext === '.pdf') return 'pdf';
  if (
    mime.includes('word') ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === '.doc' || ext === '.docx'
  ) return 'doc';
  if (
    mime.includes('spreadsheet') ||
    mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    ext === '.xls' || ext === '.xlsx' || ext === '.csv'
  ) return 'spreadsheet';
  if (
    mime.includes('presentation') ||
    mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    ext === '.ppt' || ext === '.pptx'
  ) return 'presentation';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (
    mime === 'application/zip' ||
    mime === 'application/x-rar-compressed' ||
    mime === 'application/x-zip-compressed' ||
    ext === '.zip' || ext === '.rar' || ext === '.7z' || ext === '.tar' || ext === '.gz'
  ) return 'archive';
  if (mime === 'text/plain' || ext === '.txt') return 'text';
  if (
    mime === 'text/html' || mime === 'application/json' ||
    ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.html', '.css', '.json', '.xml', '.yaml', '.yml'].includes(ext)
  ) return 'code';

  return 'other';
};

async function uploadCourseResource({ buffer, contentType, originalName, courseId }) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw createHttpError('File is empty.', 400);
  }
  if (buffer.length > MAX_FILE_SIZE) {
    throw createHttpError('File exceeds the 50 MB limit.', 400);
  }

  const { region, bucket } = getRequiredS3Config();
  const s3Client = getS3Client(region);

  const ext = path.extname(String(originalName || '')).toLowerCase() || '';
  const safeId = Number.isInteger(Number(courseId)) ? Number(courseId) : 0;
  const key = `courses/resources/${safeId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
      ContentDisposition: `attachment; filename="${encodeURIComponent(String(originalName || 'file'))}"`,
    })
  );

  return {
    key,
    url: buildPublicUrl(bucket, region, key),
    resourceType: deriveResourceType(contentType, originalName),
    fileSize: buffer.length,
  };
}

async function deleteCourseResource(s3Key) {
  if (!s3Key) return;
  const { region, bucket } = getRequiredS3Config();
  const s3Client = getS3Client(region);
  await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: s3Key }));
}

async function streamCourseResourceToResponse(s3Key, { contentType, originalName, fileSize }, res) {
  const { region, bucket } = getRequiredS3Config();
  const s3Client = getS3Client(region);

  const command = new GetObjectCommand({ Bucket: bucket, Key: s3Key });
  const s3Response = await s3Client.send(command);

  const mime = contentType || s3Response.ContentType || 'application/octet-stream';
  const filename = encodeURIComponent(String(originalName || path.basename(s3Key)));
  const size = fileSize || s3Response.ContentLength;

  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'private, no-cache');
  if (size) res.setHeader('Content-Length', size);

  s3Response.Body.pipe(res);
}

module.exports = { uploadCourseResource, deleteCourseResource, streamCourseResourceToResponse, deriveResourceType, MAX_FILE_SIZE };
