const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended: false}));

app.use((req,res,next) => {
	res.sendFile(path.join(__dirname, 'routes', 'index.html'));
	
});



app.listen(3000);