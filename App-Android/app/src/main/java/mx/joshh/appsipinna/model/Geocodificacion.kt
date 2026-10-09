/**
 * Funciones utilitarias para la geocodificación inversa (convertir coordenadas lat/lon en direcciones de texto).
 */
package mx.joshh.appsipinna.model

import android.content.Context
import android.location.Address
import android.location.Geocoder
import android.os.Build
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.Locale
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

/**
 * Obtiene la dirección postal legible correspondiente a una latitud y longitud dadas.
 */
suspend fun obtenerDireccion(context: Context, latitud: Double, longitud: Double): String? {
    return withContext(Dispatchers.IO) {
        try {
            val geocoder = Geocoder(context, Locale("es", "MX"))
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                suspendCoroutine { continuation ->
                    try {
                        geocoder.getFromLocation(latitud, longitud, 1) { addresses ->
                            continuation.resume(formatAddress(addresses))
                        }
                    } catch (e: Exception) {
                        continuation.resume(null)
                    }
                }
            } else {
                @Suppress("DEPRECATION")
                val addresses = geocoder.getFromLocation(latitud, longitud, 1)
                formatAddress(addresses)
            }
        } catch (e: Exception) {
            null
        }
    }
}

/** Formatea la lista de direcciones devueltas por el Geocoder en una cadena limpia. */
private fun formatAddress(addresses: List<Address>?): String? {
    if (addresses.isNullOrEmpty()) return null
    val address = addresses[0]
    val line = address.getAddressLine(0)
    if (!line.isNullOrBlank()) return line
    val thoroughfare = address.thoroughfare ?: ""
    val subThoroughfare = address.subThoroughfare ?: ""
    val locality = address.locality ?: ""
    val composed = listOf(thoroughfare, subThoroughfare, locality)
        .filter { it.isNotBlank() }
        .joinToString(", ")
    return composed.ifBlank { null }
}
