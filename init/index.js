const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Connect DB
async function main() {
    await mongoose.connect(MONGO_URL);
}

// Initialize DB
const initDB = async () => {
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj)=>({...obj,owner:"6a159554fb5aa8334a237b62"}));
    await Listing.insertMany(initdata.data);
    console.log("Data was initialized!");
};

// Run properly (AFTER connection)
main()
.then(async () => {
    console.log("Connected to DB");
    await initDB();
})
.catch((err) => {
    console.log(err);
});
