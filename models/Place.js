const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    title:{
        type:'String',
        required:true
    },
    description:{
        type:'String',
        required:true
    },
    image:{
        type:'String',
        required:true
    },
    address:{
        type:'String',
        required:true
    },
    location:{
        lat:{type:'String',required:true},
        lng:{type:'String',required:true}
    },
    creator:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    }
})

const Place = mongoose.model('Place',placeSchema);
module.exports = Place;