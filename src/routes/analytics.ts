import express from 'express';

const router = express.Router();

const { User } = require('../models/user');
const { Transaction } = require('../models/transaction');
const { Khata } = require('../models/khata');


router.get('/numberOfUsers', async (req: any, res: any) => {
    const numberOfUsers = await User.countDocuments();

    res.status(200).send({ numberOfUsers });
});

router.get('/numberOfKhatas', async (req: any, res: any) => {
    const numberOfKhatas = await Khata.countDocuments();

    res.status(200).send({ numberOfKhatas });
});

router.get('/numberOfTransactions', async (req: any, res: any) => {
    const numberOfTransactions = await Transaction.countDocuments();

    res.status(200).send({ numberOfTransactions });
});

router.get('/usersInLastnDays', async (req: any, res: any) => {
    const usersInLast30Days = User.countDocuments({
        createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        }
    });
    const usersInLast60Days = User.countDocuments({
        createdAt: {
            $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        }
    });
    const usersInLast90Days = User.countDocuments({
        createdAt: {
            $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        }
    });

    const response = await Promise.all([usersInLast30Days, usersInLast60Days, usersInLast90Days]);

    res.status(200).send({ usersInLast30Days: response[0], usersInLast60Days: response[1], usersInLast90Days: response[2] });
});

router.get('/khatasInLastnDays', async (req: any, res: any) => {
    const khatasInLast30Days = Khata.countDocuments({
        updatedTimeStamp: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        }
    });
    const khatasInLast60Days = Khata.countDocuments({
        updatedTimeStamp: {
            $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        }
    });
    const khatasInLast90Days = Khata.countDocuments({
        updatedTimeStamp: {
            $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        }
    });

    const response = await Promise.all([khatasInLast30Days, khatasInLast60Days, khatasInLast90Days]);

    res.status(200).send({ khatasInLast30Days: response[0], khatasInLast60Days: response[1], khatasInLast90Days: response[2] });
});

router.get('/transactionsInLastnDays', async (req: any, res: any) => {
    const transactionsInLast30Days = Transaction.countDocuments({
        updatedTimeStamp: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        }
    });
    const transactionsInLast60Days = Transaction.countDocuments({
        updatedTimeStamp: {
            $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        }
    });
    const transactionsInLast90Days = Transaction.countDocuments({
        updatedTimeStamp: {
            $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        }
    });

    const response = await Promise.all([transactionsInLast30Days, transactionsInLast60Days, transactionsInLast90Days]);

    res.status(200).send({ transactionsInLast30Days: response[0], transactionsInLast60Days: response[1], transactionsInLast90Days: response[2] });
});

router.get('/usersWithAtLeastnTransactions', async (req: any, res: any) => {
    const usersWithAtLeastnTransactions = await Transaction.aggregate([
        {
            $group: {
                _id: '$userId', transactionCount: { $sum: 1 }
            },
        },
        {
            $facet: {
                usersWithAtLeast0Transactions: [
                    { $match: { transactionCount: { $gt: 0 } } },
                    { $count: 'count' }
                ],
                usersWithAtLeast10Transactions: [
                    { $match: { transactionCount: { $gt: 10 } } },
                    { $count: 'count' }
                ],
                usersWithAtLeast100Transactions: [
                    { $match: { transactionCount: { $gt: 100 } } },
                    { $count: 'count' }
                ]
            }
        }
    ]);

    res.status(200).send(usersWithAtLeastnTransactions);
});

router.get('/usersWithAtLeastnKhatas', async (req: any, res: any) => {
    const usersWithMoreThan0Khatas = await Khata.aggregate([
        {
            $group: {
                _id: '$userId', khatasCount: { $sum: 1 }
            },
        },
        {
            $facet: {
                usersWithMoreThan0Khatas: [
                    { $match: { khatasCount: { $gt: 0 } } },
                    { $count: 'count' }
                ],
                usersWithMoreThan5Khatas: [
                    { $match: { khatasCount: { $gt: 5 } } },
                    { $count: 'count' }
                ],
            }
        }
    ]);

    res.status(200).send(usersWithMoreThan0Khatas);
});

router.get('/averageTransactionsPerUser', async (req: any, res: any) => {
    const numberOfTransactions = await Transaction.countDocuments();
    const numberOfUsers = await User.countDocuments();

    const averageTransactionsPerUser = numberOfTransactions / numberOfUsers;

    res.status(200).send({ averageTransactionsPerUser });
});

router.get('/averageKhatasPerUser', async (req: any, res: any) => {
    const numberOfKhatas = await Khata.countDocuments();
    const numberOfUsers = await User.countDocuments();

    const averageKhatasPerUser = numberOfKhatas / numberOfUsers;

    res.status(200).send({ averageKhatasPerUser });
});

router.get('/usersActiveInLast30Days', async (req: any, res: any) => {
    const usersActiveInLast30Days = await Transaction.countDocuments({
        updatedTimeStamp: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        }
    });

    res.status(200).send({ usersActiveInLast30Days });
});


module.exports = router