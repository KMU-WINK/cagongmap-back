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
    .use(errorHander);

apiRouter
    .post('/cafes', asyncHandler(Cafe.addNewController))
    .use(errorHander);

