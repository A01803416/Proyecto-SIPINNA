/**
 * Modelos de datos y catálogos oficiales para los reportes de trabajo infantil.
 */
package mx.joshh.appsipinna.model

import androidx.annotation.StringRes
import mx.joshh.appsipinna.R
import java.time.LocalDate

/** Representación de un reporte ciudadano de trabajo infantil. */
data class Reporte(
    val folio: String? = null,
    val idMunicipio: Int = 1,
    val colonia: String,
    val tipoActividad: TipoActividad,
    val otroTipoActividad: String? = null,
    val latitud: Double,
    val longitud: Double,
    val nombreLugar: String,
    val descripcion: String,
    val numeroMenores: Int,
    val edadAproximada: String,
    val horario: Horario,
    val frecuencia: String,
    val nivelRiesgo: NivelRiesgo,
    val peligroInmediato: Boolean,
    val tipoEnvio: TipoEnvio,
    val evidenciaUri: String?,
    val correo: String?,
    val estatus: EstatusReporte = EstatusReporte.REGISTRADO,
    val fechaRegistro: LocalDate = LocalDate.now(),
    val ultimaNotaPublica: String? = null
)

/** Representación de un municipio del Estado de México con su clave oficial. */
data class Municipio(
    val idMunicipio: Int,
    val nombreMunicipio: String,
    val claveMunicipio: String
)

/** Lista oficial de los 15 municipios predefinidos para la app de RIETI. */
val municipiosPrueba = listOf(
    Municipio(1, "Atizapán de Zaragoza", "ATZ"),
    Municipio(2, "Naucalpan de Juárez", "NAU"),
    Municipio(3, "Tlalnepantla de Baz", "TLA"),
    Municipio(4, "Cuautitlán Izcalli", "CUI"),
    Municipio(5, "Villa del Carbón", "VCA"),
    Municipio(6, "Nicolás Romero", "NIR"),
    Municipio(7, "Isidro Fabela", "ISF"),
    Municipio(8, "Huixquilucan", "HUI"),
    Municipio(9, "Tepotzotlán", "TEP"),
    Municipio(10, "Teoloyucan", "TEO"),
    Municipio(11, "Cuautitlán", "CUA"),
    Municipio(12, "Jilotzingo", "JIL"),
    Municipio(13, "Ecatepec", "ECA"),
    Municipio(14, "Tultitlán", "TUL"),
    Municipio(15, "Melchor Ocampo", "MEL")
)

/** Catálogo de tipos de trabajo infantil observados. */
enum class TipoActividad(@StringRes val labelRes: Int) {
    AGRICULTURA(R.string.tipo_agricultura),
    CONSTRUCCION(R.string.tipo_construccion),
    COMERCIO_INFORMAL(R.string.tipo_comercio_informal),
    TRABAJO_DOMESTICO(R.string.tipo_trabajo_domestico),
    MANUFACTURA(R.string.tipo_manufactura),
    OTRO(R.string.tipo_otro)
}

/** Catálogo cerrado de horarios en que ocurre la situación. */
enum class Horario(@StringRes val labelRes: Int) {
    MATUTINO(R.string.horario_matutino),
    VESPERTINO(R.string.horario_vespertino),
    NOCTURNO(R.string.horario_nocturno),
    VARIABLE(R.string.horario_variable)
}

/** Niveles de riesgo oficiales del reporte. */
enum class NivelRiesgo(@StringRes val labelRes: Int) {
    BAJO(R.string.riesgo_bajo),
    MEDIO(R.string.riesgo_medio),
    ALTO(R.string.riesgo_alto)
}

/** Tipo de envío elegido por el ciudadano. */
enum class TipoEnvio(@StringRes val labelRes: Int) {
    CON_SEGUIMIENTO(R.string.envio_seguimiento),
    ANONIMO(R.string.envio_anonimo)
}

/** Los 8 estatus oficiales del reporte en el sistema. */
enum class EstatusReporte(@StringRes val labelRes: Int) {
    REGISTRADO(R.string.estatus_registrado),
    EN_REVISION(R.string.estatus_en_revision),
    EN_SEGUIMIENTO(R.string.estatus_en_seguimiento),
    CANALIZADO(R.string.estatus_canalizado),
    CONCLUIDO(R.string.estatus_concluido),
    ARCHIVADO(R.string.estatus_archivado),
    CANCELADO(R.string.estatus_cancelado),
    REINCIDENTE(R.string.estatus_reincidente)
}
