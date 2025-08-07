import { Request, Response } from 'express';
import prisma from '../prisma/client';

interface RedSocialInput {
  nombre: string;
  url: string;
  icono: string;
  activo?: boolean;
}

// Obtener todas las redes sociales
export const getRedes = async (_req: Request, res: Response) => {
  try {
    const redes = await prisma.redSocial.findMany({
      where: { activo: true }
    });
    res.json(redes);
  } catch (error) {
    console.error('Error al obtener redes sociales:', error);
    res.status(500).json({ 
      message: 'Error al obtener redes sociales',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Crear nueva red social
export const createRed = async (req: Request, res: Response) => {
  try {
    const { nombre, url, icono, activo }: RedSocialInput = req.body;

    // Validación más completa
    if (!nombre || !url || !icono) {
      return res.status(400).json({ message: 'Faltan campos requeridos: nombre, url, icono' });
    }

    // Validar URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ message: 'La URL proporcionada no es válida' });
    }

    const nuevaRed = await prisma.redSocial.create({
      data: { 
        nombre, 
        url, 
        icono, 
        activo: activo ?? true 
      },
    });

    res.status(201).json(nuevaRed);
  } catch (error) {
    console.error('Error al crear red social:', error);
    res.status(500).json({ 
      message: 'Error al crear red social',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Actualizar red social
export const updateRed = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, url, icono, activo }: RedSocialInput = req.body;

    if (!nombre || !url || !icono) {
      return res.status(400).json({ message: 'Faltan campos requeridos: nombre, url, icono' });
    }

    // Verificar si existe la red social
    const redExistente = await prisma.redSocial.findUnique({
      where: { id: Number(id) }
    });

    if (!redExistente) {
      return res.status(404).json({ message: 'Red social no encontrada' });
    }

    // Validar URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ message: 'La URL proporcionada no es válida' });
    }

    const redActualizada = await prisma.redSocial.update({
      where: { id: Number(id) },
      data: { nombre, url, icono, activo },
    });

    res.json(redActualizada);
  } catch (error) {
    console.error('Error al actualizar red social:', error);
    res.status(500).json({ 
      message: 'Error al actualizar red social',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Eliminar red social (borrado lógico)
export const deleteRed = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar si existe la red social
    const redExistente = await prisma.redSocial.findUnique({
      where: { id: Number(id) }
    });

    if (!redExistente) {
      return res.status(404).json({ message: 'Red social no encontrada' });
    }

    // Borrado lógico en lugar de físico
    const redEliminada = await prisma.redSocial.update({
      where: { id: Number(id) },
      data: { activo: false },
    });

    res.json({ 
      message: 'Red social desactivada',
      data: redEliminada
    });
  } catch (error) {
    console.error('Error al eliminar red social:', error);
    res.status(500).json({ 
      message: 'Error al eliminar red social',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};