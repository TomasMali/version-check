const express = require('express');
const router = express.Router();
const versionController = require('../controllers/versionController');
const { verifyHMAC } = require('../middlewares/hmacMiddleware');


router.get('/checkUpdateAvailable/:piva/:envLicense',verifyHMAC, versionController.checkUpdateAvailable);
router.put('/updateCurrentVersion/:piva/:envLicense',verifyHMAC, versionController.updateCurrentVersion);
router.put('/markAsInstalling/:piva/:envLicense',verifyHMAC, versionController.markAsInstalling);
router.get('/canWeinstall/:piva/:envLicense', verifyHMAC,versionController.canWeInstall);
router.put('/updateRemoteVersions', versionController.updateRemoteVersions);
router.get('/', versionController.getAllVersions);

module.exports = router;
