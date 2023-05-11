const multer = require('multer')
const path = require('path')

// multer.diskStorage gives you full control of where to store the images
const storage = multer.diskStorage({
	// Choose a destination
	destination: function (req, file, cb) {
		const { path } = req.body
		cb(null, `./public/${path}`);
	},

	// Choose a filename for each uploaded image
	filename: function (req, file, cb) {
		console.log(file);

		const fixedOriginalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
		
		cb(null, fixedOriginalName);
	},
});

module.exports = { storage }