import {
    Router,
} from "express";
import * as Cafe from 'src/api/controllers/cafe';
import {
    asyncHandler,
    errorHander,
} from "./middleware";


export const apiRouter = Router();


// const model = require('./model');
// const Cafe = model.cafe;
// const Table = model.table;

// const isEmptyObject = function (obj) {
//     return obj && Object.keys(obj).length <= 0
// }

// router.get('/cafes/:id', async (req, res) => {
//     res.send(await Cafe.findById(req.params.id).exec());
// });

// router.get('/cafes', async (req, res) => {
//     const countOfQueries = Object.keys(req.query).length;
//     if (countOfQueries < 2) {
//         res.status(401).send("need parameters");
//         return;
//     }
//     const lng = req.query.lng; //위도
//     const lat = req.query.lat;   // 경도
//     const range = req.query.range === undefined ? 1000 : req.query.range; //범위
//     var page = 0;
//     var perPage = 10;
//     if (!isEmptyObject(req.body) && Object.keys(req.body).length == 2) {
//         page = req.body.page;
//         perPage = req.body.perPage;
//     }

//     const documents = await Cafe.find({
//         location: {
//             $near: {
//                 $geometry: {
//                     type: 'Point',
//                     coordinates: [lng, lat]
//                 },
//                 $maxDistance: range
//             }
//         }
//     }).skip(page * perPage).limit(perPage).exec();
//     res.send({ cafes: documents, page: page + 1 });
// });

// router.post('/cafes', async (req, res) => {
//     req.body.location = { type: 'Point', coordinates: req.body.location.coordinates };
//     const doesCafeExist = await Cafe.exists({ name: req.body.name })
//     if (doesCafeExist) {
//         res.status(409).send({ status: "error", message: "already exist" });
//         return;
//     }
//     const cafe = await Cafe.create(req.body).save();
//     res.status(201).send({ status: "ok", cafe: cafe });
// });

const controller = async (req, res) => {
    const tables = await Table
        .findById(req.params.id)
        .exec();
    // 성공여부 반환
    res.status(200).json({ success: false, data });
    res.json({ tables });
}

// 사용 예
apiRouter
    .get('/tables/:id', asyncHandler(controller))
    .use(errorHander);

apiRouter
    .get('/cafes/:id', asyncHandler(Cafe.getByIdController))
    .use(errorHander);

apiRouter
    .post('/cafes', asyncHandler(Cafe.addNewController))
    .use(errorHander);

