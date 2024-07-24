const express = require('express');
const router = express.Router();

const { validateRequest } = require('../middleware/validateRequest');
const auth = require('../middleware/auth');
const device = require('../middleware/device');

const { Notebook } = require('../models/notebook');
const { getNotebooksSchema, getNotebookSchema, createNotebooksSchema, updateNotebooksSchema } = require('../utils/validations/notebookValidations');


router.get(
    '/',
    auth,
    device,
    validateRequest({ query: getNotebooksSchema }),

    async (req, res) => {
        const userId = req.user._id;
        let lastUpdatedTimeStamp = req.query.lastUpdatedTimeStamp ?? 0;
        let pageSize = req.query.pageSize ?? 10;

        const response = await Notebook.find({
            ownerId: userId,
            updatedTimeStamp: { $gt: lastUpdatedTimeStamp }
        })
            .sort({ updatedTimeStamp: 1 })
            .limit(pageSize);

        if (!response) {
            return res.status(404).send();
        }

        res.status(200).send({ response });
    }
);

router.get(
    '/:id',
    auth,
    device,
    validateRequest({ query: getNotebookSchema }),

    async (req, res) => {
        const userId = req.user._id;

        const notebookId = req.params.id;

        const response = await Notebook.findOne({ _id: notebookId, ownerId: userId });
        if (!response) {
            return res.status(404).send();
        }
        res.status(200).send({ response });
    }
);

router.post(
    '/',
    auth,
    device,
    validateRequest({ body: createNotebooksSchema }),

    async (req, res) => {
        const userId = req.user._id;

        const notebook = new Notebook({
            ownerId: userId,
            name: req.body.name,
            description: req.body.description,
        });

        const result = await notebook.save();
        res.status(201).send({ result });
    }
);

router.put('/:id',
    auth,
    device,
    validateRequest({ body: updateNotebooksSchema }),

    async (req, res) => {
        const userId = req.user._id;
        const notebookId = req.params.id;

        const originalNotebook = await Notebook.findOne({ _id: notebookId, ownerId: userId });

        const name = req.body.name ?? originalNotebook.name;
        const description = req.body.description ?? originalNotebook.description;

        const result = await Notebook.updateOne(
            { _id: notebookId, ownerId: userId },
            { $set: { name, description } }
        );
        res.status(200).send({ result });
    }
);

router.put('/trash', auth, device, async (req, res) => {
    const userId = req.user._id;
    const notebookId = req.body.notebookId;
    const result = await Notebook.updateOne(
        { _id: notebookId, ownerId: userId },
        { $set: { trashFlag: true } }
    )

    res.status(200).send({ result });
});

router.put('/restore', auth, device, async (req, res) => {
    const userId = req.user._id;
    const notebookId = req.body.notebookId;
    const result = await Notebook.updateOne(
        { _id: notebookId, ownerId: userId },
        { $set: { trashFlag: false } }
    )

    res.status(200).send({ result });
});

router.put('/delete', auth, device, async (req, res) => {
    const userId = req.user._id;
    const notebookId = req.body.notebookId;
    const result = await Notebook.updateOne(
        { _id: notebookId, ownerId: userId },
        { $set: { deleteFlag: true } }
    )
    res.status(200).send({ result });
});


module.exports = router;
