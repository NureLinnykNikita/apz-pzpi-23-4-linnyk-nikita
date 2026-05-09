import multer from 'multer';
import { storage } from '../config/cloudinary';

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'audio/mpeg',
        'audio/wav',
        'audio/mp3'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and audio are allowed.'), false);
    }
};

export const uploadMiddleware = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: fileFilter
});