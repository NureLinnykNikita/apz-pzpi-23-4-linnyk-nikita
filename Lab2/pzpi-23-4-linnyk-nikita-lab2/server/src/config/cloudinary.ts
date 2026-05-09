import {v2 as cloudinary} from 'cloudinary';
import {CloudinaryStorage} from "multer-storage-cloudinary";
import {ENV} from "./env";

cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folderName = 'langbang/misc';
        let resourceType = 'auto';

        if (file.mimetype.startsWith('image')) {
            folderName = 'langbang/images';
        } else if (file.mimetype.startsWith('audio')) {
            folderName = 'langbang/audio';
            resourceType = 'video';
        }

        return {
            folder: folderName,
            resource_type: resourceType,
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
        };
    },
});

export { cloudinary, storage };