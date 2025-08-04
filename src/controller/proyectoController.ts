import { Request, Response } from 'express'
import prisma from '../prisma/client'

// Obtener todos
export const getProyectos = async (req: Request, res: Response) => {
  try {
    const proyectos = await prisma.proyecto.findMany()
    res.json(proyectos)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener proyectos' })
  }
}

// Crear nuevo
export const createProyecto = async (req: Request, res: Response) => {
  try {
    const {
      titulo,
      descripcion,
      tecnologias,
      imagenUrl,
      demoUrl,
      githubUrl,
      categoriaId,
    } = req.body;

    const nuevo = await prisma.proyecto.create({
      data: {
        titulo,
        descripcion,
        tecnologias,
        imagenUrl,
        demoUrl,
        githubUrl,
        categoriaId,
      },
    });

    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear proyecto' });
  }
};

// Actualizar
export const updateProyecto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      tecnologias,
      categoriaId,
      imagenUrl,
      demoUrl,
      githubUrl,
    } = req.body;

    const actualizado = await prisma.proyecto.update({
      where: { id: Number(id) },
      data: {
        titulo,
        descripcion,
        tecnologias,
        categoriaId,
        imagenUrl,
        demoUrl,
        githubUrl,
      },
    });

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar proyecto' });
  }
};


// Eliminar
export const deleteProyecto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.proyecto.delete({ where: { id: Number(id) } })
    res.json({ message: 'Proyecto eliminado' })
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar proyecto' })
  }
}
