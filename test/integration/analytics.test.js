const request = require('supertest');
const mongoose = require('mongoose');
const { describe, it, beforeEach, afterEach, expect } = require('@jest/globals');

const { User } = require('../../models/user');
const { Khata } = require('../../models/khata');
const { Transaction } = require('../../models/transaction');

let server, token1, token2;

const user1 = new User({
    _id: mongoose.Types.ObjectId(),
    phoneNumber: '1313131210',
    name: 'name1',
});
const user2 = new User({
    _id: mongoose.Types.ObjectId(),
    phoneNumber: '1313131212',
    name: 'name2',
})

describe('/api/analytics', () => {
    beforeEach(async () => {
        server = require('../../index');
    });

    afterEach(async () => {
        await server.close();
        await User.deleteMany({});
        await Khata.deleteMany({});
    });

    describe('GET /khatasWithTransactionsFromBothUsers', () => {
        const executeRequest = () => {
            return request(server)
                .get('/api/analytics/khatasWithTransactionsFromBothUsers')
        }

        it('should return response with 200 status and only one khata', async () => {
            const khataId1 = mongoose.Types.ObjectId();
            await Khata.create({
                _id: khataId1,
                userName: user1.name,
                friendName: 'f1',
                userId: user1._id,
                friendPhoneNumber: user1.phoneNumber,
                userPhoneNumber: user2.phoneNumber,
                interestType: 'N',
                localId: '1',
                rotationPeriod: '3M',
                updatedTimeStamp: 1211231231231,
                deviceId: '123',
                settledFlag: true,
                interest: 0,
            })
            await Transaction.create({
                _id: mongoose.Types.ObjectId(),
                khataId: khataId1,
                userId: user1._id,
                userName: user1.name,
                userPhoneNumber: user1.phoneNumber,
                amount: 100,
                date: 1211231231231,
                type: 'C',
            })
            await Transaction.create({
                _id: mongoose.Types.ObjectId(),
                khataId: khataId1,
                userId: user2._id,
                userName: user2.name,
                userPhoneNumber: user2.phoneNumber,
                amount: 100,
                date: 1211231231231,
                type: 'C',
            })
            const res = await executeRequest();
            expect(res.status).toBe(200);
            expect(res.body.total).toBe(1);
            expect(res.body.response[0].senderCount).toBe(2);
        })

        it('should return response with 200 status and no khatas', async () => {
            const khataId1 = mongoose.Types.ObjectId();
            await Khata.create({
                _id: khataId1,
                userName: user1.name,
                friendName: 'f1',
                userId: user1._id,
                friendPhoneNumber: user1.phoneNumber,
                userPhoneNumber: user2.phoneNumber,
                interestType: 'N',
                localId: '1',
                rotationPeriod: '3M',
                updatedTimeStamp: 1211231231231,
                deviceId: '123',
                settledFlag: true,
                interest: 0,
            })
            await Transaction.create({
                _id: mongoose.Types.ObjectId(),
                khataId: khataId1,
                userId: user1._id,
                userName: user1.name,
                userPhoneNumber: user1.phoneNumber,
                amount: 100,
                date: 1211231231231,
                type: 'C',
            })
            await Transaction.create({
                _id: mongoose.Types.ObjectId(),
                khataId: khataId1,
                userId: user1._id,
                userName: user1.name,
                userPhoneNumber: user1.phoneNumber,
                amount: 100,
                date: 1211231231231,
                type: 'C',
            })
            const res = await executeRequest();
            expect(res.status).toBe(200);
            expect(res.body.total).toBe(0);
            expect(res.body.response.length).toBe(0);
        })
    });

});
