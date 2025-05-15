import path from "path";
import fs from "fs/promises"; 
import crypto from "crypto";

class Stark {
    constructor(repoPath = '.') {
        this.repoPath = path.join(repoPath, '.stark');
        this.objectsPath = path.join(this.repoPath, 'objects');
        this.headpath = path.join(this.repoPath, 'HEAD');
        this.indexpath = path.join(this.repoPath, 'index');
        this.init();
    }
    async init() {
        await fs.mkdir(this.objectsPath, { recursive: true });
    
        // Check if HEAD exists
        try {
            await fs.access(this.headpath);
        } catch (err) {
            // File does not exist, create it
            await fs.writeFile(this.headpath, '', { flag: 'wx' });
        }
    
        // Check if index exists
        try {
            await fs.access(this.indexpath);
        } catch (err) {
            // File does not exist, create it
            await fs.writeFile(this.indexpath, JSON.stringify([]), { flag: 'wx' });
        }
    }
    

    hashObject(content) {
        return crypto.createHash('sha1').update(content, 'utf-8').digest('hex');
    }

    async add(fileToBeAdded) {
        try {
            const fileData = await fs.readFile(fileToBeAdded, { encoding: 'utf-8' });
            const fileHash = this.hashObject(fileData);
            const newFileHashedObjectPath = path.join(this.objectsPath, fileHash);

            // Check if file already exists to avoid overwriting
            try {
                await fs.writeFile(newFileHashedObjectPath, fileData, { flag: 'wx' });
                console.log(`File added with hash: ${fileHash}`);
            } catch (err) {
                console.log(`File with hash ${fileHash} already exists.`);
            }
        } catch (err) {
            console.error('Error adding file:', err);
        }
    }
}

const stark = new Stark();
stark.add('./server/git/sample.txt');
