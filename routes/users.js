const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users-controller');
const { check } = require('express-validator');
const fileUpload = require('../middlewares/file-upload');

//const upload = require('../middlewares/file-upload');
//const removeUploadedFileOnError = require('../middlewares/file-upload');


router.get('/',usersController.getAllUsers);

router.post('/signup', fileUpload.upload.single('image'), [check('name').not().isEmpty(), 
                       check('email').normalizeEmail().isEmail(), 
                       check('password').isLength({min:5})],fileUpload.removeUploadedFileOnError, usersController.signup);

router.post('/login',usersController.login);

module.exports = router;