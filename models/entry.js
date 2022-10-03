const mongoose = require('mongoose');
const Schema = mongoose.Schema
//const MUUID = require('uuid-mongodb').mode('relaxed');

let Entry = new Schema({
    guest: String,
    message: String
})

//Entry.set('toJSON', { getters: true, virtuals: false});

module.exports = mongoose.model("Entry", Entry)