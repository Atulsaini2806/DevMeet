const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://atul_saini:g0yCt8xTpexyjOcL@atulsaini-cluster.g4sc5jb.mongodb.net/devTinder"
    );
};

module.exports = connectDB;


// mongodb+srv://atul_saini:g0yCt8xTpexyjOcL@atulsaini-cluster.g4sc5jb.mongodb.net/