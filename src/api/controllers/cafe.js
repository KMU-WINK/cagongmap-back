import * as Cafe from 'src/service/cafe'
import {
    TypeOfTables
} from 'src/model/cafe';

export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
};


const iscoordinatesValid = (coordinates) => {
    const [lng, lat] = coordinates;
    if (-180 > lng || lng > 180) {
        return false;
    }
    if (-90 > lat || lat > 90) {
        return false;
    }
    return true;
}


export const getByIdController = async (req, res) => {
    const cafeId = req.params.cafeId;
    if (cafeId == null) {
        throw new new ValidationError("need a id");
    }
    const document = await Cafe.getById(cafeId);
    res.status(200).json({ status: "ok", data: document });
};

export const findCafeController = async (req, res) => {
    const countOfQueries = Object.keys(req.query).length;
    if (countOfQueries < 2) {
        throw new ValidationError("need parameters");
    }
    const lng = req.query.lng; //위도
    const lat = req.query.lat; //경도

    if (lng == undefined || lat == undefined) {
        throw new ValidationError("need coordinats");
    }

    if (!iscoordinatesValid([lng, lat])) {
        throw new ValidationError("coordinates out of range");
    }

    const range = req.query.range === undefined ? 1000 : req.query.range;
    var page = 0;
    var perPage = 10;
    if (Object.keys(req.body).length == 2) {
        page = req.body.page;
        perPage = req.body.perPage;
    }
    const typeOfTable = req.query.typeOfTable;
    const countOfPlugs = req.query.countOfPlugs;
    const plugsGreaterThanTwo = req.query.plugsGreaterThanTwo == 'true' ? true : req.query.plugsGreaterThanTwo;
    if (countOfPlugs != null &&
        plugsGreaterThanTwo != null &&
        plugsGreaterThanTwo) {
        throw new ValidationError("choose one option");
    }

    const documents = await Cafe.findCafe(
        lng, lat, range, typeOfTable, countOfPlugs, plugsGreaterThanTwo, page, perPage);

    res.status(200).json({ status: "ok", data: documents });
    return;
}

export const getTablesController = async (req, res) => {
    const cafeId = req.params.cafeId;
    if (cafeId === undefined) {
        throw new ValidationError("need a id");
    }
    const documents = await Cafe.getTables(cafeId);
    res.status(200).json({ status: "ok", data: documents });
}

export const getCafeTableController = async (req, res) => {
    const cafeId = req.params.cafeId;
    const tableId = req.params.tableId;
    const document = await Cafe.getCafeTable(cafeId, tableId);
    res.status(200).json({ status: "ok", data: document });
}

export const getCafeImagesController = async (req, res) => {
    const cafeId = req.params.cafeId;
    const documents = await Cafe.getCafeImages(cafeId);
    res.status(200).json({ status: "ok", data: documents });
}

export const getPlaceController = async (req, res) => {
    const cafeId = req.params.cafeId;
    const document = await Cafe.getCafePlace(cafeId);
    res.status(200).json({ status: "ok", data: document });
}

export const addNewController = async (req, res) => {
    if (Object.keys(req.body).length < 2) {
        throw new ValidationError("need more data");
    }
    if (req.body.location == null ||
        req.body.location.coordinates == null ||
        req.body.location.coordinates.length != 2) {
        throw new ValidationError("need coordinates of Cafe");
    }

    if (!iscoordinatesValid(req.body.location.coordinates)) {
        throw new ValidationError("coordinates out of range");
    }

    if (req.body.name == null || req.body.name === "") {
        throw new ValidationError("need a name of Cafe");
    }

    if (req.body.tables != null || req.body.totlaOfPlugs != null || req.body.totlaOfTables) {
        throw new ValidationError("can not inputs table data");
    }

    req.body.location = {
        type: 'Point',
        coordinates: req.body.location.coordinates
    };

    const document = await Cafe.addNew(req.body);

    res.status(201).json({ status: "ok", data: document });
};

export const addNewTableController = async (req, res) => {
    const cafeId = req.params.cafeId;

    if (cafeId == undefined) {
        throw new ValidationError("need a cafe id");
    }
    const table = req.body;
    if (Object.keys(table).length <= 1) {
        throw new ValidationError("need more data");
    }
    if (!(['single', 'bar', 'double'].includes(table.typeOfTable))) {
        throw new ValidationError("typeOfTable is not in " + TypeOfTables);
    }
    if (table.countOfPlugs == null) {
        throw new ValidationError('need countOfPlugs');
    }
    await Cafe.addNewTable(cafeId, table);
    res.status(201).json({ status: "ok" });
}

export const addNewImageController = async (req, res) => {
    const cafeId = req.params.cafeId;
    const image = req.body;
    if (Object.keys(image).length <= 0) {
        throw new ValidationError("need more data");
    }

    await Cafe.addNewImage(cafeId, image);
    res.status(201).json({ status: "ok" });
}

export const addNewPlaceController = async (req, res) => {
    const cafeId = req.params.cafeId;
    const place = req.body;
    if (Object.keys(place).length <= 0) {
        throw new ValidationError("need more data");
    }
    await Cafe.addNewPlace(cafeId, place);
    res.status(201).json({ status: "ok" });
}

export const patchController = async (req, res) => {
    const cafeId = req.params.cafeId;
    const cafe = req.body;

    // valid
    if (cafeId == null) {
        throw new ValidationError("need id");
    }
    if (Object.keys(cafe).length === 0) {
        throw new ValidationError("need data");
    }
    if (cafe.location != null) {
        if (cafe.location.coordinates.length < 2) {
            throw new ValidationError("need right coordinates of Cafe");
        }
        if (!iscoordinatesValid(req.body.location.coordinates)) {
            throw new ValidationError("need right coordinates of Cafe");
        }
        cafe.location = {
            type: 'Point',
            coordinates: req.body.location.coordinates
        };
    }


    if (cafe.tables != null) {
        throw new ValidationError("tables cannot change");
    }
    if (cafe.totalOfTables != null || cafe.totalOfPlugs != null) {
        throw new ValidationError("totalOfTables or totalOfPlugs cannot change")
    }

    await Cafe.update(cafeId, cafe);
    res.status(200).json({ status: "ok" });
}

export const patchCafeTableController = async (req, res) => {
    const cafeId = req.params.cafeId;
    const tableId = req.params.tableId;
    if (Object.keys(req.body) == 0) {
        throw new ValidationError("need data");
    }
    await Cafe.updateCafeTable(cafeId, tableId, req.body);
    res.status(200).json({ status: "ok" });
}

export const deleteController = async (req, res) => {
    const cafeId = req.params.cafeId;
    // valid
    if (cafeId == null) {
        throw new ValidationError("need id");
    }
    await Cafe.deleteCafe(cafeId);
    res.status(200).json({ status: "ok" });
};

export const deleteCafeTableController = async (req, res) => {
    const cafeId = req.params.cafeId;
    const tableId = req.params.tableId;
    if (cafeId == null || tableId == null) {
        throw new ValidationError("need id");
    }
    await Cafe.deleteCafeTable(cafeId, tableId);
    res.status(200).json({ status: "ok" });
};