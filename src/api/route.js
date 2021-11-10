import {
    Router,
} from "express";
import * as Cafe from 'src/api/controllers/cafe';
import {
    asyncHandler,
    errorHander,
} from "./middleware";

export const apiRouter = Router();

// todo router channing

apiRouter
    .get('/cafes/:id', asyncHandler(Cafe.getByIdController))
    .use(errorHander);

apiRouter
    .get('/cafes', asyncHandler(Cafe.findCafeController))
    .post('/cafes', asyncHandler(Cafe.addNewController))
    .post('/cafes/:id/tables', asyncHandler(Cafe.addNewTableController))
    .get('/cafes/:id/tables', asyncHandler(Cafe.getTablesController))
    .get('/cafes/:cafeId/tables/:tableId', asyncHandler(Cafe.getCafeTableController))
    .use(errorHander);

