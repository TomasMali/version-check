const express = require('express');
const router = express.Router();
const versionController = require('../controllers/versionController');

router.get('/checkUpdateAvailable/:piva/:envLicense', versionController.checkUpdateAvailable);
router.put('/updateCurrentVersion/:piva/:envLicense', versionController.updateCurrentVersion);
router.put('/markAsInstalling/:piva/:envLicense', versionController.markAsInstalling);
router.get('/canWeinstall/:piva/:envLicense', versionController.canWeInstall);
router.put('/updateRemoteVersions', versionController.updateRemoteVersions);
router.get('/', versionController.getAllVersions);

module.exports = router;
