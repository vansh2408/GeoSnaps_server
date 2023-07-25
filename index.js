const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const mongoose = require('mongoose');
const usersRoutes = require('./routes/users.js');
const placesRoutes = require('./routes/places.js');
const path = require('path');
require('dotenv').config();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use('/uploads/images',express.static(path.join('uploads','images')))

//cors
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE')
    next()
})

app.use('/users',usersRoutes);
app.use('/places',placesRoutes);

app.use((req,res,next)=>{
    //throw new Error("no route")
    return res.status(404).json({message:'Couldnot find any route'})
})

//errors
app.use((req,res,next)=>{
    //means there is error but the file is uploaded to uploads, so to remove it
    //console.log("nn")
    if(!res.ok){
        //console.log('njkn')
    if(req.file){
        fs.unlink(req.file.path,err=>{
            console.log(err)
        })
    }
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code || 500).json({message:error.message || 'An unknown error occured'})
}
})

// mongoose.connect('mongodb://0.0.0.0:27017/GeoSnaps',{
//     useNewUrlParser:true,
//     useUnifiedTopology:true
// }).then(()=>{
//     app.listen(5000)
//     console.log("Server started successfully!")
// }).catch(err=>{
//     console.log(err);
// })

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.el1xrrx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,{
    useNewUrlParser:true, 
    useUnifiedTopology:true
}).then(()=>{ 
    app.listen(process.env.PORT || 5000)
    console.log("Server started successfully!")
}).catch(err=>{
    console.log(err);
})
  
// mongodb+srv://vanshnandwani:<password>@cluster0.el1xrrx.mongodb.net/?retryWrites=true&w=majority
