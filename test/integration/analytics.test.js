const request = require('supertest');
const mongoose = require('mongoose');
const { describe, it, beforeEach, afterEach, expect } = require('@jest/globals');

const { User } = require('../../models/user');
const { Khata } = require('../../models/khata');

let server, token;

const userid = mongoose.Types.ObjectId();

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
        beforeEach(async () => {
            token = new User({
				_id: userid,
				phoneNumber: '1313131212',
				name: 'name1',
			}).generateAuthToken();
        })

        const executeRequest = (token) => {
            return request(server)
                .get('/api/analytics/khatasWithTransactionsFromBothUsers')
                .set('x-auth-token', token)
        }

        it('should return response with 200 status', async () => {
            
            const res = await executeRequest(token);
            expect(res.status).toBe(200);
        })
    });

});
