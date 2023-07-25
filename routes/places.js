const express = require('express');
const placesController = require('../controllers/places-controller');
const router = express.Router();
const {check} = require('express-validator');
const fileUpload = require('../middlewares/file-upload');
const checkAuth = require('../middlewares/check-auth');

router.get('/:id', placesController.getPlaceById)

router.get('/user/:userId', placesController.getPlacesByUserId);

//middleware to check for authorized token for the below 3 routes
router.use(checkAuth);

router.post('/', fileUpload.upload.single('image'), [check('title').not().isEmpty(), check('description').isLength({min:5}),check('address').not().isEmpty()],fileUpload.removeUploadedFileOnError, placesController.createPlace);

router.patch('/:placeId',[check('title').not().isEmpty(), check('description').isLength({min:5})], placesController.updatePlace);

router.delete('/:placeId',placesController.deletePlace)

module.exports = router;