// import express from 'express';

// function (class) () => { does a bunch of stuff, has additional function }
const express = require('express');

// express is a function imported from the 'express' module. here invoke 'express' with no arguments, setting its return equal to an arbitrary value 'app'
const app = express();

console.log(app);
app.get('/STUFF', (req, res) => res.send("This Works"))

// we then declare a port value, 5000 in this case
const port = process.env.PORT || 5000

// const process = {
// 	env: {
// 		PORT: 8000
// 	}
// }

// finally let's use the 'listen' function provided by our 'app' instancde. this function, when invoked with a port and callback function, will maintain an open connection to your new server
app.listen(port, () => console.log(`Server is up on port ${port}`))