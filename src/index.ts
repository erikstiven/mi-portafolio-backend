import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth'
import proyectoRoutes from './routes/proyectos'
import categoriasRouter from './routes/categorias'
import servicioRoutes from './routes/servicios'
import redesRoutes from './routes/redes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())


app.use('/api/auth', authRoutes)
app.use('/api/proyectos', proyectoRoutes)
app.use('/api/categorias', categoriasRouter)
app.use('/api/servicios', servicioRoutes)
app.use('/api/redes', redesRoutes)

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
