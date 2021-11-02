import { Schema, model } from "mongoose";

const Cafe = new Schema({

});

Cafe.index();

Cafe.static.create = function (payload) {
    const cafe = new this(payload);
    return cafe.save();
};

Cafe.statics.findAll = function () {
    return this.find();
}

const CafeModel = model("Cafe", Cafe);
export { CafeModel };