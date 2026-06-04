import { TLAssetStore } from 'tldraw'

const MAX_INPUT_IMAGE_SIZE = 15 * 1024 * 1024 // accepts images up to 15 MB
const MAX_OUTPUT_DATA_URL_SIZE = 5 * 1024 * 1024 // tries to keep stored image under 5 MB
const MAX_IMAGE_DIMENSION = 1800 // resizes huge images down for performance

function fileToDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()

		reader.onerror = () => reject(new Error('Failed to read image file.'))

		reader.onload = () => {
			if (typeof reader.result !== 'string') {
				reject(new Error('Image could not be converted to a data URL.'))
				return
			}

			resolve(reader.result)
		}

		reader.readAsDataURL(file)
	})
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image()

		image.onload = () => resolve(image)
		image.onerror = () => reject(new Error('Failed to load image.'))

		image.src = src
	})
}

function canvasToDataUrl(canvas: HTMLCanvasElement, quality: number): string {
	// WebP gives much smaller files than PNG/JPG in most browsers.
	const webp = canvas.toDataURL('image/webp', quality)

	// Some browsers may silently fail WebP and return PNG.
	// Still okay because it remains a data URL.
	return webp
}

async function compressImageToDataUrl(file: File): Promise<string> {
	const originalDataUrl = await fileToDataUrl(file)
	const image = await loadImage(originalDataUrl)

	let width = image.width
	let height = image.height

	const largestSide = Math.max(width, height)

	if (largestSide > MAX_IMAGE_DIMENSION) {
		const scale = MAX_IMAGE_DIMENSION / largestSide
		width = Math.round(width * scale)
		height = Math.round(height * scale)
	}

	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height

	const ctx = canvas.getContext('2d')

	if (!ctx) {
		throw new Error('Could not prepare image compression.')
	}

	ctx.drawImage(image, 0, 0, width, height)

	const qualities = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35]

	for (const quality of qualities) {
		const compressedDataUrl = canvasToDataUrl(canvas, quality)

		if (compressedDataUrl.length <= MAX_OUTPUT_DATA_URL_SIZE) {
			return compressedDataUrl
		}
	}

	// Last attempt: smaller dimensions
	const smallerCanvas = document.createElement('canvas')
	smallerCanvas.width = Math.round(width * 0.7)
	smallerCanvas.height = Math.round(height * 0.7)

	const smallerCtx = smallerCanvas.getContext('2d')

	if (!smallerCtx) {
		throw new Error('Could not prepare smaller image compression.')
	}

	smallerCtx.drawImage(image, 0, 0, smallerCanvas.width, smallerCanvas.height)

	const finalDataUrl = canvasToDataUrl(smallerCanvas, 0.35)

	if (finalDataUrl.length > MAX_OUTPUT_DATA_URL_SIZE) {
		alert('This image is still too large after compression. Try a smaller image or screenshot.')
		throw new Error('Compressed image is still too large.')
	}

	return finalDataUrl
}

export const multiplayerAssetStore: TLAssetStore = {
	async upload(_asset, file) {
		if (!file.type.startsWith('image/')) {
			alert('Only image uploads are supported in this free deployment.')
			throw new Error('Only image uploads are supported.')
		}

		if (file.size > MAX_INPUT_IMAGE_SIZE) {
			alert('Image is too large. Please use an image smaller than 15 MB.')
			throw new Error('Image is too large. Maximum input size is 15 MB.')
		}

		const src = await compressImageToDataUrl(file)

		return {
			src,
			meta: {
				storage: 'compressed-data-url',
				originalFileName: file.name,
				originalFileSize: file.size,
			},
		}
	},

	resolve(asset) {
		return asset.props.src
	},

	async remove(_assetIds) {
		// No external storage cleanup needed because images are stored inside the board data.
	},
}
