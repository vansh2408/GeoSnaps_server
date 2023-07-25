const axios = require('axios');

const getCoordinatesForAddress= async(address)=>{
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_API_KEY}`)
    //console.log(response);
    const data = response.data;
    //console.log("data"+data);
    if(!data || data.status==='ZERO_RESULTS'){
        throw new Error("Couldn't find location for the specified address");
    }
    const coordinates = data.results[0].geometry.location;
    return coordinates;
}
 
module.exports = getCoordinatesForAddress;