import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_APY_KEY, 
    api_secret: process.env.CLOUDINARY_APY_SECRET // Click 'View API Keys' above to copy your API secret
});

export default cloudinary