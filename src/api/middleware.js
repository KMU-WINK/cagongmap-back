import { NotExists, AlreadyExists } from 'src/service';
import { ValidationError } from 'src/api/controllers/cafe';
export const asyncHandler = (fn) => (
    req,
    res,
    next,
) => Promise.resolve(fn(req, res, next)).catch(next);

export const errorHander = (
    err,
    req,
    res,
    next,
) => {
    if (err instanceof NotExists) {
        return res.status(204).send();
    }
    if (err instanceof AlreadyExists ||
        err instanceof ValidationError) {
        return res.status(400).json({ status: err.name, message: err.message });
    }
    return res.status(500).json({ status: 'error', message: err.message });
};
