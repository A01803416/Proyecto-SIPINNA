/**
 * Funciones utilitarias para la geocodificación inversa (convertir coordenadas lat/lon en direcciones de texto).
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
package mx.joshh.appsipinna.model

import android.content.Context
import android.location.Geocoder
import android.os.Build
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.Locale
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

/**
 * Detalle extraído de la geocodificación inversa incluyendo dirección, colonia y municipio.
 * @property direccion Dirección postal completa legible.
 * @property colonia Nombre de la colonia detectada.
 * @property idMunicipio Identificador numérico del municipio detectado.
 */
data class DetalleUbicacion(
    val direccion: String?,
    val colonia: String?,
    val idMunicipio: Int?
)

/**
 * Obtiene la dirección postal legible correspondiente a una latitud y longitud dadas.
 * @param context Contexto de la aplicación.
 * @param latitud Coordenada de latitud.
 * @param longitud Coordenada de longitud.
 * @return String con la dirección postal o `null` si no se pudo determinar.
 */
suspend fun obtenerDireccion(context: Context, latitud: Double, longitud: Double): String? {
    return obtenerDetalleUbicacion(context, latitud, longitud).direccion
}

/**
 * Obtiene el detalle completo de ubicación (dirección, colonia y municipio detectado).
 * @param context Contexto de la aplicación.
 * @param latitud Coordenada de latitud.
 * @param longitud Coordenada de longitud.
 * @return Objeto [DetalleUbicacion] con los datos geocodificados.
 */
suspend fun obtenerDetalleUbicacion(context: Context, latitud: Double, longitud: Double): DetalleUbicacion {
    return withContext(Dispatchers.IO) {
        try {
            val geocoder = Geocoder(context, Locale("es", "MX"))
            val addresses = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                suspendCoroutine { continuation ->
                    try {
                        geocoder.getFromLocation(latitud, longitud, 1) { continuation.resume(it) }
                    } catch (e: Exception) {
                        continuation.resume(emptyList())
                    }
                }
            } else {
                @Suppress("DEPRECATION")
                geocoder.getFromLocation(latitud, longitud, 1) ?: emptyList()
            }

            if (addresses.isEmpty()) {
                DetalleUbicacion(null, null, null)
            } else {
                val address = addresses[0]
                val direccion = address.getAddressLine(0) ?: ""
                val colonia = address.subLocality ?: address.locality ?: address.subAdminArea ?: ""
                val municipioStr = address.subAdminArea ?: address.locality ?: address.adminArea ?: ""
                
                val matchedMunicipio = municipiosPrueba.find { 
                    municipioStr.contains(it.nombreMunicipio, ignoreCase = true) ||
                    it.nombreMunicipio.contains(municipioStr, ignoreCase = true)
                }?.idMunicipio

                DetalleUbicacion(direccion, colonia.ifBlank { null }, matchedMunicipio)
            }
        } catch (e: Exception) {
            DetalleUbicacion(null, null, null)
        }
    }
}
