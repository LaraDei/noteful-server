const path = require('path')
const express = require('express')
const xss = require('xss')
const NotesService = require('./notes.service')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = Note => ({
  id: Note.id,
  note_name: xss(Note.note_name),
  date_modified: Note.date_modified,
  folder_id: Note.folder_id,
  content: xss(Note.content)
})

notesRouter
  .route('/')
  .get((req, res, next) => {
    NotesService.getAllNotes(
      req.app.get('db')
    )
      .then(Notes => {
        res.json(Notes)
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { note_name, folder_id, content} = req.body
    const newNote = {  note_name, folder_id, content }

    for (const [key, value] of Object.entries(newNote)) {
        if (value == null) {
            return res.status(400).json({
                error: { message: `Missing '${key}' in request body` }
            })
        }
    }
    
    NotesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(Note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${Note.id}`))
          .json(serializeNote(Note))
      })
      .catch(next)
  })

  notesRouter
  .route('/:Note_id')
  .all((req, res, next) => {
    NotesService.getById(
      req.app.get('db'),
      req.params.Note_id
    )
      .then(Note => {
        if (!Note) {
          return res.status(404).json({
            error: { message: `Note doesn't exist` }
          })
        }
        res.Note = Note
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.Note))
  })  
  .delete((req, res, next) => {
    NotesService.deleteNote(
      req.app.get('db'),
      req.params.Note_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const {  note_name, folder_id, content } = req.body
    const NoteToUpdate  = {  note_name, folder_id, content }

   const numberOfValues = Object.values(NoteToUpdate).filter(Boolean).length
        if (numberOfValues  === 0) {
            return res.status(400).json({
                error: { message: `Request body must contain either 'title', 'style' or 'content'` }
            })
        }

    NotesService.updateNote(
      req.app.get('db'),
      req.params.Note_id,
      NoteToUpdate
    )
      .then(numRowsAffected  => {
        res
          .status(204).end()
      })
      .catch(next)
  })

module.exports = notesRouter