import {
    Cafe,
} from "src/model/cafe";

import { Types } from "mongoose";

const { ObjectId } = Types;

export class NotExists extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotExists';
    }
};

export class AlreadyExists extends Error {
    constructor(message) {
        super(message);
        this.name = 'AlreadyExists';
    }
};


// further do : reduce api per query

// it might be replace by trigger.
const updateCafeSum = async (cafeId) => {
    let document = await Cafe.aggregate([
        {
            "$match": {
                "_id": ObjectId(cafeId)
            }
        },
        {
            "$project": {
                "tables": 1
            }
        },
        { $unwind: "$tables" },
        {
            "$project": {
                "tables.countOfTables": 1,
                "tables.countOfPlugs": 1,
                "multiply": {
                    "$multiply": [
                        "$tables.countOfTables",
                        "$tables.countOfPlugs"
                    ]
                }
            }
        },
        {
            "$group": {
                "_id": cafeId,
                "totalOfPlugs": {
                    "$sum": "$multiply"
                },
                "totalOfTables": {
                    "$sum": "$tables.countOfTables"
                }
            }
        }
    ]).exec();
    if (document === []) {
        return {};
    }
    document = await Cafe.updateOne({ _id: cafeId }, {
        totalOfTables: document[0].totalOfTables,
        totalOfPlugs: document[0].totalOfPlugs
    });
    return document;
}


// GET
export const getById = async (cafeId) => {
    const document = await Cafe.findById(cafeId).exec();
    if (document == null) {
        throw new NotExists("cafe not exists");
    }
    return document;
};

export const findCafe = async (lng, lat, range, typeOfTable, countOfPlugs, plugsGreaterThanTwo, page, perPage) => {
    let query = {
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                $maxDistance: range
            }
        },
    };
    let elemMatch = {};
    if (typeOfTable != null) {
        elemMatch.typeOfTable = typeOfTable;
    }
    if (countOfPlugs != null) {
        elemMatch.countOfPlugs = parseInt(countOfPlugs);
    }
    if (plugsGreaterThanTwo) {
        elemMatch.countOfPlugs = { $gt: 2 };
    }
    if (Object.keys(elemMatch) != 0) {
        query.tables = {};
        query.tables.$elemMatch = elemMatch;
    }

    const documents = await Cafe.find(query).skip(page * perPage).limit(perPage).exec();
    if (documents.length <= 0) {
        throw new NotExists("cafes not exist");
    }
    return documents;
}

export const getTables = async (cafeId) => {
    const documents = await Cafe.findById(cafeId).select('tables');
    if (documents == null || documents.length <= 0) {
        throw new NotExists("cafe doesn't exists");
    }
    return await Cafe.findById(cafeId).select('tables');
};

// /cafe/:cafeId/tables/:tableId
export const getCafeTable = async (cafeId, tableId) => {
    const document = await Cafe.aggregate([
        {
            $match: {
                _id: ObjectId(cafeId)
            }
        }, {
            $project: {
                "tables": 1, "_id": 0
            }
        }, {
            $unwind: {
                path: "$tables"
            }
        }, {
            $match: {
                "tables._id": ObjectId(tableId)
            }
        }]
    ).exec();
    if (document == null || document.length <= 0) {
        throw new NotExists("tables or cafe not exist");
    }
    return document;
};

// POST
export const addNew = async (cafe) => {
    cafe.location = { type: 'Point', coordinates: cafe.location.coordinates };
    const doesCafeExist = await Cafe.exists({ name: cafe.name });
    if (doesCafeExist) {
        throw new AlreadyExists("cafe already exist");
    }
    const document = await Cafe.create(cafe);
    return document;
}

export const addNewTable = async (cafeId, table) => {
    const doesCafeExist = await Cafe.exists({ _id: cafeId });
    if (!doesCafeExist) {
        throw new AlreadyExists("cafe not exists");
    }
    const typeOfTable = table.typeOfTable;
    const countOfPlugs = table.countOfPlugs;
    const doseCafeHasTable = await Cafe.exists({
        _id: cafeId,
        tables: {
            $elemMatch:
            {
                typeOfTable: typeOfTable,
                countOfPlugs: countOfPlugs
            }
        }
    });

    if (doseCafeHasTable) {
        throw new AlreadyExists(`cafe already has ${typeOfTable}, that has ${countOfPlugs} plugs`);
    }

    await Cafe.updateOne(
        { _id: cafeId },
        { $push: { tables: table } }
    ).exec();
    await updateCafeSum(cafeId);
    return;
}

// UPDATE
export const update = async (cafeId, cafe) => {
    const doesCafeExist = await Cafe.exists({ _id: cafeId });
    if (!doesCafeExist) {
        throw new NotExists("cafe not exists");
    }
    await Cafe.updateOne({ _id: cafeId }, { $set: cafe }).exec();
    return true;
}

export const updateCafeTable = async (cafeId, tableId, table) => {
    const doesCafeHasTable = await Cafe.exists({
        _id: cafeId,
        tables: {
            $elemMatch: {
                _id: tableId
            }
        }
    });

    if (!doesCafeHasTable) {
        throw new NotExists(`cafe hasn't ${tableId}`);
    }

    let set = {};
    for (let field in table) {
        set[`tables.$.${field}`] = table[field];
    }

    if (table.typeOfTable != null) {
        const doesCafeHasTable = await Cafe.exists({
            _id: cafeId,
            tables: {
                $elemMatch: {
                    typeOfTable: table.typeOfTable,
                    countOfPlugs: table.countOfPlugs
                }
            }
        });

        if (doesCafeHasTable) {
            throw new AlreadyExists(`cafe already has ${table.typeOfTable}, that has ${table.countOfPlug} plugs`);
        }
    }

    Cafe.updateOne({
        _id: cafeId, "tables._id": tableId
    }, { $set: set }).exec();

    await updateCafeSum(cafeId);
    return;
};

// DELETE
export const deleteCafe = async (cafeId) => {
    const doesCafeExist = await Cafe.exists({ _id: cafeId });
    if (!doesCafeExist) {
        throw new NotExists("cafe not exist");
    }
    await Cafe.deleteOne({ _id: cafeId }).exec();
    return true;
}

export const deleteCafeTable = async (cafeId, tableId) => {
    const doseCafeHasTable = await Cafe.exists({
        _id: cafeId,
        tables: {
            $elemMatch:
                { _id: tableId }
        }
    });

    if (!doseCafeHasTable) {
        throw new NotExists(`cafe hasn't ${tableId}`);
    }

    const document = await Cafe.updateOne({ _id: cafeId }, {
        $pull: { tables: { _id: ObjectId(tableId) } }
    });
    await updateCafeSum(cafeId);
    return document;
};