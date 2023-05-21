const { Router } = require("express");
const { storage } = require("../config/multer.config");
const multer = require("multer");
const { cloudinary } = require("../config/cloudinary.config");

const uploader = multer({
    storage,
});

const router = Router();

router.post(
    '',
    uploader.single('file'),
    async(req, res) => {
        const { path } = req.body
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: path,
            use_filename: true,
        });

        try {
            return res.status(200).json({
                message: 'File uploaded!',
                secureUrl: result.secure_url,
                result,
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error uploading file',
                error,
            })
        }
    }
);

module.exports = router;