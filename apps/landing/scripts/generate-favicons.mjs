import sharp from "sharp"
import { readFileSync, writeFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, "../public")
const svg = readFileSync(resolve(publicDir, "favicon.svg"))

const sizes = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "favicon-48x48.png", size: 48 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "favicon-192x192.png", size: 192 },
  { name: "favicon-512x512.png", size: 512 },
]

// Generate PNGs
for (const { name, size } of sizes) {
  await sharp(svg).resize(size, size).png().toFile(resolve(publicDir, name))
  console.log(`Created ${name}`)
}

// Generate ICO (16x16 + 32x32 + 48x48 packed as PNG-in-ICO)
const ico16 = await sharp(svg).resize(16, 16).png().toBuffer()
const ico32 = await sharp(svg).resize(32, 32).png().toBuffer()
const ico48 = await sharp(svg).resize(48, 48).png().toBuffer()

function createIco(images) {
  const count = images.length
  const headerSize = 6
  const dirEntrySize = 16
  const dataOffset = headerSize + dirEntrySize * count

  let offset = dataOffset
  const entries = []
  for (const img of images) {
    const size = img.size <= 255 ? img.size : 0
    const entry = Buffer.alloc(dirEntrySize)
    entry.writeUInt8(size, 0)       // width
    entry.writeUInt8(size, 1)       // height
    entry.writeUInt8(0, 2)          // color palette
    entry.writeUInt8(0, 3)          // reserved
    entry.writeUInt16LE(1, 4)       // color planes
    entry.writeUInt16LE(32, 6)      // bits per pixel
    entry.writeUInt32LE(img.data.length, 8)  // data size
    entry.writeUInt32LE(offset, 12) // data offset
    entries.push(entry)
    offset += img.data.length
  }

  const header = Buffer.alloc(headerSize)
  header.writeUInt16LE(0, 0)     // reserved
  header.writeUInt16LE(1, 2)     // ICO type
  header.writeUInt16LE(count, 4) // image count

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)])
}

const icoBuffer = createIco([
  { size: 16, data: ico16 },
  { size: 32, data: ico32 },
  { size: 48, data: ico48 },
])

writeFileSync(resolve(publicDir, "favicon.ico"), icoBuffer)
console.log("Created favicon.ico")

console.log("Done!")
