import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth'
import proyectoRoutes from './routes/proyectos'
import categoriasRouter from './routes/categorias'
import servicioRoutes from './routes/servicios'
import redesRoutes from './routes/redes'
import experienciaRoutes from './routes/experiencias'


dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
// 👇 AGREGA ESTA LÍNEA aquí:
app.use(express.urlencoded({ extended: true }))

// 👇 1. Primero rutas que usan archivos (proyectos)
app.use('/api/proyectos', proyectoRoutes)

// 👇 2. Después el body parser (JSON)
app.use(express.json())

// 👇 3. El resto de rutas
app.use('/api/auth', authRoutes)
app.use('/api/categorias', categoriasRouter)
app.use('/api/servicios', servicioRoutes)
app.use('/api/redes', redesRoutes)
app.use('/api/experiencias', experienciaRoutes)


app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
