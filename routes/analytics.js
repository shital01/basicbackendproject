const express = require('express');

const router = express.Router();
const { forEach } = require('lodash');

const { User } = require('../models/user');
const { Transaction } = require('../models/transaction');
const { Khata } = require('../models/khata');


router.get('/numberOfUsers', async (req, res) => {
    const numberOfUsers = await User.countDocuments();

    res.status(200).send({ numberOfUsers });
});

router.get('/numberOfKhatas', async (req, res) => {
    const numberOfKhatas = await Khata.countDocuments();

    res.status(200).send({ numberOfKhatas });
});

router.get('/numberOfTransactions', async (req, res) => {
    const numberOfTransactions = await Transaction.countDocuments();

    res.status(200).send({ numberOfTransactions });
});

router.get('/usersInLastnDays', async (req, res) => {
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

router.get('/khatasInLastnDays', async (req, res) => {
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

router.get('/transactionsInLastnDays', async (req, res) => {
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

router.get('/usersWithAtLeastnTransactions', async (req, res) => {
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

router.get('/usersWithAtLeastnKhatas', async (req, res) => {
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

router.get('/averageTransactionsPerUser', async (req, res) => {
    const numberOfTransactions = await Transaction.countDocuments();
    const numberOfUsers = await User.countDocuments();

    const averageTransactionsPerUser = numberOfTransactions / numberOfUsers;

    res.status(200).send({ averageTransactionsPerUser });
});

router.get('/averageKhatasPerUser', async (req, res) => {
    const numberOfKhatas = await Khata.countDocuments();
    const numberOfUsers = await User.countDocuments();

    const averageKhatasPerUser = numberOfKhatas / numberOfUsers;

    res.status(200).send({ averageKhatasPerUser });
});

router.get('/usersActiveInLast30Days', async (req, res) => {
    const usersActiveInLast30Days = await Transaction.countDocuments({
        updatedTimeStamp: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        }
    });

    res.status(200).send({ usersActiveInLast30Days });
});


router.get(
    '/khatasWithTransactionsFromBothUsers',
    async (req, res) => {
        const khatas = await Khata.aggregate([
            {
                $lookup: {
                    from: 'transactions',
                    localField: '_id',
                    foreignField: 'khataId',
                    as: 'transactions',
                },
            },
        ]);

        const khatasWithReducedTransactions = khatas
            .filter((k) => k.transactions.length > 1)
            .map((k) => {
                const transactionSet = new Set();
                forEach(k.transactions, (transaction) => {
                    transactionSet.add(transaction.userPhoneNumber);
                });
                k.senderCount = transactionSet.size;
                k.senderSet = transactionSet;
                return k;
            })

        const khatasWithTransactionsFromBothUsers = khatasWithReducedTransactions
            .filter((k) => k.senderCount == 2)

        const response = khatasWithTransactionsFromBothUsers.map((k) => {
            delete k.transactions;
            return k;
        });

        res.send({
            error: null,
            response: response,
            total: response.length
        });
    },
);


module.exports = router