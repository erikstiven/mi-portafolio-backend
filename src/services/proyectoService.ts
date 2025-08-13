import prisma from '../prisma/client';
import { uploadBuffer } from '../lib/cloudinary';

type UploadResult = { url: string; public_id: string };

/**
 * Crea un proyecto.
 * Debes enviar portadaBuffer (archivo) o imagenUrl directa.
 * OJO: Tu schema requiere categoriaId; si no lo mandas, Prisma fallará en runtime,
 * por eso aquí simplemente NO enviamos la clave cuando es undefined para satisfacer el tipo TS.
 */
export async function createProyectoWithImage(opts: {
  titulo: string;
  descripcion: string;
  tecnologias: string;
  demoUrl?: string;
  githubUrl?: string;
  categoriaId?: number;   // <- opcional a nivel TS (para evitar el error 2322)
  destacado?: boolean;
  nivel?: string;
  portadaBuffer?: Buffer; // archivo subido (opcional)
  imagenUrl?: string;     // URL directa (opcional si no hay archivo)
}) {
  const newPortada: UploadResult | undefined = opts.portadaBuffer
    ? await uploadBuffer(opts.portadaBuffer, 'portfolio/proyectos/portada', 'image')
    : undefined;

  const finalImagenUrl = newPortada?.url ?? opts.imagenUrl;
  if (!finalImagenUrl) {
    throw new Error('Se requiere portada (archivo) o imagenUrl para crear el proyecto.');
  }

  const data: any = {
    titulo: opts.titulo,
    descripcion: opts.descripcion,
    tecnologias: opts.tecnologias,
    demoUrl: opts.demoUrl ?? undefined,
    githubUrl: opts.githubUrl ?? undefined,
    destacado: opts.destacado ?? false,
    nivel: opts.nivel ?? 'Fullstack',
    imagenUrl: finalImagenUrl,
    // ⚠️ Clave condicional: evita pasar undefined a Prisma (causaba el TS2322)
    ...(opts.categoriaId != null ? { categoriaId: opts.categoriaId } : {}),
  };

  const proyecto = await prisma.proyecto.create({ data });
  return proyecto;
}

/**
 * Actualiza un proyecto.
 * Si viene nueva portadaBuffer, reemplaza imagenUrl con la subida a Cloudinary.
 * También acepta imagenUrl directa (sin archivo).
 */
export async function updateProyectoWithImage(
  id: number,
  opts: {
    titulo?: string;
    descripcion?: string;
    tecnologias?: string;
    demoUrl?: string;
    githubUrl?: string;
    categoriaId?: number; // <- también condicional
    destacado?: boolean;
    nivel?: string;
    portadaBuffer?: Buffer; // si viene, reemplaza imagen
    imagenUrl?: string;     // alternativa si no hay archivo
  }
) {
  const newPortada: UploadResult | undefined = opts.portadaBuffer
    ? await uploadBuffer(opts.portadaBuffer, 'portfolio/proyectos/portada', 'image')
    : undefined;

  const data: any = {
    titulo: opts.titulo,
    descripcion: opts.descripcion,
    tecnologias: opts.tecnologias,
    demoUrl: opts.demoUrl ?? undefined,
    githubUrl: opts.githubUrl ?? undefined,
    destacado: opts.destacado,
    nivel: opts.nivel,
    ...(opts.categoriaId != null ? { categoriaId: opts.categoriaId } : {}),
  };

  if (newPortada) {
    data.imagenUrl = newPortada.url;
  } else if (typeof opts.imagenUrl === 'string' && opts.imagenUrl.trim()) {
    data.imagenUrl = opts.imagenUrl;
  }

  const updated = await prisma.proyecto.update({
    where: { id },
    data,
  });

  return updated;
}

/** Elimina un proyecto. (No borra en Cloudinary porque no guardas publicId en el modelo) */
export async function deleteProyecto(id: number) {
  await prisma.proyecto.delete({ where: { id } });
}
