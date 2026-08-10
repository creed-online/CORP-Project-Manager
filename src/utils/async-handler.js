const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve()
            .then(() => requestHandler(req, res, next))
            .catch((error) => next(error));
    };
};

export default asyncHandler;