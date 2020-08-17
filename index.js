var express = require('express');
const app = express();
const routes = require('./routes.js');

app.use('/ct', routes);
app.use((err, req, res, next) => {
	res.status(500).json({
		error: err,
		message: 'Internal server error!',
	});
	next();
});


//start server
const PORT = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;
const server = app.listen(PORT, function () {
	const host = server.address().address
	const port = server.address().port
	console.log("App listening at", host, port)
});

// default
app.get('/', async (req, res) => {
	res.send("Nothing is hereeeee!");
});