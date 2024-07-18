const { Khata } = require('../models/khata');

async function setKhataLastTransactionUpdatedTimeStamp (khataIds) {
    const timeStamp = Date.now();
    // find and update khatas lastTransactionUpdatedTimeStamp to current time
    await Khata.updateMany(
        { _id: { $in: khataIds } },
        { $set: { lastTransactionUpdatedTimeStamp: timeStamp } },
    );
}


module.exports = { setKhataLastTransactionUpdatedTimeStamp }