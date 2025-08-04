import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const getServicios = async (req: Request, res: Response) => {
  try {
    const servicios = await prisma.servicio.findMany();
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener servicios' });
  }
};

export const createServicio = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, precio } = req.body;
    const nuevo = await prisma.servicio.create({
      data: { nombre, descripcion, precio },
    });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear servicio' });
  }
};

export const updateServicio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;

    const actualizado = await prisma.servicio.update({
      where: { id: Number(id) },
      data: { nombre, descripcion, precio },
    });

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar servicio' });
  }
};

export const deleteServicio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.servicio.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Servicio eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar servicio' });
  }
};
