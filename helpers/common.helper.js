function handleError(res, message, error, statusCode = 500) {
    return res.status(statusCode).json({
        message,
        error
    })
}

module.exports = { handleError }