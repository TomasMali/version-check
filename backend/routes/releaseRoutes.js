const express = require('express');
const router = express.Router();
const releaseController = require('../controllers/releaseController');

router.get('/', releaseController.getAllReleases);
router.post('/', releaseController.addRelease);
router.put('/:id', releaseController.updateRelease);
router.delete('/:id', releaseController.deleteRelease);

module.exports = router;
