import * as Cafe from 'src/service/cafe'
import {
    TypeOfTables
} from 'src/model/cafe';

/* 
    todo
    impl : [updateCafeTableController, deleteCafeTableController]
    end it : [addNewController]
*/


const iscoordinatesValid = (coordinates) => {
    const [lng, lat] = coordinates;
    if (-180 > lng && lng > 180) {
        throw Error("lng out of range");
    }
    if (-90 > lat && lat > 90) {
        throw Error("lat out of range");
    }
}


export const getByIdController = async (req, res) => {
    if (req.params.id === undefined) {
        throw Error("need a id");
    }
    const document = await Cafe.getById(req.params.id);
    if (document == {}) {
        throw Error("not exist");
    }
    res.status(200).json({ status: "ok", data: document });
};

export const findCafeController = async (req, res) => {
    const countOfQueries = Object.keys(req.query).length;
    if (countOfQueries < 2) {
        throw Error("need parameters");
    }
    const lng = req.query.lng; //위도
    const lat = req.query.lat; //경도

    if (lng == undefined || lat == undefined) {
        throw Error("give coordinats");
    }

    iscoordinatesValid([lng, lat]);

    const range = req.query.range === undefined ? 1000 : req.query.range;
    var page = 0;
    var perPage = 10;
    if (Object.keys(req.body).length == 2) {
        page = req.body.page;
        perPage = req.body.perPage;
    }
    const typeOfTable = req.query.typeOfTable;
    let countOfPlug = req.query.countOfPlug;

    const documents = await Cafe.findCafe(
        lng, lat, range, typeOfTable, countOfPlug, page, perPage);

    res.status(200).json({ status: "ok", data: documents });
    return;
}

export const getTablesController = async (req, res) => {
    const cafeId = req.params.id;
    if (cafeId == undefined) {
        throw Error("need a id");
    }
    const documents = await Cafe.getTables(cafeId);
    res.status(200).json({ status: "ok", data: documents });
}

export const getCafeTableController = async (req, res) => {
    const cafeId = req.params.cafeId;
    const tableId = req.params.tableId;
    const document = await Cafe.getCafeTable(cafeId, tableId);
    if (Object.keys(document) === 0)
        throw Error("not exists");
    res.status(200).json({ status: "ok", data: document });
}

export const addNewController = async (req, res) => {
    if (req.body.location == undefined ||
        req.body.location.coordinates == undefined ||
        req.body.location.coordinates.length != 2) {
        throw Error("need coordinates of Cafe");
    }

    iscoordinatesValid(req.body.location.coordinates);

    if (req.body.name == undefined || req.body.name === "") {
        throw Error("need a name of Cafe");
    }

    req.body.location = {
        type: 'Point',
        coordinates: req.body.location.coordinates
    };

    const doucment = await Cafe.addNew(req.body);

    if (Object.keys(doucment).length === 0) {
        throw Error("already exist Cafe");
    }
    res.status(201).json({ status: "ok", data: document });
};

// todo return documents
export const addNewTableController = async (req, res) => {
    const cafeId = req.params.id;

    if (cafeId == undefined) {
        throw Error("need a cafe id");
    }
    const table = req.body;
    if (Object.keys(table).keys() < 2) {
        throw Error("need more data");
    }
    if (!(['single', 'bar', 'double'].includes(table.typeOfTable))) {
        throw Error("typeOfTable is not in " + TypeOfTables);
    }
    const document = await Cafe.addNewTable(cafeId, table);
    res.status(201).json({ status: "ok", data: document });
}

export const updateController = async (req, res) => {
    const id = req.params.id;
    const body = req.body;

    // valid
    if (id === undefined) {
        throw Error("need id");
    }
    if (Object.keys(body).length === 0) {
        throw Error("need datat");
    }
    const document = await Cafe.update(req.body);
    res.status(200).json({ status: "ok", data: document });
}

// todo update /cafe/:cafeId/tables/:tableId

export const deleteController = async (req, res) => {
    const id = req.params.id;
    // valid
    if (id === undefined) {
        throw Error("need id");
    }
    const document = await Cafe.deleteCafe(id);
    res.status(200).json({ status: "ok", data: document });
};

// todo delete /cafe/cafeId/tables/tableId