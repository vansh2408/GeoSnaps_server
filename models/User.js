const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
    name:{
        type:'String',
        required:true
    },
    email:{
        type:'String',
        required:true,
        unique:true
    },
    password:{
        type:'String',
        required:true,
        minLength:5
    },
    image:{
        type:'String',
        required:true
    },
    places:[{
        type:mongoose.Types.ObjectId,
        ref:'Place',
        required:true
    }]
})

userSchema.plugin(uniqueValidator)

const User = mongoose.model('User',userSchema);
module.exports = User;