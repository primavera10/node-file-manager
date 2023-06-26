import path from 'node:path';
import { fileURLToPath } from 'url';
import fs from 'node:fs'
import { createReadStream, createWriteStream } from 'fs'


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
    const [_m, operation, arg] = chunk.toString().match(/([a-z]+) ?([^\r\n]+)?/);
    if (operation.startsWith('up')) {
        directory = path.resolve(directory, '..')
        writeToConsole()
    }
    if (operation.startsWith('cd')) {
        directory = path.resolve(directory, arg)
        writeToConsole()
    }
    if (operation === 'ls') {
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
    }
    if (operation === 'cat') {
        const file = path.resolve(directory, arg);
        console.log(file)
        const readable = createReadStream(file)
        readable.pipe(process.stdout)
        writeToConsole()
    }
    if (operation === 'add'){
        const newPath = path.resolve(directory, arg)
        fs.writeFileSync(newPath, '')
        writeToConsole()
    }
    if (operation === 'rn'){
       const [arg1, arg2] = arg.split(' ')
        const oldPath = path.resolve(directory, arg1)
        const newPath = path.resolve(path.dirname(oldPath) ,arg2)
        console.log(newPath)
        fs.renameSync(oldPath, newPath)
        writeToConsole()
    }
    if (operation === 'cp'){
        const [arg1, arg2] = arg.split(' ')
        const oldPath = path.resolve(directory, arg1)
        const newPath = path.resolve(directory, arg2, path.basename(oldPath));
        fs.writeFileSync(newPath, '')
        const readable = createReadStream(oldPath)
        const writable = createWriteStream(newPath)
        readable.pipe(writable)
        writeToConsole()
    }
    if (operation === 'mv'){
        const [arg1, arg2] = arg.split(' ')
        const oldPath = path.resolve(directory, arg1)
        const newPath = path.resolve(directory, arg2, path.basename(oldPath));
        fs.writeFileSync(newPath, '')
        const readable = createReadStream(oldPath)
        const writable = createWriteStream(newPath)
        readable.pipe(writable)
        readable.on('end', () => fs.unlinkSync(oldPath))
        writeToConsole()
    }
    if (operation === 'rm'){
        const pathToDelete = path.resolve(directory, arg)
        fs.unlinkSync(pathToDelete)
        writeToConsole()
    }

})

// process.stdout.end()
process.on('SIGINT', () => {
    console.log(`Thank you for using File Manager, ${user}, goodbye!`)
})
