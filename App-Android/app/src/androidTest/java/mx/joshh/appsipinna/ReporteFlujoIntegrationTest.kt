package mx.joshh.appsipinna

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertIsEnabled
import androidx.compose.ui.test.assertIsNotEnabled
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.compose.ui.test.performTextInput
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.rule.GrantPermissionRule
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Pruebas de integración del flujo de reporte de la app RIETI / SIPINNA.
 *
 * Se usa createAndroidComposeRule en lugar de ActivityScenarioRule + Espresso
 * porque la interfaz está construida con Jetpack Compose: no existen Views con
 * ID contra los cuales pueda operar onView(withId(...)).
 *
 * Ambos casos verifican integración real entre componentes: la pantalla envía
 * los datos al ReportViewModel compartido por el grafo de navegación, el
 * ViewModel recalcula la validación, y el resultado vuelve a la interfaz.
 */
@RunWith(AndroidJUnit4::class)
class ReporteFlujoIntegrationTest {

    @get:Rule
    val permisosRule: GrantPermissionRule = GrantPermissionRule.grant(
        android.Manifest.permission.ACCESS_FINE_LOCATION,
        android.Manifest.permission.ACCESS_COARSE_LOCATION
    )

    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    /**
     * CASO 1 — Validación de formulario y navegación entre pantallas.
     *
     * Flujo probado: desde Inicio se entra al Paso 1 del reporte. El botón
     * "Continuar" debe permanecer deshabilitado mientras falten campos
     * obligatorios, y habilitarse solo cuando ubicación, colonia, referencia del lugar y
     * tipo de actividad estén completos. Al pulsarlo, la app debe navegar al
     * Paso 2.
     *
     * Componentes que interactúan: HomeScreen -> NavHost ->
     * LocationStepScreen -> ReportViewModel -> DetailsStepScreen.
     */
    @Test
    fun paso1_bloqueaAvanceHastaCompletarCampos_yNavegaAlPaso2() {
        // Entrar al flujo de reporte desde la pantalla de inicio
        composeRule.onNodeWithTag("btn_reportar").performClick()

        // Al llegar al Paso 1 no hay nada capturado: el avance debe estar bloqueado
        composeRule.onNodeWithTag("btn_continuar").assertIsNotEnabled()

        // Marcar la ubicación usando el botón de ubicación automática
        composeRule.onNodeWithText("Usar mi ubicación").performClick()

        // Con la ubicación marcada aún faltan campos: sigue bloqueado
        composeRule.onNodeWithTag("btn_continuar").assertIsNotEnabled()

        // Capturar colonia y referencia del lugar
        composeRule.onNodeWithTag("campo_colonia").performTextInput("Centro")
        composeRule.onNodeWithTag("campo_referencia")
            .performTextInput("Mercado Lázaro Cárdenas")

        // Seleccionar el tipo de actividad laboral
        composeRule.onNodeWithText("Comercio informal").performScrollTo().performClick()

        // Con los datos completos el avance debe habilitarse
        composeRule.onNodeWithTag("btn_continuar").assertIsEnabled()

        // Avanzar y comprobar que la navegación llevó al Paso 2
        composeRule.onNodeWithTag("btn_continuar").performClick()
        composeRule.onNodeWithTag("campo_descripcion").assertIsDisplayed()
    }

    /**
     * CASO 2 — Traspaso de información entre pantallas.
     *
     * Flujo probado: los datos capturados en los Pasos 1 y 2 se conservan al
     * navegar y se muestran correctamente en la pantalla de Revisión. Esto
     * verifica que el ReportViewModel compartido por el grafo de navegación
     * mantiene el estado entre destinos distintos.
     *
     * Componentes que interactúan: LocationStepScreen y DetailsStepScreen
     * escriben en ReportViewModel; ReviewScreen lee de él.
     */
    @Test
    fun datosCapturados_seConservanYSeMuestranEnLaRevision() {
        val referencia = "Avenida Hidalgo esquina Potrero"
        val descripcion = "Dos adolescentes cargando bultos sin equipo de proteccion"
        val frecuenciaTexto = "Cada fin de semana por la tarde"

        composeRule.onNodeWithTag("btn_reportar").performClick()

        // --- Paso 1: ubicación, colonia y tipo de actividad ---
        composeRule.onNodeWithText("Usar mi ubicación").performClick()
        composeRule.onNodeWithTag("campo_colonia").performTextInput("Centro")
        composeRule.onNodeWithTag("campo_referencia").performTextInput(referencia)
        composeRule.onNodeWithText("Construcción").performScrollTo().performClick()
        composeRule.onNodeWithTag("btn_continuar").performClick()

        // --- Paso 2: detalles del caso ---
        composeRule.onNodeWithTag("campo_descripcion").performTextInput(descripcion)
        composeRule.onNodeWithTag("campo_edad").performTextInput("12")
        composeRule.onNodeWithText("Matutino").performScrollTo().performClick()
        composeRule.onNodeWithTag("campo_frecuencia").performTextInput(frecuenciaTexto)
        composeRule.onNodeWithText("Medio").performScrollTo().performClick()
        composeRule.onNodeWithText("No").performScrollTo().performClick()
        composeRule.onNodeWithTag("btn_continuar").performClick()

        // --- Paso 3: avanzar a la revisión ---
        composeRule.onNodeWithText("Reporte anónimo").performClick()
        composeRule.onNodeWithTag("btn_continuar").performClick()

        // --- Revisión: los datos de los pasos anteriores deben seguir presentes ---
        composeRule.onNodeWithText(referencia).performScrollTo().assertIsDisplayed()
        composeRule.onNodeWithText(descripcion).performScrollTo().assertIsDisplayed()
        composeRule.onNodeWithText("Construcción").performScrollTo().assertIsDisplayed()
        composeRule.onNodeWithText(frecuenciaTexto).performScrollTo().assertIsDisplayed()
        composeRule.onNodeWithText("Medio").performScrollTo().assertIsDisplayed()
    }
}
