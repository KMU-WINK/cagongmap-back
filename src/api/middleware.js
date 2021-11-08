
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
    return res.status(500).json({ status: 'error', message: err.message });
};
