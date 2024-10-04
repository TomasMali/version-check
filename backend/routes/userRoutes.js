const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyHMAC } = require('../middlewares/hmacMiddleware');

router.post('/newuser',verifyHMAC, userController.newUser);

module.exports = router;
