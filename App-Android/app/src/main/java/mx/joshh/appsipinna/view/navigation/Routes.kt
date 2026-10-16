/**
 * Definición de constantes para las rutas de navegación de la aplicación.
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
package mx.joshh.appsipinna.view.navigation

/**
 * Objeto contenedor de las rutas de navegación de la aplicación.
 */
object Routes {
    /** Ruta de la pantalla principal (Home). */
    const val HOME = "home"
    /** Ruta de la pantalla informativa institucional. */
    const val INFO = "info"
    
    /** Ruta raíz del grafo anidado de reporte de casos. */
    const val REPORT_GRAPH = "report_graph"
    /** Ruta del Paso 1 del reporte (Ubicación). */
    const val REPORT_STEP_1 = "report_step_1"
    /** Ruta del Paso 2 del reporte (Detalles). */
    const val REPORT_STEP_2 = "report_step_2"
    /** Ruta del Paso 3 del reporte (Evidencia y Envío). */
    const val REPORT_STEP_3 = "report_step_3"
    /** Ruta de la pantalla de revisión general del reporte. */
    const val REPORT_REVIEW = "report_review"
    /** Ruta de la pantalla de confirmación y generación de folio. */
    const val REPORT_CONFIRMATION = "report_confirmation"
    
    /** Ruta de la pantalla de consulta de estatus por folio y correo. */
    const val LOOKUP = "lookup"
}
