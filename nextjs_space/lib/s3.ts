
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

export async function uploadFile(buffer: Buffer, fileName: string) {
  const s3Client = createS3Client();
  const { bucketName, folderPrefix } = getBucketConfig();
  
  const key = `${folderPrefix}uploads/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
  });
  
  await s3Client.send(command);
  return key; // Return the cloud_storage_path
}

export async function downloadFile(key: string) {
  const s3Client = createS3Client();
  const { bucketName } = getBucketConfig();
  
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
}

export async function deleteFile(key: string) {
  const s3Client = createS3Client();
  const { bucketName } = getBucketConfig();
  
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  
  await s3Client.send(command);
}

export async function renameFile(oldKey: string, newKey: string) {
  // For S3, we need to copy the object and then delete the old one
  // This would require additional implementation if needed
  throw new Error('Rename functionality not implemented yet');
}
