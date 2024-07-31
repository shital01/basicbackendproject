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
    validateRequest({ query: getNotebookSchema }),

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
        const validatedNotebooks = [];
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
                validatedNotebooks.push(notebook);
            }
        }
        for (const notebook of validatedNotebooks) {
            try {
                const newNotebook = new Notebook(notebook);
                savedEntries.push(await newNotebook.save());
            } catch (error) {
                logger.error(error);
                unsavedEntries.push({
                    notebook
                })
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

        const name = req.body.name ?? originalNotebook.name;
        const description = req.body.description ?? originalNotebook.description;

        const result = await Notebook.updateOne(
            { _id: notebookId, ownerId: userId },
            { $set: { name, description } }
        );
        res.status(200).send({ result });
    }
);

router.put('/trash', auth, device,
    validateRequest({ body: trashNotebookSchema }),
    async (req, res) => {
        const userId = req.user._id;
        const notebookId = req.body.notebookId;
        const result = await Notebook.updateOne(
            { _id: notebookId, ownerId: userId },
            { $set: { trashFlag: true } }
        )

        res.status(200).send({ result });
    });

router.put('/restore', auth, device,
    validateRequest({ body: restoreNotebookSchema }),
    async (req, res) => {
        const userId = req.user._id;
        const notebookId = req.body.notebookId;
        const result = await Notebook.updateOne(
            { _id: notebookId, ownerId: userId },
            { $set: { trashFlag: false } }
        )

        res.status(200).send({ result });
    });

router.put('/delete', auth, device,
    validateRequest({ body: deleteNotebookSchema }),
    async (req, res) => {
        const userId = req.user._id;
        const notebookId = req.body.notebookId;
        const result = await Notebook.updateOne(
            { _id: notebookId, ownerId: userId },
            { $set: { deleteFlag: true } }
        )
        res.status(200).send({ result });
    });


module.exports = router;
