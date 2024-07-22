function isValidTimeStamp(value) {
    const date = new Date(value);
    return !isNaN(date.getTime());
}


module.exports = {
    isValidTimeStamp
}