import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import prisma from '../prisma/client';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}


dotenv.config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Obtener todos los proyectos
export const getProyectos = async (req: Request, res: Response) => {
  try {
    const proyectos = await prisma.proyecto.findMany({
      include: {
        categoria: true,
      },
    });
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener proyectos' });
  }
};

// Crear un nuevo proyecto
export const createProyecto = async (req: Request, res: Response) => {
    console.log('[CREAR PROYECTO] req.body:', req.body);

  try {
    console.log('[CREAR PROYECTO] Body recibido:', req.body); // <--- LOG DE DEBUG
    const {
      titulo,
      descripcion,
      tecnologias,
      imagenUrl,
      demoUrl,
      githubUrl,
      categoriaId,
      destacado,
      nivel,
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
        destacado,
        nivel,
      },
    });

    res.status(201).json(nuevo);
  } catch (error: any) {
    console.error('[ERROR AL CREAR PROYECTO]', error); // <---- MUESTRA EL ERROR REAL
    res.status(500).json({ message: 'Error al crear proyecto', detalle: error.message });
  }
};


// Actualizar un proyecto
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
      destacado,
      nivel,
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
        destacado,
        nivel,
      },
    });

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar proyecto' });
  }
};

// Eliminar un proyecto
export const deleteProyecto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.proyecto.delete({ where: { id: Number(id) } });
    res.json({ message: 'Proyecto eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar proyecto' });
  }
};



// Subir imagen a Cloudinary
export const uploadImagenProyecto = async (req: MulterRequest, res: Response) => {
  try {
    // 🔍 LOG DE DEBUG MUY IMPORTANTE
     console.log('>>>>>>>>>>>>>> [UPLOAD ROUTE] Ejecutando función uploadImagenProyecto');
  console.log('[UPLOAD ROUTE] req.file:', req.file);
  console.log('[UPLOAD ROUTE] req.body:', req.body);
    // Antes de cualquier cosa
console.log('[UPLOAD ROUTE] Llamado POST multipart/form-data');
console.log('[UPLOAD ROUTE] req.headers:', req.headers);
console.log('[UPLOAD ROUTE] req.body:', req.body);
console.log('[UPLOAD ROUTE] req.file:', req.file);

      console.log('[UPLOAD ROUTE] Llamado', req.method, req.headers['content-type']);

    console.log('[UPLOAD ROUTE] file:', req.file);     // ← AQUÍ
  console.log('[UPLOAD ROUTE] body:', req.body);      // ← AQUÍ
  console.log('[UPLOAD ROUTE] headers:', req.headers); // ← AQUÍ
    console.log('[UPLOAD ROUTE] file:', req.file);

    const file = req.file;

    if (!file) {
      console.log('[UPLOAD ROUTE ERROR] No file received:', req.body, req.headers);
      return res.status(400).json({ error: 'No se envió ninguna imagen' });
    }

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'proyectos' },
        (err, result) => {
          if (err) {
            console.log('[CLOUDINARY ERROR]', err);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
      stream.end(file.buffer);
    });

    return res.json({ url: result.secure_url });
  } catch (error) {
    console.log('[UPLOAD ROUTE ERROR]', error);
    return res.status(500).json({
      error: 'Error al subir la imagen',
      detalle: (error as Error).message || error,
    });
  }
};