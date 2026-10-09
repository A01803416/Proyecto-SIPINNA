/**
 * ViewModel que expone la ubicación actual del dispositivo y el estatus de permisos de GPS.
 */
package mx.joshh.appsipinna.viewmodel

import android.location.Location
import androidx.activity.ComponentActivity
import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import mx.joshh.appsipinna.model.Ubicacion

class UbicacionVM : ViewModel() {
    private val _ubicacion = MutableStateFlow<Location?>(null)
    private lateinit var administradorUbicacion: Ubicacion
    val ubicacion: StateFlow<Location?> = _ubicacion

    private val _tienePermiso = MutableStateFlow(false)
    val tienePermiso: StateFlow<Boolean> = _tienePermiso

    /** Actualiza el estado de concesión de permisos de ubicación. */
    fun actualizarPermiso(concedido: Boolean) { 
        _tienePermiso.value = concedido 
    }

    /** Inicializa el administrador de ubicación nativo ligado a la Actividad. */
    fun crearAdministradorUbicacion(activity: ComponentActivity) {
        administradorUbicacion = Ubicacion(activity, this)
    }

    /** Inicia la escucha de actualizaciones de GPS. */
    fun iniciarActualizaciones() {
        if (::administradorUbicacion.isInitialized) {
            administradorUbicacion.iniciarActualizaciones()
        }
    }

    /** Detiene la escucha de actualizaciones de GPS para ahorrar batería. */
    fun detenerActualizaciones() {
        if (::administradorUbicacion.isInitialized) {
            administradorUbicacion.detenerActualizaciones()
        }
    }

    /** Recibe y publica una nueva ubicación detectada por el sensor. */
    fun actualizarUbicacion(nuevaUbicacion: Location) {
        _ubicacion.value = nuevaUbicacion
    }
}
