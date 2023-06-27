import path from 'node:path';
import { fileURLToPath } from 'url';
import fs from 'node:fs'
import { createReadStream, createWriteStream } from 'fs'
import os from 'node:os'
import { createHash } from 'node:crypto'
import { createBrotliCompress, createBrotliDecompress } from 'node:zlib'
import { pipeline } from 'node:stream/promises'


let directory = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.splice(2)
const user = args[0].match(/=(.+)/)[1]

function writeToConsole() {
    process.stdout.write(directory)
    process.stdout.write('\n')
}

process.stdout.write(`Welcome to the File Manager, ${user}!\n`)
writeToConsole()

process.stdin.on('data', (chunk) => {
    try {
        const [_m, operation, arg] = chunk.toString().match(/([a-z]+) ?([^\r\n]+)?/);
        if (operation.startsWith('up')) {
            directory = path.resolve(directory, '..')
            writeToConsole()
        } else if (operation.startsWith('cd')) {
            directory = path.resolve(directory, arg)
            writeToConsole()
        } else if (operation === 'ls') {
            let list = fs.readdirSync(directory, { withFileTypes: true })
            let dirs = []
            let files = []
            list.forEach(elem => {
                if (elem.isFile()) {
                    files.push({ Name: elem.name, Type: 'file' })
                } else {
                    dirs.push({ Name: elem.name, Type: 'directory' })
                }
            })
            dirs.sort((a, b) => {
                const nameA = a.Name.toUpperCase();
                const nameB = b.Name.toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            })
            files.sort((a, b) => {
                const nameA = a.Name.toUpperCase();
                const nameB = b.Name.toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            })
            console.table([...dirs, ...files], ['Name', 'Type'])
            writeToConsole()
        } else if (operation === 'cat') {
            const file = path.resolve(directory, arg);
            console.log(file)
            const readable = createReadStream(file)
            readable.pipe(process.stdout)
            writeToConsole()
        } else if (operation === 'add') {
            const newPath = path.resolve(directory, arg)
            fs.writeFileSync(newPath, '')
            writeToConsole()
        } else if (operation === 'rn') {
            const [arg1, arg2] = arg.split(' ')
            const oldPath = path.resolve(directory, arg1)
            const newPath = path.resolve(path.dirname(oldPath), arg2)
            console.log(newPath)
            fs.renameSync(oldPath, newPath)
            writeToConsole()
        } else if (operation === 'cp') {
            const [arg1, arg2] = arg.split(' ')
            const oldPath = path.resolve(directory, arg1)
            const newPath = path.resolve(directory, arg2, path.basename(oldPath));
            fs.writeFileSync(newPath, '')
            const readable = createReadStream(oldPath)
            const writable = createWriteStream(newPath)
            readable.pipe(writable)
            writeToConsole()
        } else if (operation === 'mv') {
            const [arg1, arg2] = arg.split(' ')
            const oldPath = path.resolve(directory, arg1)
            const newPath = path.resolve(directory, arg2, path.basename(oldPath));
            fs.writeFileSync(newPath, '')
            const readable = createReadStream(oldPath)
            const writable = createWriteStream(newPath)
            readable.pipe(writable)
            readable.on('end', () => fs.unlinkSync(oldPath))
            writeToConsole()
        } else if (operation === 'rm') {
            const pathToDelete = path.resolve(directory, arg)
            fs.unlinkSync(pathToDelete)
            writeToConsole()
        } else if (operation === 'os' && arg === '--EOL') { // please use cmd or bash, bc in Webstorm it simply doesn't work
            const eol = os.EOL
            console.log(JSON.stringify(eol))
            writeToConsole()
        } else if (arg === '--cpus') {
            let aggerator = 0
            os.cpus().forEach((cpu) => {
                console.log(cpu.model)
                aggerator += 1
            })
            console.log(`Total number of cores - ${aggerator}`)
            writeToConsole()
        } else if (arg === '--homedir') {
            console.log(`Your home directory is ${os.homedir()}`)
            writeToConsole()
        } else if (arg === '--username') {
            console.log(`System username is ${os.userInfo().username}`)
            writeToConsole()
        } else if (arg === '--architecture') {
            console.log(`Your GPU architecture is ${os.arch()}`)
            writeToConsole()
        } else if (operation === 'hash') {
            const hash = createHash('sha256')
            const truePath = path.resolve(directory, arg)
            const input = createReadStream(truePath)
            input.pipe(hash).setEncoding('hex').pipe(process.stdout);
            writeToConsole()
        } else if (operation === 'compress') {
            const [fileToCompress, destination] = arg.split(' ')
            const oldPath = path.resolve(directory, fileToCompress)
            if (path.sep === `\\`) {
                const separatedName = oldPath.split('\\')
                const oldFileName = separatedName[separatedName.length - 1]
                const newPath = path.resolve(directory, destination, oldFileName + '.gz')
                fs.writeFileSync(newPath, '')
                const gzip = createBrotliCompress()
                const readable = createReadStream(oldPath)
                const writable = createWriteStream(newPath)

                async function compressToZlib() {
                    await pipeline(readable, gzip, writable)
                }

                compressToZlib().then((e) => console.log('Done!'))
            } else {
                const separatedName = oldPath.split('/')
                const oldFileName = separatedName[separatedName.length - 1]
                const newPath = path.resolve(directory, destination, oldFileName + '.gz')
                fs.writeFileSync(newPath, '')
                const gzip = createBrotliCompress()
                const readable = createReadStream(oldPath)
                const writable = createWriteStream(newPath)

                async function compressToZlib() {
                    await pipeline(readable, gzip, writable)
                }

                compressToZlib().then((e) => console.log('Done!'))
            }

        } else if (operation === 'decompress') {
            const [fileToDecompress, destination] = arg.split(' ')
            const oldPath = path.resolve(directory, fileToDecompress)
            if (path.sep === `\\`) {
                const separatedName = oldPath.split('\\')
                const oldFileName = separatedName[separatedName.length - 1]
                const newPath = path.resolve(directory, destination, oldFileName.slice(0, -3))
                fs.writeFileSync(newPath, '')
                const gzip = createBrotliDecompress()
                const readable = createReadStream(oldPath)
                const writable = createWriteStream(newPath)

                async function decompressFromZlib() {
                    await pipeline(readable, gzip, writable)
                }

                decompressFromZlib().then((e) => console.log('Done!'))
            } else {
                const separatedName = oldPath.split('/')
                const oldFileName = separatedName[separatedName.length - 1]
                const newPath = path.resolve(directory, destination, oldFileName.slice(0, -3))
                fs.writeFileSync(newPath, '')
                const gzip = createBrotliDecompress()
                const readable = createReadStream(oldPath)
                const writable = createWriteStream(newPath)

                async function decompressFromZlib() {
                    await pipeline(readable, gzip, writable)
                }

                decompressFromZlib().then((e) => console.log('Done!'))
            }
        } else {
            console.log('Invalid input')
        }
    } catch {
        console.log('Operation failed')
    }


})

// process.stdout.end()
process.on('SIGINT', () => {
    console.log(`Thank you for using File Manager, ${user}, goodbye!`)
})
