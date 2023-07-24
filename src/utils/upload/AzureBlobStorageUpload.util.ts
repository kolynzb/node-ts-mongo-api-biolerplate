import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { Readable } from 'stream';
import errorHandler from '../errors/decorators/errorHandler.util';
import stream2Buffer from './Stream2Buffer.util';

export interface FileMetadata {
  url: string;
  type: string;
  size: number;
  name: string;
}

/**
 * The `AzureBlobStorageUpload` utility class provides methods for uploading, downloading, deleting, checking file existence, and updating file metadata in Azure Blob Storage. The `uploadFile` method uploads a file and returns its metadata, while the `downloadFile` method downloads a file as a buffer. The `deleteFile` method deletes a file, the `fileExists` method checks if a file exists, and the `updateFileMetadata` method updates the metadata of a file.
 *
 */

export default class AzureBlobStorageUpload {
  private blobServiceClient: BlobServiceClient;

  private containerName: string;

  /**
   * Create an instance of AzureBlobStorageUpload.
   * @param {string} connectionString - The connection string for the Azure Storage account.
   * @param {string} containerName - The name of the container in which the files will be stored.
   * @param {string} accountName - The name of the Azure Storage account.
   * @param {string} accountKey - The access key for the Azure Storage account.
   */
  constructor(containerName: string, connectionString?: string, accountName?: string, accountKey?: string) {
    this.containerName = containerName;

    accountName = accountName || process.env.AZURE_STORAGE_ACCOUNT_NAME;
    accountKey = accountKey || process.env.AZURE_STORAGE_ACCOUNT_KEY;
    connectionString = connectionString || process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!accountName || !accountKey || !connectionString)
      throw new Error('Azure Storage account name, account key, and connection string must be provided.');

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    this.blobServiceClient = new BlobServiceClient(connectionString, sharedKeyCredential);
  }

  /**
   *Upload a file to Azure Blob Storage.
   *@param {Readable} fileStream - The file stream to upload.
   *@param {string} fileName - The name of the file.
   *@returns {Promise<FileMetadata>} A promise that resolves to the file metadata.
   */
  @errorHandler
  async uploadFile(fileBuffer: Buffer, fileName: string): Promise<FileMetadata> {
    // Get or create the container
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    await containerClient.createIfNotExists();

    // Create a BlockBlobClient to upload the file
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Upload the file stream
    const fileStream = Readable.from(fileBuffer);
    await blockBlobClient.uploadStream(fileStream);

    // Get the properties of the uploaded file
    const fileProperties = await blockBlobClient.getProperties();

    const fileMetadata: FileMetadata = {
      name: fileName,
      type: fileProperties.contentType || '',
      size: fileProperties.contentLength || 0,
      url: blockBlobClient.url,
    };

    return fileMetadata;
  }

  /**
   *Download a file from Azure Blob Storage as a buffer.
   *@param {string} fileUrl - The URL of the file.
   *@returns {Promise<Buffer>} A promise that resolves to the file buffer.
   */
  @errorHandler
  async downloadFile(fileUrl: string): Promise<Buffer> {
    // Create a BlockBlobClient for the file
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileUrl);

    // Download the file and return as a buffer
    const downloadResponse = await blockBlobClient.download();
    const buffer = await stream2Buffer(downloadResponse.readableStreamBody as Readable);

    return buffer;
  }

  /**
   *Delete a file from Azure Blob Storage.
   *@param {string} fileUrl - The URL of the file.
   *@returns {Promise<void>} A promise that resolves when the file is deleted.
   */
  @errorHandler
  async deleteFile(fileUrl: string): Promise<void> {
    // Create a BlockBlobClient for the file
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileUrl);

    // Delete the file
    await blockBlobClient.delete();
  }

  /**
   *Check if a file exists in Azure Blob Storage.
   *@param {string} fileUrl - The URL of the file.
   *@returns {Promise<boolean>} A promise that resolves to true if the file exists, false otherwise.
   */
  @errorHandler
  async fileExists(fileUrl: string): Promise<boolean> {
    // Create a BlockBlobClient for the file
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileUrl);

    // Check if the file exists
    const existsResponse = await blockBlobClient.exists();

    return existsResponse;
  }

  /**
   *Update the metadata of a file in Azure Blob Storage.
   *@param {string} fileUrl - The URL of the file.
   *@param {Object} metadata - The metadata object to update.
   *@returns {Promise<void>} A promise that resolves when the metadata is updated.
   */
  @errorHandler
  async updateFileMetadata(fileUrl: string, metadata: { [key: string]: string }): Promise<void> {
    // Create a BlockBlobClient for the file
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileUrl);

    // Update the file's metadata
    await blockBlobClient.setMetadata(metadata);
  }
}
