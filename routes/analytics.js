const express = require('express');

const router = express.Router();

const { User } = require('../models/user');
const { Transaction } = require('../models/transaction');
const { Khata } = require('../models/khata');


router.get('/numberOfUsers', async (req, res) => {
    try {
        const numberOfUsers = await User.countDocuments();

        res.status(200).send({ numberOfUsers });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/numberOfKhatas', async (req, res) => {
    try {
        const numberOfKhatas = await Khata.countDocuments();

        res.status(200).send({ numberOfKhatas });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/numberOfTransactions', async (req, res) => {
    try {
        const numberOfTransactions = await Transaction.countDocuments();

        res.status(200).send({ numberOfTransactions });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/usersInLastnDays', async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/khatasInLastnDays', async (req, res) => {
    try {
        const khatasInLast30Days = Khata.countDocuments({
            createdAt: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            }
        });
        const khatasInLast60Days = Khata.countDocuments({
            createdAt: {
                $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            }
        });
        const khatasInLast90Days = Khata.countDocuments({
            createdAt: {
                $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            }
        });

        const response = await Promise.all([khatasInLast30Days, khatasInLast60Days, khatasInLast90Days]);

        res.status(200).send({ khatasInLast30Days: response[0], khatasInLast60Days: response[1], khatasInLast90Days: response[2] });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/transactionsInLastnDays', async (req, res) => {
    try {
        const transactionsInLast30Days = Transaction.countDocuments({
            createdAt: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            }
        });
        const transactionsInLast60Days = Transaction.countDocuments({
            createdAt: {
                $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            }
        });
        const transactionsInLast90Days = Transaction.countDocuments({
            createdAt: {
                $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            }
        });

        const response = await Promise.all([transactionsInLast30Days, transactionsInLast60Days, transactionsInLast90Days]);

        res.status(200).send({ transactionsInLast30Days: response[0], transactionsInLast60Days: response[1], transactionsInLast90Days: response[2] });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/usersWithAtLeastnTransactions', async (req, res) => {
    try {
        const usersWithAtLeast0Transactions = User.countDocuments({
            transactions: {
                $gt: 0
            }
        });
        const usersWithAtLeast10Transactions = User.countDocuments({
            transactions: {
                $gt: 10
            }
        });
        const usersWithAtLeast100Transactions = User.countDocuments({
            transactions: {
                $gt: 100
            }
        });
        const response = await Promise.all([usersWithAtLeast0Transactions, usersWithAtLeast10Transactions, usersWithAtLeast100Transactions]);

        res.status(200).send({ usersWithAtLeast0Transactions: response[0], usersWithAtLeast10Transactions: response[1], usersWithAtLeast100Transactions: response[2] });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/usersWithAtLeastnKhatas', async (req, res) => {
    try {
        const usersWithMoreThan0Khatas = User.countDocuments({
            khatas: {
                $gt: 0
            }
        });

        const usersWithAtLeast10Khatas = User.countDocuments({
            khatas: {
                $gt: 10
            }
        });

        const usersWithAtLeast100Khatas = User.countDocuments({
            khatas: {
                $gt: 100
            }
        });

        const usersWithAtLeastnKhatas = await Promise.all([usersWithMoreThan0Khatas, usersWithAtLeast10Khatas, usersWithAtLeast100Khatas]);

        res.status(200).send({ usersWithMoreThan0Khatas: usersWithAtLeastnKhatas[0], usersWithAtLeast10Khatas: usersWithAtLeastnKhatas[1], usersWithAtLeast100Khatas: usersWithAtLeastnKhatas[2] });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/averageTransactionsPerUser', async (req, res) => {
    try {
        const numberOfTransactions = await Transaction.countDocuments();
        const numberOfUsers = await User.countDocuments();

        const averageTransactionsPerUser = numberOfTransactions / numberOfUsers;

        res.status(200).send({ averageTransactionsPerUser });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/averageKhatasPerUser', async (req, res) => {
    try {
        const numberOfKhatas = await Khata.countDocuments();
        const numberOfUsers = await User.countDocuments();

        const averageKhatasPerUser = numberOfKhatas / numberOfUsers;

        res.status(200).send({ averageKhatasPerUser });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/usersActiveInLast30Days', async (req, res) => {
    try {
        const usersActiveInLast30Days = await User.countDocuments({
            updatedTimeStamp: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            }
        });

        res.status(200).send({ usersActiveInLast30Days });
    } catch (error) {
        res.status(500).send(error);
    }
});


module.exports = router