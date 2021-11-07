import * as Cafe from 'src/service/cafe'


export const getByIdController = async (req, res) => {
    if (req.params.id === undefined) {
        throw Error("give a id");
    }
    const document = await Cafe.getById(req.params.id);
    res.status(200).json({ status: "ok", data: document });
    return;
};

export const getByLocationController = async (req, res) => {
    const countOfQueries = Object.keys(req.query).length;
    if (countOfQueries < 2) {
        throw Error("need parameters");
    }
    const lng = req.query.lng; //위도
    const lat = req.query.lat; //경도
    const range = req.query.range === undefined ? 1000 : req.query.range; 범위
    var page = 0;
    var perPage = 10;
    if (!isEmptyObject(req.body) && Object.keys(req.body).length == 2) {
        page = req.body.page;
        perPage = req.body.perPage;
    }
    const documents = await Cafe.getByLocation(lng, lat, range, page, perPage);
    res.status(200).json({ status: "ok", data: documents });
    return;
}

export const addNewController = async (req, res) => {
    req.body.location = { type: 'Point', coordinates: req.body.location.coordinates };
    const doesCafeExist = await Cafe.exists({ name: req.body.name })
    if (doesCafeExist) {
        throw Error("already exist");
    }
    const doucment = await Cafe.addNew(req.body);
    return doucment;
}
