import {
    Cafe,
    Table
} from "src/model/cafe";

import { Types } from "mongoose";


const updateCafeSum = async (cafeId) => {
    let document = await Cafe.aggregate([
        {
            "$match": {
                "_id": Types.ObjectId(cafeId)
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
                "TotalOfPlugs": {
                    "$sum": "$multiply"
                },
                "TotalOfTables": {
                    "$sum": "$tables.countOfTables"
                }
            }
        }
    ]).exec();
    if (document === {}) {
        return {};
    }
    document = await Cafe.updateOne({ _id: cafeId }, {
        $set: { TotalOfTables: document.TotalOfTables, TotalOfPlugs: document.TotalOfPlugs }
    });
    return document;
}

/* 
    todo
    impl : [getCafeTable, updateCafeTable, deleteCafeTable]
    make addNewTable, updateTable and deleteTable 
        run aggregate and update Cafe.countOfPlugs, Cafe.countOfTables

*/

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
    if (typeOfTable != undefined) {
        elemMatch.typeOfTable = typeOfTable;
    }
    if (countOfPlug != undefined) {
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
        return undefined;
    }
    return await Cafe.findById(cafeId).select('tables');
};

// /cafe/:cafeId/tables/:tableId
export const getCafeTable = async (cafeId, tableId) => {
    const tableExists = await Cafe.find({
        _id: cafeId,
        tables: { $elemMatch: { _id: tableId } }
    });
    if (!tableExists) {
        return {};
    }
    const document = await Cafe.aggregate([
        {
            $match: {

                _id: Types.ObjectId(cafeId)
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
                "tables._id": Types.ObjectId(tableId)
            }
        }]
    ).exec();
    console.log(document);
    return document;
};

// POST
export const addNew = async (body) => {
    body.location = { type: 'Point', coordinates: body.location.coordinates };
    const doesCafeExist = await Cafe.exists({ name: body.name });
    if (doesCafeExist) {
        return {};
    }
    const cafe = await Cafe.create(body).save();
    return cafe;
}

// /cafe/cafeId/tables
export const addNewTable = async (cafeId, table) => {
    const doesCafeExist = await Cafe.exists({ _id: cafeId });
    if (!doesCafeExist) {
        return "cafe not exists";
    }
    const typeOfTable = table.typeOfTable;
    const doseCafeHasTable = await Cafe.exists({
        _id: cafeId,
        tables: {
            $elemMatch:
                { typeOfTable: typeOfTable }
        }
    });
    console.log(doseCafeHasTable);

    if (doseCafeHasTable) {
        return `cafe already has ${typeOfTable}`;
    }

    await Cafe.updateOne(
        { _id: cafeId },
        { $push: { tables: table } }
    ).exec();
    const document = await updateCafeSum(cafeId);
    return document.tables;
}

// UPDATE
export const update = async (cafeId, body) => {
    const doesCafeExist = await Cafe.exists({ _id: cafeId });
    if (!doesCafeExist) {
        return {};
    }
    const document = await Cafe.updateOne({ _id: cafeId }, { $set: body }).exec();
    return document;
}

// /cafe/:cafeId/tables/:tableId
// 수정 및 테스트 필요
export const updateCafeTable = async (cafeId, tableId, table) => {
    const doesCafeExist = await Cafe.exists({ _id: cafeId });
    if (!doesCafeExist) {
        return "cafe not exists";
    }
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

    // 바꾸려는 게 typeofTable인경우 처리

    const doucment = await Table.updateOne({
        _id: tableId
    }, { $set: table }).exec();

    await updateCafeSum(cafeId);
    return doucment;
};

// DELETE
export const deleteCafe = async (cafeId) => {
    const doesCafeExist = await Cafe.exists({ _id: cafeId });
    if (!doesCafeExist) {
        return {};
    }
    const deleteDocument = await Cafe.deleteOne({ _id: cafeId }).exec();
    return deleteDocument;
}

// /cafe/:cafeId/tables/:tableId
// 수정 및 테스트 필요
export const deleteCafeTable = async (cafeId, tableId) => {
    const doesCafeExist = await Cafe.exists({ _id: cafeId });
    if (!doesCafeExist) {
        return "cafe not exists";
    }
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

    await Cafe.deleteOne({
        _id: cafeId
    }, { $pull: { tables: { $elemMatch: { _id: tableId } } } });
    return "ok";
};