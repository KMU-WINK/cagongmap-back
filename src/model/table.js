const mongoose = require('mongoose');

const Table = mongoose.Schema({
    cafeName: { type: mongoose.Schema.Types.ObjectId, ref: 'Cafe', required: true },
    typeOfTable: { type: String, default: "" },
    countOflPlugs: { type: Number, default: 0 },
    countOfTables: { type: Number, default: 0 }
});

module.exports = mongoose.model("Table", Table);
