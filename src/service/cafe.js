import {
    Cafe,
    Table
} from "src/model/cafe";

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
    let elematch = {};
    if (typeOfTable != undefined) {
        elematch.typeOfTable = typeOfTable;
    }
    if (countOfPlug != undefined) {
        elematch.countOfPlug = countOfPlug;
    }
    const documents = await Cafe.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                $maxDistance: range
            }
        },
        tables: { $eleMatch: elematch }
    }).skip(page * perPage).limit(perPage).exec();
    return documents;
}

export const getTables = async (cafeId) => {
    const doesCafeExist = await Cafe.exists({ _id: cafeId }).exec();
    if (!doesCafeExist) {
        return undefined;
    }
    return await Cafe.findById(cafeId).select('tables').exec();
};

// /cafe/:cafeId/tables/:tableId
export const getCafeTable = async (cafeId, tableId) => {

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
            $eleMatch: { typeOfTable: typeOfTable }
        }
    });

    if (doseCafeHasTable) {
        return `cafe has ${typeOfTable}`;
    }
    Cafe.updateOne(
        { _id: cafeId },
        { $push: { tables: table } }
    );
    return "ok";
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
export const updateCafeTable = async (cafeId, tableId, table) => { };

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
export const deleteCafeTable = async (cafeId, tableId, table) => { };