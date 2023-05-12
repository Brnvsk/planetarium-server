function handleError(res, message, error, statusCode = 500) {
    return res.status(statusCode).json({
        message,
        error
    })
}

function isEqualDates(a, b) {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate()
}

module.exports = { handleError }