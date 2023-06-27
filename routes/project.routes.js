const router = require("express").Router();

const mongoose = require("mongoose");

const Project = require("../models/Project.model");
const Task = require("../models/Task.model");

//  POST /api/projects  -  Creates a new project
router.post("/projects", (req, res, next) => {
  const { title, description } = req.body;

  Project.create({ title, description, tasks: [] })
    .then(response => res.status(201).json(response))
    .catch(err => res.status(500).json(err));
});

router.get("/projects", (req, res, next) => {
    Project.find()
      .populate('tasks')
      .then(response => res.status(200).json(response))
      .catch(err => res.status(500).json(err));
  });

//  GET /api/projects/:projectId  -  Get details of a specific project by id
router.get('/projects/:projectId', (req, res, next) => {
    
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }


    Project.findById(projectId)
        .populate('tasks')
        .then(project => res.json(project))
        .catch(err => {
            console.log("error getting details of a project", err);
            res.status(500).json({
                message: "error getting details of a project",
                error: err
            });
        })
});


// PUT /api/projects/:projectId  -  Updates a specific project by id
router.put('/projects/:projectId', (req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    const newDetails = {
        title: req.body.title,
        description: req.body.description,
        tasks: req.body.tasks
    }

    Project.findByIdAndUpdate(projectId, newDetails, { new: true })
        .then((updatedProject) => res.json(updatedProject))
        .catch(err => {
            console.log("error updating project", err);
            res.status(500).json({
                message: "error updating project",
                error: err
            });
        })
});

// DELETE /api/projects/:projectId  -  Delete a specific project by id
router.delete('/projects/:projectId', (req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    Project.findByIdAndRemove(projectId)
        .then(deteletedProject => {
            return Task.deleteMany({ _id: { $in: deteletedProject.tasks } });
        })
        .then(() => res.json({ message: `Project with id ${projectId} & all associated tasks were removed successfully.` }))
        .catch(err => {
            console.log("error deleting project", err);
            res.status(500).json({
                message: "error deleting project",
                error: err
            });
        })
});
  
module.exports = router;
