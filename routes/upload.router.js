const { Router } = require("express");
const { storage } = require("../config/multer.config");
const multer = require("multer");
const { cloudinary } = require("../config/cloudinary.config");

const uploader = multer({
    storage,
});

const uploadOptions = {
    use_filename: true
}

const router = Router();

router.post(
    '',
    uploader.single('file'),
    async(req, res) => {
        const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);
        // const result = req.file
        // console.log(result);

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