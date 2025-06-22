import { BadRequest } from './enums';
import { PathLike, writeFile } from 'fs';
import * as fs from 'fs/promises';
import * as mime from '../../node_modules/mime-types';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { IUploadedFile } from './interfaces';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { extname } from 'path';

const imageMimeTypes = [
  'image/gif',
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/svg',
  'image/webp',
  'image/tif',
  'image/tiff',
  'image/bmp',
];

const zippedMimeTypes = [
  'application/zip',
 
];

const excelMimeTypes = [
  'file/xlsx',
];


const audioMimeTypes = [
  'audio/aac',
  'audio/wav',
  'audio/wave',
  'audio/webm',
  'audio/mpeg',
  'audio/mp4',
  'audio/x-mpegurl',
  'audio/ogg',
  'audio/x-wav',
  'audio/vnd.wav',
];

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

export const acceptZippedFiles = function (_, file: Express.Multer.File, cb) {
  console.log(file.mimetype)
  let error = BadRequest.REJECTED_FILE(zippedMimeTypes);

  const isValid = zippedMimeTypes.includes(file.mimetype);

  if (isValid) error = null;

  cb(error, isValid);
};
export const getFileFilterOf = (allowedMimeTypes: string[]) =>
  function (_, file: Express.Multer.File, cb) {
    let error = BadRequest.REJECTED_FILE(allowedMimeTypes);
    const isValid = allowedMimeTypes.includes(file.mimetype);
    if (isValid) error = null;
    cb(error, isValid);
  };
export const pdfFileInterceptor = FileInterceptor('file', {
  fileFilter: getFileFilterOf(['application/pdf']),
  storage: diskStorage({
    destination: './public/uploads/contracts',
    filename: editFileName,
  }),
});

export const acceptImageFiles = function (_, file: Express.Multer.File, cb) {
  let error = BadRequest.REJECTED_FILE(imageMimeTypes);

  const isValid = imageMimeTypes.includes(file.mimetype);

  if (isValid) error = null;

  cb(error, isValid);
};

export const acceptAudioFiles = function (_, file: Express.Multer.File, cb) {
  acceptFiles(audioMimeTypes, file, cb);
};

export const acceptExcelFiles = function (_, file: Express.Multer.File, cb) {
  let error = BadRequest.REJECTED_FILE(excelMimeTypes);

  const isValid = excelMimeTypes.includes(file.mimetype);
  

  if (isValid) error = null;

  cb(error, isValid);
};

const acceptFiles = function (
  supportedMimeTypes: string[],
  file: Express.Multer.File,
  cb,
) {
  let error = BadRequest.REJECTED_FILE(supportedMimeTypes);

  const isValid = supportedMimeTypes.includes(file.mimetype);

  if (isValid) error = null;

  cb(error, isValid);
};

export const setUploadedFileName = function (
  req,
  file: Express.Multer.File,
  cb,
) {
  let fileExt: string = mime.extension(file.mimetype);

  const originalnameHasExt = () => {
    const filename = file.originalname.toLowerCase();
    let hasExt = filename.includes(fileExt, -fileExt?.length);

    // if extension is jpg instead of jpeg
    if (fileExt == 'jpeg' && !hasExt) {
      hasExt = filename.includes('jpg', -3);
    }

    return hasExt;
  };

  if (originalnameHasExt()) fileExt = null;

  const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  cb(
    null,
    uniquePrefix + '-' + file.originalname + `${fileExt ? '.' + fileExt : ''}`,
  );
};

export const photoFileInterceptor = FileInterceptor('photo', {
  fileFilter: acceptImageFiles,
  storage: diskStorage({
    destination: './public/uploads',
    filename: editFileName,
  }),
});

export const orderAttachmentFileInterceptor = FileInterceptor('file', {
  fileFilter: acceptAudioFiles,
  storage: diskStorage({
    destination: './public/uploads/orders/attachments',
    filename: setUploadedFileName,
  }),
});

export function saveImageBase64(
  data: string,
  // uploadPath?: string,
): Promise<IUploadedFile> {
  const logger = new Logger(saveImageBase64.name);
  return new Promise((resolve, reject) => {
    if (data) {
      const matches = data.match(/data:([A-Za-z-+\/]+);base64,(.+)$/);
      const image: any = {};
      if (typeof matches !== null && matches?.length !== 3) {
        throw BadRequest.VALIDATION('photo', 'invalid base64');
      }
      image.type = matches[1];

      const matchedType = imageMimeTypes[image.type];
      
      if (matchedType) {
        image.extName = matchedType;
      } else {
        image.extName = '.jpg';
      }
      image.name = Math.random().toString(36).substr(2, 9) + image.extName;
      image.data = Buffer.from(matches[2], 'base64');
      image.url = `./public/uploads/${image.name}`;
      image.path = `public/uploads/${image.name}`;
      // write the image
      writeFile(image.url, image.data, (err) => {
        if (err) {
          logger.error(err);
          throw new InternalServerErrorException(
            err,
            'failed to save the photo',
          );
        } else {
          return resolve({ name: image.name, path: image.path });
        }
      });
    } else {
      throw BadRequest.VALIDATION('photo', 'invalid base64');
    }
  });
}

export function deleteFile(path: PathLike) {
  fs.unlink(path)
  .then(() => {})
  .catch(console.error);
}
