const multer = require('multer');
const uuid = require('uuid');
const fs = require('fs');
const { validationResult } = require('express-validator');

const MIME_TYPE_MAP={
    'image/png':'png',
    'image/jpg':'jpg',
    'image/jpeg':'jpeg'
}

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/images')
    },

    filename:(req,file,cb)=>{
        const extension = MIME_TYPE_MAP[file.mimetype];
        cb(null,uuid.v1()+'.'+extension);
    }
})

const upload = multer({limits:5000000, storage:storage, fileFilter:(req,file,cb)=>{
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('Invalid file type');
    cb(error,isValid);
}});

//remove file upload middleware if error occurs
const removeUploadedFileOnError = (req, res, next) => {
    //console.log("12345")
    if (!req.file) {
      return next(); // If there's no file, proceed to the next middleware or route handler
    }

    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
        // If there are validation errors, remove the uploaded file
        const filePath = req.file.path;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error removing the uploaded file:', err);
          }
          next();
        });
      } else {
        next();
    }
  };

exports.upload = upload;
exports.removeUploadedFileOnError = removeUploadedFileOnError;

// module.exports = upload;
// module.exports = removeUploadedFileOnError;