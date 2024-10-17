import multer from "multer";
import { Client } from "basic-ftp";
import { Readable } from "stream";
import path from "path";

// Constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];

// Functions
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, JPG, and PNG files are allowed.")
    );
  }
};

const ensureDirectoryExists = async (client, dirPath) => {
  const parts = dirPath.split("/").filter((part) => part !== "");
  let currentPath = "/";

  for (const part of parts) {
    currentPath = path.posix.join(currentPath, part);
    try {
      await client.ensureDir(currentPath);
    } catch (error) {
      console.error(`Error creating directory ${currentPath}:`, error);
      throw error;
    }
  }
};

const uploadToFTP = async (file, folder) => {
  const client = new Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secureOptions: {
        rejectUnauthorized: false, // Disable strict checking (use with caution)
      },
      secure: true, // Use FTPS if the server supports it
      timeout: 30000000, // 30 seconds timeout
    });

    const remoteDirPath = `/${folder}`;
    const remoteFilePath = `${remoteDirPath}/${file.originalname}`;

    await ensureDirectoryExists(client, remoteDirPath);
    const fileStream = new Readable();
    fileStream.push(file.buffer);
    fileStream.push(null);
    await client.uploadFrom(fileStream, remoteFilePath);

    return `/${folder}/${file.originalname}`;
  } catch (error) {
    console.error("FTP Error:", error);
    throw error;
  } finally {
    client.close();
  }
};

const uploadFile = (fieldName, folder) => {
  return async (req, res, next) => {
    try {
      await new Promise((resolve, reject) => {
        multer({
          storage: multer.memoryStorage(),
          fileFilter,
          limits: {
            fileSize: MAX_FILE_SIZE,
          },
        }).single(fieldName)(req, res, (err) => {
          if (err instanceof multer.MulterError) {
            reject(new Error("File upload error: " + err.message));
          } else if (err) {
            reject(new Error("Server error: " + err.message));
          } else {
            resolve();
          }
        });
      });

      if (!req.file) {
        throw new Error("No file uploaded.");
      }

      const ftpPath = await uploadToFTP(req.file, folder);
      req.uploadedFile = {
        filename: req.file.originalname,
        path: "https://muhamadzafarsyah.com" + ftpPath,
      };
      next();
    } catch (error) {
      console.error("Upload Error:", error);
      res.status(400).json({ error: error.message });
    }
  };
};

export default uploadFile;
