/**
 * Administrador de geolocalización utilizando FusedLocationProviderClient y permisos del sistema.
 */
package mx.joshh.appsipinna.model

import android.Manifest
import android.content.pm.PackageManager
import android.os.Looper
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import mx.joshh.appsipinna.viewmodel.UbicacionVM

class Ubicacion(
    private val activity: ComponentActivity,
    private val viewModel: UbicacionVM
) {
    private val fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(activity)

    private val locationRequest = LocationRequest.Builder(
        Priority.PRIORITY_HIGH_ACCURACY,
        5000L
    ).build()

    private val locationCallback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            result.lastLocation?.let { location ->
                viewModel.actualizarUbicacion(location)
            }
        }
    }

    private val locationPermissionLauncher = activity.registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        viewModel.actualizarPermiso(granted)
        if (granted) {
            iniciarActualizaciones()
        }
    }

    /** Verifica si el usuario ha concedido permisos de ubicación. */
    private fun tienePermisoUbicacion(): Boolean {
        return ContextCompat.checkSelfPermission(
            activity,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED ||
                ContextCompat.checkSelfPermission(
                    activity,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                ) == PackageManager.PERMISSION_GRANTED
    }

    /** Comprueba permisos e inicia la solicitud continua de coordenadas GPS. */
    fun iniciarActualizaciones() {
        viewModel.actualizarPermiso(tienePermisoUbicacion())
        if (!tienePermisoUbicacion()) {
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
            return
        }

        try {
            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                location?.let {
                    viewModel.actualizarUbicacion(it)
                }
            }

            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
        } catch (_: SecurityException) {
        }
    }

    /** Detiene el consumo de actualizaciones de ubicación. */
    fun detenerActualizaciones() {
        try {
            fusedLocationClient.removeLocationUpdates(locationCallback)
        } catch (_: Exception) {
        }
    }
}
