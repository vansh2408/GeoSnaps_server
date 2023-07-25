const {validationResult} = require('express-validator');
const User = require('../models/User');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getAllUsers = async(req,res)=>{
    let users;
    try{
        //users = await User.find({},'name email')
        users = await User.find({},'-password')      //both the above lines reterive name and email excludinf password.

    }catch(err){
        return res.status(501).json({message:'Fetching users failed!'})
    }
    res.status(200).json({users:users.map(user=>user.toObject({getters:true}))});
}

const signup = async(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){

        if (req.file) {
            const filePath = req.file.path;
            fs.unlink(filePath, (err) => {
              if (err) {
                console.log('Error removing the uploaded file:', err);
              }
            });
        }

        return res.status(422).json({message:"Invalid inputs passed"});
    }

    const {name,email,password} = req.body;
    let existingUser;
    try{
        existingUser = await User.findOne({email:email});
    }catch(err){
        if (req.file) {
            const filePath = req.file.path;
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error removing the uploaded file:', err);
              }
            });
        }
        return res.status(500).json({message:'Signingup failed, please try again later!'})
    }

    if(existingUser){
        if (req.file) {
            const filePath = req.file.path;
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error removing the uploaded file:', err);
              }
            });
        }
        return res.status(422).json({message:'Email already exists!'})
    }

    let hashedPassword;
    try{
        hashedPassword = await bcrypt.hash(password,12);
    }catch(err){
        if (req.file) {
            const filePath = req.file.path;
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error removing the uploaded file:', err);
              }
            });
        }
        console.log(err);
        return res.status(500).json({message:'Couldnot create user, please try again'})
    }

    const newUser = new User({
        name,
        email,
        password:hashedPassword,
        image:req.file.path,
        places:[]
    })
    
    try{
        await newUser.save();
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
        return res.status(500).json({message:'Error in creating user!'});
    }

    let token;
    try{
        token = jwt.sign({userId:newUser.id,email:newUser.email},process.env.JWT_KEY,{expiresIn:'1h'});
    }catch(err){
        const error = new Error('Signing up failed');
        error.code=500;
        return next(error);
    }

    return res.status(201).json({userId:newUser.id,email:newUser.email,token:token});
}

const login=async(req,res)=>{
    const {email,password}=req.body;

    let existingUser;
    try{
        existingUser = await User.findOne({email:email});
    }catch(err){
        return res.status(500).json({message:'Login failed, please try again later!'})
    }

    if(!existingUser){
        return res.status(401).json({message:'User not present'})
    }

    let isPasswordSame;
    try{
        isPasswordSame = await bcrypt.compare(password, existingUser.password);
    }catch(err){
        return res.status(500).json({message:'Could not log you in!'})
    }

    if(!isPasswordSame){
        return res.status(401).json({message:'Invalid credentials!, user fucked up successfully!'})
    }

    //jwt
    let token;
    try{
        token = jwt.sign({userId:existingUser.id,email:existingUser.email},process.env.JWT_KEY,{expiresIn:'1h'});
    }catch(err){
        const error = new Error('Logging in failed');
        error.code=500;
        return next(error);
    }

    res.status(200).json({userId:existingUser.id,email:existingUser.email,token:token});
}

exports.getAllUsers=getAllUsers;
exports.signup=signup;
exports.login=login; 