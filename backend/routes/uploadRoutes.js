const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { verifyHMAC } = require('../middlewares/hmacMiddleware');

router.post('/single', verifyHMAC, uploadController.uploadSingle);
router.post('/', verifyHMAC, uploadController.upload);

module.exports = router;
