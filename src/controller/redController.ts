import { Request, Response } from 'express';
import prisma from '../prisma/client';

// Obtener todas las redes sociales
export const getRedes = async (_req: Request, res: Response) => {
  try {
    const redes = await prisma.redSocial.findMany();
    res.json(redes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener redes' });
  }
};

// Crear nueva red social
export const createRed = async (req: Request, res: Response) => {
  try {
    const { nombre, url, activo } = req.body;
    const nueva = await prisma.redSocial.create({
      data: { nombre, url, activo },
    });
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear red social' });
  }
};

// Actualizar red social
export const updateRed = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, url, activo } = req.body;
    const actualizada = await prisma.redSocial.update({
      where: { id: Number(id) },
      data: { nombre, url, activo },
    });
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar red social' });
  }
};

// Eliminar red social
export const deleteRed = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.redSocial.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Red social eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar red social' });
  }
};
