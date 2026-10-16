/**
 * Repositorio local simulado para el almacenamiento y consulta de reportes ciudadanos.
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
package mx.joshh.appsipinna.model

import kotlinx.coroutines.delay
import java.time.LocalDate

/**
 * Repositorio local implementado como `object` (patrón Singleton).
 * Nota de diseño: Se definió como `object` para actuar como un almacén de datos centralizado en memoria compartido de forma global por la aplicación durante la sesión actual, evitando la necesidad de inyección de dependencias compleja para los datos simulados de prueba.
 */
object FakeReportRepository {
    private val reportes = mutableListOf<Reporte>()
    private var counter = 4

    init {
        // Precarga de reportes de ejemplo con formato oficial RIETI-ATZ-000001
        reportes.add(
            Reporte(
                folio = "RIETI-ATZ-000001",
                idMunicipio = 1,
                colonia = "Centro",
                tipoActividad = TipoActividad.COMERCIO_INFORMAL,
                latitud = 19.5546,
                longitud = -99.2476,
                nombreLugar = "Mercado Central Atizapán",
                descripcion = "Niño de aproximadamente 8 años vendiendo chicles en la entrada.",
                numeroMenores = 1,
                edadAproximada = "8",
                horario = Horario.VESPERTINO,
                frecuencia = "Los veo cada sábado",
                nivelRiesgo = NivelRiesgo.MEDIO,
                peligroInmediato = false,
                tipoEnvio = TipoEnvio.CON_SEGUIMIENTO,
                evidenciaUri = null,
                correo = "ciudadano@correo.com",
                estatus = EstatusReporte.EN_SEGUIMIENTO,
                fechaRegistro = LocalDate.now().minusDays(1),
                ultimaNotaPublica = "Se realizó una visita de inspección al lugar."
            )
        )
        reportes.add(
            Reporte(
                folio = "RIETI-NAU-000002",
                idMunicipio = 2,
                colonia = "Lomas Verdes",
                tipoActividad = TipoActividad.CONSTRUCCION,
                latitud = 19.5600,
                longitud = -99.2500,
                nombreLugar = "Obra Residencial",
                descripcion = "Varios menores ayudando en la mezcla de cemento sin equipo.",
                numeroMenores = 3,
                edadAproximada = "10-14",
                horario = Horario.MATUTINO,
                frecuencia = "Diario por las mañanas",
                nivelRiesgo = NivelRiesgo.ALTO,
                peligroInmediato = true,
                tipoEnvio = TipoEnvio.CON_SEGUIMIENTO,
                evidenciaUri = null,
                correo = "test2@correo.com",
                estatus = EstatusReporte.EN_REVISION,
                fechaRegistro = LocalDate.now().minusDays(3),
                ultimaNotaPublica = "Caso turnado a la procuraduría de protección."
            )
        )
    }

    /**
     * Almacena un nuevo reporte y genera un folio oficial únicamente si es con seguimiento.
     * @param reporte El objeto [Reporte] a registrar.
     * @return El número de folio generado si es con seguimiento, o `null` si es anónimo.
     */
    suspend fun crearReporte(reporte: Reporte): String? {
        delay(800)
        val nuevoFolio = if (reporte.tipoEnvio == TipoEnvio.ANONIMO) null else generarFolio(reporte.idMunicipio)
        val reporteConFolio = reporte.copy(
            folio = nuevoFolio,
            fechaRegistro = LocalDate.now(),
            estatus = EstatusReporte.REGISTRADO
        )
        reportes.add(reporteConFolio)
        return nuevoFolio
    }

    /**
     * Consulta un reporte buscando coincidencia exacta de folio y correo electrónico.
     * @param folio Código de folio de seguimiento.
     * @param correo Correo electrónico registrado.
     * @return El [Reporte] encontrado, o `null` si no coincide.
     */
    suspend fun consultarPorFolioYCorreo(folio: String, correo: String): Reporte? {
        delay(800)
        return reportes.find { 
            it.folio?.equals(folio.trim(), ignoreCase = true) == true && 
            it.correo?.equals(correo.trim(), ignoreCase = true) == true 
        }
    }

    /**
     * Genera un folio único basado en el municipio y un contador incremental.
     * @param idMunicipio Identificador numérico del municipio.
     * @return El string del folio formateado (ej. RIETI-ATZ-000003).
     */
    private fun generarFolio(idMunicipio: Int): String {
        val municipio = municipiosPrueba.find { it.idMunicipio == idMunicipio }?.claveMunicipio ?: "ATZ"
        val numero = String.format("%06d", counter++)
        return "RIETI-$municipio-$numero"
    }
}
