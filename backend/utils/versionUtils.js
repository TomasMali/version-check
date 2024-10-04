const fs = require('fs');
const path = require('path');

exports.compareVersions = (versionA, versionB) => {
    const partsA = versionA.split('.').map(Number);
    const partsB = versionB.split('.').map(Number);

    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        if (partsA[i] > (partsB[i] || 0)) return 1;
        if (partsA[i] < (partsB[i] || 0)) return -1;
    }

    return 0;
};

exports.checkAndCreateFolder = (piva, license) => {
    const folderPath = path.join('/uploads/', `${piva}_${license}`);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Folder '${piva}_${license}' created.`);
    } else {
        console.log(`Folder '${piva}_${license}' already exists.`);
    }
};
