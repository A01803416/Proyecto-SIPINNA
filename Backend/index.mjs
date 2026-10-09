/**
 * @file Punto de entrada para AWS Lambda. Envuelve la aplicación de Express
 * de app.mjs para que Lambda pueda atender las peticiones HTTP.
 * @module index
 */

import serverlessExpress from '@codegenie/serverless-express';
import app from './app.mjs';

const serverlessHandler = serverlessExpress({ app });


/**
 * Función que ejecuta Lambda en cada petición. Le pasa el evento a la
 * aplicación de Express y regresa la respuesta que esta genere.
 *
 * @param {Object} event Evento de Lambda con los datos de la petición HTTP.
 * @param {Object} context Contexto de ejecución de Lambda.
 * @returns {Promise<Object>} La respuesta HTTP en el formato que espera Lambda.
 */
export const handler = async (event, context) => {
  return serverlessHandler(event, context);
};
