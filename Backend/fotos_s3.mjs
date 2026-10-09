/**
 * @file Subida de las fotos de los reportes al bucket de S3.
 * @module fotos_s3
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// en lambda la region y los permisos los toma solo del entorno
const s3 = new S3Client({});


/**
 * Convierte la foto de base64 a imagen, la sube al bucket de la variable de
 * entorno BUCKET_FOTOS dentro de la carpeta reportes/ con un nombre aleatorio
 * terminado en .jpg, y regresa su liga pública. La región de la liga se toma
 * de la variable AWS_REGION, que Lambda define sola.
 * La foto debe venir solo como base64, sin el prefijo data:image/jpeg;base64,
 * porque si no la imagen se guarda dañada.
 *
 * @param {string} foto La foto codificada en base64.
 * @returns {Promise<string>} La liga pública completa de la foto, por ejemplo
 * https://mi-bucket.s3.us-east-1.amazonaws.com/reportes/3f2a9c1e-....jpg
 * @throws {Error} Si S3 rechaza la subida, por ejemplo porque el bucket no
 * existe o porque no hay permiso de s3:PutObject.
 */
export async function guardarFoto(foto) {
  //convierte el base64 de vuelta a imagen
  const imagen = Buffer.from(foto, 'base64');
  //le crea un nombre aleatorio
  const nombre = `reportes/${crypto.randomUUID()}.jpg`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.BUCKET_FOTOS,
    Key: nombre,
    Body: imagen,
    ContentType: 'image/jpeg'
  }));

  return `https://${process.env.BUCKET_FOTOS}.s3.${process.env.AWS_REGION}.amazonaws.com/${nombre}`;
}
