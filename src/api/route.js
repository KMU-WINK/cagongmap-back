import {
    Router,
} from "express";
import * as Cafe from 'src/api/controllers/cafe';
import {
    asyncHandler,
    errorHander,
} from "./middleware";

export const apiRouter = Router();

apiRouter
    .get('/cafes', asyncHandler(Cafe.findCafeController))
    .get('/cafes/:cafeId', asyncHandler(Cafe.getByIdController))
    .get('/cafes/:cafeId/tables', asyncHandler(Cafe.getTablesController))
    .get('/cafes/:cafeId/tables/:tableId', asyncHandler(Cafe.getCafeTableController))
    .get('/cafes/:cafeId/images', asyncHandler(Cafe.getCafeImagesController))

    .post('/cafes', asyncHandler(Cafe.addNewController))
    .post('/cafes/:cafeId/tables', asyncHandler(Cafe.addNewTableController))
    .post('/cafes/:cafeId/images', asyncHandler(Cafe.addNewImageController))

    .delete('/cafes/:cafeId', asyncHandler(Cafe.deleteController))
    .delete('/cafes/:cafeId/tables/:tableId', asyncHandler(Cafe.deleteCafeTableController))

    .patch('/cafes/:cafeId', asyncHandler(Cafe.patchController))
    .patch('/cafes/:cafeId/tables/:tableId', asyncHandler(Cafe.patchCafeTableController))
    .use(errorHander);

