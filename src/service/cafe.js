import {
    Cafe,
} from "src/model/cafe";

import { Types } from "mongoose";

const { ObjectId } = Types;


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
    return await Cafe.findById(cafeId).exec();
};

export const findCafe = async (lng, lat, range, typeOfTable, countOfPlug, page, perPage) => {
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
    if (countOfPlug != null) {
        elemMatch.countOfPlug = countOfPlug;
    }
    if (Object.keys(elemMatch) != 0) {
        query.tables = {};
        query.tables.$elemMatch = elemMatch;
    }

    const documents = await Cafe.find(query).skip(page * perPage).limit(perPage).exec();
    return documents;
}

export const getTables = async (cafeId) => {
    const doesCafeExist = await Cafe.exists({ _id: cafeId });
    if (!doesCafeExist) {
        return "cafe doesn't exists";
    }
    return await Cafe.findById(cafeId).select('tables');
};

// /cafe/:cafeId/tables/:tableId
export const getCafeTable = async (cafeId, tableId) => {
    const tableExists = await Cafe.exists({
        _id: cafeId,
        tables: { $elemMatch: { _id: tableId } }
    });
    if (!tableExists) {
        return "table is not exists";
    }
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
    return document;
};

// POST
export const addNew = async (cafe) => {
    cafe.location = { type: 'Point', coordinates: cafe.location.coordinates };
    const doesCafeExist = await Cafe.exists({ name: cafe.name });
    if (doesCafeExist) {
        return "cafe already exist";
    }
    const document = await Cafe.create(cafe);
    return document;
}

// /cafe/cafeId/tables
export const addNewTable = async (cafeId, table) => {
    const doesCafeExist = await Cafe.exists({ _id: cafeId });
    if (!doesCafeExist) {
        return "cafe not exists";
    }
    const typeOfTable = table.typeOfTable;
    const countOfPlug = table.countOfPlug;
    const doseCafeHasTable = await Cafe.exists({
        _id: cafeId,
        tables: {
            $elemMatch:
            {
                typeOfTable: typeOfTable,
                countOfPlug: countOfPlug
            }
        }
    });

    if (doseCafeHasTable) {
        return `cafe already has ${typeOfTable}, that has ${countplug} plugs`;
    }

    await Cafe.updateOne(
        { _id: cafeId },
        { $push: { tables: table } }
    ).exec();
    const document = await updateCafeSum(cafeId);
    return document.tables;
}

// UPDATE
export const update = async (cafeId, cafe) => {
    const doesCafeExist = await Cafe.exists({ _id: cafeId });
    if (!doesCafeExist) {
        return "cafe not exists";
    }
    await Cafe.updateOne({ _id: cafeId }, { $set: cafe }).exec();
    return true;
}

// /cafe/:cafeId/tables/:tableId
// 수정 및 테스트 필요
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
        return `cafe hasn't ${tableId}`;
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
                    countOfPlug: table.countOfPlug
                }
            }
        });

        if (doesCafeHasTable) {
            return `cafe already has ${typeOfTable}, that has ${countplug} plugs`;
        }
    }

    const document = await Cafe.updateOne({
        _id: cafeId, "tables._id": tableId
    }, { $set: set }).exec();

    await updateCafeSum(cafeId);
    return document;
};

// DELETE
export const deleteCafe = async (cafeId) => {
    const doesCafeExist = await Cafe.exists({ _id: cafeId });
    if (!doesCafeExist) {
        return "cafe not exist";
    }
    await Cafe.deleteOne({ _id: cafeId }).exec();
    return true;
}

// /cafe/:cafeId/tables/:tableId
// 수정 및 테스트 필요
export const deleteCafeTable = async (cafeId, tableId) => {
    const doseCafeHasTable = await Cafe.exists({
        _id: cafeId,
        tables: {
            $elemMatch:
                { _id: tableId }
        }
    });

    if (!doseCafeHasTable) {
        return `cafe hasn't ${tableId}`;
    }

    const document = await Cafe.updateOne({ _id: cafeId }, {
        $pull: { tables: { _id: ObjectId(tableId) } }
    });
    await updateCafeSum(cafeId);
    return document;
};