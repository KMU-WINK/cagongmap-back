import * as Cafe from 'src/service/cafe'
import {
    TypeOfTables
} from 'src/model/cafe';


const iscoordinatesValid = (coordinates) => {
    const [lng, lat] = coordinates;
    if (-180 > lng && lng > 180) {
        return false;
    }
    if (-90 > lat && lat > 90) {
        return false;
    }
    return true;
}


export const getByIdController = async (req, res) => {
    const cafeId = req.params.cafeId;
    if (cafeId == null) {
        throw Error("need a id");
    }
    const document = await Cafe.getById(cafeId);
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
        throw Error("need coordinats");
    }

    if (!iscoordinatesValid([lng, lat])) {
        throw Error("coordinates out of range");
    }

    const range = req.query.range === undefined ? 1000 : req.query.range;
    var page = 0;
    var perPage = 10;
    if (Object.keys(req.body).length == 2) {
        page = req.body.page;
        perPage = req.body.perPage;
    }
    const typeOfTable = req.query.typeOfTable;
    const countofPlugs = req.query.countOfPlug;

    const documents = await Cafe.findCafe(
        lng, lat, range, typeOfTable, countofPlugs, page, perPage);

    if (documents.length == 0) {
        res.status(200).json({ status: "ok", data: "cafe doesn't exists" });
        return;
    }

    res.status(200).json({ status: "ok", data: documents });
    return;
}

export const getTablesController = async (req, res) => {
    const cafeId = req.params.cafeId;
    if (cafeId === undefined) {
        throw Error("need a id");
    }
    const documents = await Cafe.getTables(cafeId);
    if (typeof documents == "string") {
        throw Error(documents);
    }
    res.status(200).json({ status: "ok", data: documents });
}

export const getCafeTableController = async (req, res) => {
    const cafeId = req.params.cafeId;
    const tableId = req.params.tableId;
    const document = await Cafe.getCafeTable(cafeId, tableId);
    if (typeof document == "string")
        throw Error(document);
    res.status(200).json({ status: "ok", data: document });
}

export const addNewController = async (req, res) => {
    if (Object.keys(req.body).length < 2) {
        throw Error("need more data");
    }
    if (req.body.location == null ||
        req.body.location.coordinates == null ||
        req.body.location.coordinates.length != 2) {
        throw Error("need coordinates of Cafe");
    }

    if (!iscoordinatesValid(req.body.location.coordinates)) {
        throw Error("coordinates out of range");
    }

    if (req.body.name == null || req.body.name === "") {
        throw Error("need a name of Cafe");
    }

    if (req.body.tables != null || req.body.TotlaOfPlugs != null || req.body.TotlaOfTables) {
        throw Error("can not inputs table data");
    }

    req.body.location = {
        type: 'Point',
        coordinates: req.body.location.coordinates
    };

    const document = await Cafe.addNew(req.body);

    if (document instanceof String) {
        throw Error(document);
    }
    res.status(201).json({ status: "ok", data: document });
};

// todo return documents
export const addNewTableController = async (req, res) => {
    const cafeId = req.params.cafeId;

    if (cafeId == undefined) {
        throw Error("need a cafe id");
    }
    const table = req.body;
    if (Object.keys(table).keys() <= 2) {
        throw Error("need more data");
    }
    if (!(['single', 'bar', 'double'].includes(table.typeOfTable))) {
        throw Error("typeOfTable is not in " + TypeOfTables);
    }
    if (table.countOfPlugs == null) {
        throw Error('need countOfPlugs');
    }
    const document = await Cafe.addNewTable(cafeId, table);
    if (typeof document == "string") {
        throw Error(document);
    }
    res.status(201).json({ status: "ok", data: document });
}

export const patchController = async (req, res) => {
    const cafeId = req.params.cafeId;
    const cafe = req.body;

    // valid
    if (cafeId == null) {
        throw Error("need id");
    }
    if (Object.keys(cafe).length === 0) {
        throw Error("need data");
    }
    if (cafe.location != null) {
        if (!iscoordinatesValid(req.body.location.coordinates)) {
            throw Error("need right coordinates of Cafe");
        }
        cafe.location = {
            type: 'Point',
            coordinates: req.body.location.coordinates
        };
    }


    if (cafe.tables != null) {
        throw Error("tables cannot change");
    }
    if (cafe.TotlaOfTables != null || cafe.TotlaOfPlugs != null) {
        throw Error("TotalOfTables or TotalOfPlugs cannot change")
    }


    const document = await Cafe.update(cafeId, cafe);
    if (typeof document == "string") {
        throw Error(document);
    }
    res.status(200).json({ status: "ok" });
}

// todo patch /cafe/:cafeId/tables/:tableId
export const patchCafeTableController = async (req, res) => {
    const cafeId = req.params.cafeId;
    const tableId = req.params.tableId;
    if (Object.keys(req.body) == 0) {
        throw Error("need data");
    }
    const document = await Cafe.updateCafeTable(cafeId, tableId, req.body);
    if (document instanceof String) {
        throw Error(document);
    }
    res.status(200).json({ status: "ok" });
}

export const deleteController = async (req, res) => {
    const cafeId = req.params.cafeId;
    // valid
    if (cafeId == null) {
        throw Error("need id");
    }
    const document = await Cafe.deleteCafe(cafeId);
    if (typeof document == "string") {
        throw Error(document);
    }
    res.status(200).json({ status: "ok" });
};

// todo delete /cafe/cafeId/tables/tableId
export const deleteCafeTableController = async (req, res) => {
    const cafeId = req.params.cafeId;
    const tableId = req.params.tableId;
    if (cafeId == null || tableId == null) {
        throw Error("need id");
    }
    const document = await Cafe.deleteCafeTable(cafeId, tableId);
    if (document instanceof String) {
        throw Error(document);
    }
    res.status(200).json({ status: "ok" });
};