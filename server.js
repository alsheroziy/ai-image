const express = require('express')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()
app.use(cors())
app.use(express.json())

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/')
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname)) // Fayl nomi
	},
})

const upload = multer({ storage: storage })

const uploadsDir = 'uploads'
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir)
}

app.post('/upload', upload.single('image'), (req, res) => {
	try {
		res
			.status(200)
			.json({
				message: 'Image uploaded successfully!',
				filePath: `/uploads/${req.file.filename}`,
			})
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Failed to upload image.', error: error.message })
	}
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/images', (req, res) => {
	fs.readdir(uploadsDir, (err, files) => {
		if (err) {
			return res
				.status(500)
				.json({ message: 'Failed to retrieve images.', error: err.message })
		}

		const images = files.map(file => {
			const filePath = path.join(uploadsDir, file)
			const stats = fs.statSync(filePath)

			return {
				name: file,
				size: stats.size,
				date: stats.birthtime,
			}
		})

		res.status(200).json(images)
	})
})

app.get('/', (req, res) => {
	res.send('Hello World')
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
