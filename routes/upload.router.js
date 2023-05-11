const { Router } = require("express");
const { storage } = require("../config/multer.config");
const multer = require("multer");

const uploader = multer({
	storage,
});

const router = Router();

router.post(
	'',
	uploader.single('file'), 
	async (req, res) => {
		const result = req.file

		try {
			return res.status(200).json({
				message: 'File uploaded!',
				filename: result.filename,
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
