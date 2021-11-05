const mongoose = require('mongoose')

const pointSchema = mongoose.Schema({
    name: String,
    location: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

const Cafe = mongoose.Schema({
    name: { type: String, required: true },
    TotalOfTables: { type: Number, default: 0 },
    TotalOflPlugs: { type: Number, default: 0 },
    openTime: { type: String, default: "" },
    closeTime: { type: String, default: "" },
    loaction: {
        type: pointSchema,
        required: true,
        index: 'Point'
    }
});


Cafe.static.create = function (payload) {
    const cafe = new this(payload);
    return cafe.save();
};

Cafe.statics.findAll = function () {
    return this.find();
}


module.exports = mongoose.model("Cafe", Cafe);