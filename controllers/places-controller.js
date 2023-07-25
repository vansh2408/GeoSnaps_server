const uuid = require('uuid');
const mongoose = require('mongoose')
const {validationResult} = require('express-validator');
const getCoordinatesForAddress = require('../utils/location');
const Place = require('../models/Place');
const User = require('../models/User');
const fs = require('fs');

const getPlaceById=async (req,res)=>{
    const placeId = req.params.id;
    let place;

    try{
        place = await Place.findById(placeId);
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Error in getting place"})
    }

    if(!place){
        return res.status(404).json({message:"Couldn't find any place"});
    }
     res.json({place:place.toObject({getters:true})});
}

const getPlacesByUserId=async (req,res)=>{
    const userId=req.params.userId;
    let userWithPlaces;
    try{
        //userPlaces = await Place.find({creator:userId});
        userWithPlaces = await User.findById(userId).populate('places');
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Error in getting place of user"})
    }
    // if(!userWithPlaces || userWithPlaces.places.length===0){
    //     return res.status(404).json({message:"Couldn't find any places"});
    // }
    //console.log(userPlaces);
    return res.json({userPlaces:userWithPlaces.places.map(place=>place.toObject({getters:true}))});

}

const createPlace=async (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        if (req.file) {
            const filePath = req.file.path;
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error removing the uploaded file:', err);
              }
            });
        }
        return res.status(422).json({message:"Invalid inputs passed"});
    }
    const {title,description,address} = req.body;
    
    let coordinates;
    try{
        coordinates = await getCoordinatesForAddress(address);
    }catch(err){
        if (req.file) {
            const filePath = req.file.path;
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error removing the uploaded file:', err);
              }
            });
        }
        return next(err);
    }

    const newPlace = new Place({
        title,
        description,
        image:req.file.path,
        location:coordinates,
        address,
        creator:req.userData.userId
    })

    //checking the entered user is valid or not
    let user;
    try{
        user = await User.findById(req.userData.userId);
    }catch(err){
        if (req.file) {
            const filePath = req.file.path;
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error removing the uploaded file:', err);
              }
            });
        }
        return res.status(500).json({message:'Creating place failed!'})
    }

    if(!user){
        if (req.file) {
            const filePath = req.file.path;
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error removing the uploaded file:', err);
              }
            });
        }
        return res.status(500).json({message:'User not found for the provided id'})
    }

    //console.log(user.places);

    try{
        //2 tasks:- creating place and adding place to the user, thats why using transaction and session

        /*
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await newPlace.save({session:sess});
        user.places.push(newPlace);
        await user.save({session:sess});
        await sess.commitTransaction();
        */

        await newPlace.save();
        user.places.push(newPlace);
        await user.save();
    }catch(err){
        console.log(err);
        if (req.file) {
            const filePath = req.file.path;
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error removing the uploaded file:', err);
              }
            });
        }
        return res.status(500).json({message:'Error in creating place!'});
    }
    
    res.status(201).json({place:newPlace});
}

const deletePlace=async (req,res,next)=>{
    const placeId = req.params.placeId;

    let place;
    try{
        place = await Place.findById(placeId).populate('creator');
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Error in deleting place"})
    }

    if(!place){
        return res.status(500).json({message:"Could not find place for this id!"})
    }

    //adding server authorization
    if(req.userData.userId!==place.creator.id){
        const error = new Error('You are not allowed to delete this place!');
        error.statusCode = 401;
        return next(error);
    }

    const imagePath = place.image;

    try{
        // const sess = await mongoose.startSession();
        // sess.startTransaction();
        // await place.deleteOne({session:sess});
        // place.creator.places.pull(place);
        // await place.creator.save({session:sess});
        // await sess.commitTransaction();

        await place.deleteOne();
        place.creator.places.pull(place);
        await place.creator.save();

    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Something went wrong, could not delete place!"})
    }

    fs.unlink(imagePath, (err) => {
        console.error('Error removing the deleted file:', err);
    });

    res.status(200).json({message:"Deleted successfully"})
}

const updatePlace=async (req,res)=>{
    const placeId=req.params.placeId;
    const {title,description} = req.body
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        return res.status(422).json({message:"Invalid inputs passed"});
    }
    
    let place;
    try{
        place = await Place.findByIdAndUpdate(placeId, {title:title, description:description})
    }catch(err){
        console.log(err);
        return res.status(500).json({message:'Error in updating place!'});
    }
    res.status(200).json({place:place.toObject({getters:true})});
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;