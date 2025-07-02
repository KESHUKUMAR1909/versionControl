const fs = require('fs').promises;
// promises used to create files and folder using node js 

const path = require('path');

async function initRepo() {

    const repoPath = path.resolve(process.cwd(), ".keshuGit")
    const commitsPath = path.join(repoPath, "commits");


    try {
        await fs.mkdir(repoPath, { recursive: true });
        await fs.mkdir(commitsPath, { recursive: true });
        await fs.writeFile(
            path.join(repoPath, "config.json"),
            JSON.stringify({ bucket: process.env.S3_BUCKET })
        );
        console.log("Repository initialised!")
    } catch (err) {
        console.log("Error initialising repository", err)
    }


}
module.exports = { initRepo };
