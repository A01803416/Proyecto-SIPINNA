import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// en lambda la region y los permisos los toma solo del entorno
const s3 = new S3Client({});


// la app manda la foto en base64 y aqui se vuelve imagen otra vez
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
