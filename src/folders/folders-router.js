const path = require('path')
const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders.service')

const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = Folder => ({
  id: Folder.id,
  folder_name: Folder.folder_name
})

foldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    FoldersService.getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders.map(serializeFolder))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { folder_name} = req.body
    const newFolder = { folder_name }

    for (const [key, value] of Object.entries(newFolder))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    FoldersService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(Folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${Folder.id}`))
          .json(serializeFolder(Folder))
      })
      .catch(next)
  })

foldersRouter
  .route('/:Folder_id')
  .all((req, res, next) => {
    FoldersService.getById(
      req.app.get('db'),
      req.params.Folder_id
    )
      .then(Folder => {
        if (!Folder) {
          return res.status(404).json({
            error: { message: `Folder doesn't exist` }
          })
        }
        res.Folder = Folder
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeFolder(res.Folder))
  })
  .delete((req, res, next) => {
    FoldersService.deleteFolder(
      req.app.get('db'),
      req.params.Folder_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { folder_name } = req.body
    const FolderToUpdate = { folder_name }

    const numberOfValues = Object.values(FolderToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must folder_name'`
        }
      })

    FoldersService.updateFolder(
      req.app.get('db'),
      req.params.Folder_id,
      FolderToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = foldersRouter