import { Router } from 'express'
import { pool } from '../helper/db.js'

const router = Router()

router.get('/', (req, res, next) => {
  pool.query('SELECT * FROM task', (err, result) => {
    if (err) return next(err)
    res.status(200).json(result.rows || [])
  })
})

router.post('/create', (req, res, next) => {
  const { task } = req.body
  if (!task || !task.description || !task.description.trim()) {
    const error = new Error('Task is required')
    error.status = 400
    return next(error)
  }

  pool.query(
    'INSERT INTO task (description) VALUES ($1) RETURNING id, description',
    [task.description.trim()],
    (err, result) => {
      if (err) return next(err)
      const row = result.rows[0]
      res.status(201).json({ id: row.id, description: row.description })
    }
  )
})

router.delete('/delete/:id', (req, res, next) => {
  const { id } = req.params
  pool.query('DELETE FROM task WHERE id = $1', [id], (err, result) => {
    if (err) return next(err)
    if (result.rowCount === 0) {
      const error = new Error('Task not found')
      error.status = 404
      return next(error)
    }
    return res.status(200).json({ id })
  })
})

export default router
