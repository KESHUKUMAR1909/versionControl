const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const readdir = promisify(fs.readdir);
// read only when dir exists
const copyFile = promisify(fs.copyFile);


async function revertRepo(commitID){
    const repoPath = path.resolve(process.cwd() , ".keshuGit");
    const commitsPath = path.join(repoPath , "commits");
    try{
        const commitDir = path.join(commitsPath , commitID);
        const files = await readdir(commitDir);

        const parentDir = path.resolve(repoPath , "..");
        for(const file of files){
            await copyFile(path.join(commitDir , file) , path.join(parentDir , file))
        }

        console.log(`Commmit ${commitID} reverted successfully`);


    }catch(err){
        console.log("Unable to revert : " , err)
    }
}
module.exports = {revertRepo};
