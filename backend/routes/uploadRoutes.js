const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

router.post('/single', uploadController.uploadSingle);
router.post('/', uploadController.upload);

module.exports = router;
