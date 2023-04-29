function handleError(res, message, error) {
    return res.status(500).json({
        message,
        error
    })
}

module.exports = { handleError }