import path from 'node:path';
import { fileURLToPath } from 'url';
import fs from 'node:fs'


let directory = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.splice(2)
const user = args[0].match(/=(.+)/)[1]
process.stdout.write(`Welcome to the File Manager, ${user}!\n`)
process.stdout.write(directory + "\n")

process.stdin.on('data', (chunk) => {
    const [_m, operation, arg] = chunk.toString().match(/([a-z]+) ?([^\r\n]+)?/);
    if (operation.startsWith('up')) {
        directory =  path.resolve(directory, '..')
        process.stdout.write(directory +'\n')
    }
    if (operation.startsWith('cd')){
       directory = path.resolve(directory, arg)
        process.stdout.write(directory +'\n')
    }
    if (operation === 'ls'){
        let list = fs.readdirSync(directory, {withFileTypes: true})
        console.log(list)
         let dirs = []
         let files = []
         list.forEach(elem => {
             if (elem.isFile()){
                 files.push({ Name: elem.name, Type: 'file' })
             } else {
                 dirs.push({ Name: elem.name, Type: 'directory' })
             }
         })
        dirs.sort((a,b)=>{
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
        console.log(dirs)
        files.sort((a,b)=>{
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
        console.table([...dirs, ...files],['Name','Type'])
    }
})

// process.stdout.end()
process.stdin.on('end', () => {
    process.stdout.write(`Thank you for using File Manager, ${user}, goodbye!`)
})
