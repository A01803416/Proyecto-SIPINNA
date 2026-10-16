/**
 * Pruebas de integración del flujo de reporte de la app RIETI / SIPINNA.
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
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

    @Test
    fun paso1_bloqueaAvanceHastaCompletarCampos_yNavegaAlPaso2() {
        composeRule.onNodeWithTag("btn_reportar").performClick()
        composeRule.onNodeWithTag("btn_continuar").assertIsNotEnabled()
        composeRule.onNodeWithText("Usar mi ubicación").performClick()
        composeRule.onNodeWithTag("btn_continuar").assertIsNotEnabled()

        composeRule.onNodeWithTag("campo_colonia").performTextInput("Centro")
        composeRule.onNodeWithTag("campo_referencia")
            .performTextInput("Mercado Lázaro Cárdenas")

        composeRule.onNodeWithTag("campo_tipo_actividad").performTextInput("Comercio informal")

        composeRule.onNodeWithTag("btn_continuar").assertIsEnabled()
        composeRule.onNodeWithTag("btn_continuar").performClick()
        composeRule.onNodeWithTag("campo_descripcion").assertIsDisplayed()
    }

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
        composeRule.onNodeWithTag("campo_tipo_actividad").performTextInput("Construcción")
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

        // --- Revisión ---
        composeRule.onNodeWithText(referencia).performScrollTo().assertIsDisplayed()
        composeRule.onNodeWithText(descripcion).performScrollTo().assertIsDisplayed()
        composeRule.onNodeWithText("Construcción").performScrollTo().assertIsDisplayed()
        composeRule.onNodeWithText(frecuenciaTexto).performScrollTo().assertIsDisplayed()
        composeRule.onNodeWithText("Medio").performScrollTo().assertIsDisplayed()
    }
}
