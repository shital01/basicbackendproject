const express = require('express');
const router = express.Router();

const { validateRequest } = require('../middleware/validateRequest');
const auth = require('../middleware/auth');
const device = require('../middleware/device');
const logger = require('../startup/logging');

const { Notebook } = require('../models/notebook');
const {
    getNotebooksSchema,
    getNotebookSchema,
    createNotebooksSchema,
    updateNotebooksSchema,
    trashNotebookSchema,
    restoreNotebookSchema,
    deleteNotebookSchema
} = require('../utils/validations/notebookValidations');


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
            updatedTimeStamp: { $gt: lastUpdatedTimeStamp },
            deleteFlag: false,
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
    validateRequest({ params: getNotebookSchema }),

    async (req, res) => {
        const userId = req.user._id;

        const notebookId = req.params.id;

        const response = await Notebook.findOne({
            _id: notebookId,
            ownerId: userId,
            deleteFlag: false,
        });
        if (!response) {
            return res.status(404).send();
        }
        res.status(200).send({ response });
    }
);

router.post(
    '/multiple',
    auth,
    device,
    async (req, res) => {
        const notebooks = req.body.notebooks;
        const savedEntries = [];
        const unsavedEntries = [];

        for (const notebook of notebooks) {
            const { error } = createNotebooksSchema.validate(notebook);
            if (error) {
                logger.error(error.details[0].message);
                unsavedEntries.push({
                    notebook
                })
            } else {
                notebook.ownerId = req.user._id
                try {
                    const result = await Notebook.create(notebook);
                    savedEntries.push(result);
                } catch (error) {
                    logger.error(error);
                    unsavedEntries.push({
                        notebook
                    })
                }
            }
        }

        res.status(200).send({ savedEntries, unsavedEntries });
    }
);

router.put('/edit/:id',
    auth,
    device,
    validateRequest({ body: updateNotebooksSchema }),

    async (req, res) => {
        const userId = req.user._id;
        const notebookId = req.body.notebookId;

        const originalNotebook = await Notebook.findOne({ _id: notebookId, ownerId: userId });

        if (!originalNotebook) {
            return res.status(404).send();
        }
        const name = req.body.name ?? originalNotebook.name;
        const description = req.body.description ?? originalNotebook.description;

        const result = await Notebook.updateOne(
            { _id: notebookId, ownerId: userId },
            { $set: { name, description, updatedTimeStamp: Date.now() } }
        );

        if (!result || !result.acknowledged) {
            return res.status(404).send();
        }

        res.status(200).send({ result });
    }
);

router.put('/trash', auth, device,
    validateRequest({ body: trashNotebookSchema }),
    async (req, res) => {
        const userId = req.user._id;
        const notebookId = req.body.notebookId;

        const originalNotebook = await Notebook.findOne({ _id: notebookId, ownerId: userId });

        if (!originalNotebook || originalNotebook.trashFlag) {
            return res.status(404).send(
                {
                    message: 'Notebook not found'
                }
            );
        }

        const result = await Notebook.updateOne(
            { _id: notebookId, ownerId: userId },
            { $set: { trashFlag: true, updatedTimeStamp: Date.now() } }
        )
        if (!result || !result.acknowledged) {
            return res.status(404).send();
        }

        res.status(200).send({ result });
    });

router.put('/restore', auth, device,
    validateRequest({ body: restoreNotebookSchema }),
    async (req, res) => {
        const userId = req.user._id;
        const notebookId = req.body.notebookId;

        const originalNotebook = await Notebook.findOne({ _id: notebookId, ownerId: userId });

        if (!originalNotebook || !originalNotebook.trashFlag) {
            return res.status(404).send('Notebook not found in trash');
        }

        const result = await Notebook.updateOne(
            { _id: notebookId, ownerId: userId },
            { $set: { trashFlag: false, updatedTimeStamp: Date.now() } }
        )
        if (!result || !result.acknowledged) {
            return res.status(404).send();
        }

        res.status(200).send({ result });
    });

router.put('/delete', auth, device,
    validateRequest({ body: deleteNotebookSchema }),
    async (req, res) => {
        const userId = req.user._id;
        const notebookId = req.body.notebookId;

        const originalNotebook = await Notebook.findOne({ _id: notebookId, ownerId: userId });

        if (!originalNotebook || originalNotebook.deleteFlag) {
            return res.status(404).send('Notebook not found');
        }

        if (!originalNotebook.trashFlag) {
            return res.status(400).send(
                {
                    message: 'Notebook not in trash'
                }
            );
        }

        const result = await Notebook.updateOne(
            { _id: notebookId, ownerId: userId },
            { $set: { deleteFlag: true, updatedTimeStamp: Date.now() } }
        )
        if (!result || !result.acknowledged) {
            return res.status(404).send();
        }

        res.status(200).send({ result });
    });


module.exports = router;
