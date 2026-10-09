/**
 * Pantalla del Paso 1 para la selección de municipio, mapa interactivo con pin y captura de colonia y referencia.
 */
package mx.joshh.appsipinna.view.screens.report

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuAnchorType
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.model.TipoActividad
import mx.joshh.appsipinna.model.municipiosPrueba
import mx.joshh.appsipinna.view.components.MapaUbicacion
import mx.joshh.appsipinna.view.components.RietiButton
import mx.joshh.appsipinna.view.components.RietiSecondaryButton
import mx.joshh.appsipinna.view.components.RietiTextField
import mx.joshh.appsipinna.view.components.RietiTopAppBar
import mx.joshh.appsipinna.view.components.SelectionChips
import mx.joshh.appsipinna.view.components.StepIndicator
import mx.joshh.appsipinna.view.theme.RietiTheme
import org.osmdroid.util.GeoPoint

/** Pantalla de ubicación y municipio del reporte. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LocationStepScreen(
    centro: GeoPoint,
    direccion: String?,
    idMunicipio: Int,
    colonia: String,
    nombreLugar: String,
    tipoActividad: TipoActividad?,
    otroTipoActividad: String,
    isStepValid: Boolean,
    esperandoUbicacion: Boolean,
    errorUbicacion: Int?,
    onPinCambiado: (GeoPoint) -> Unit,
    onIdMunicipioChange: (Int) -> Unit,
    onColoniaChange: (String) -> Unit,
    onNombreLugarChange: (String) -> Unit,
    onTipoActividadChange: (TipoActividad) -> Unit,
    onOtroTipoActividadChange: (String) -> Unit,
    onUseMyLocationClick: () -> Unit,
    onNextClick: () -> Unit,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var municipioExpanded by remember { mutableStateOf(false) }
    val municipioSeleccionado = municipiosPrueba.find { it.idMunicipio == idMunicipio }?.let { "${it.nombreMunicipio} (${it.claveMunicipio})" } ?: ""

    Scaffold(
        topBar = {
            RietiTopAppBar(
                title = stringResource(R.string.titulo_reporte),
                onBackClick = onBackClick
            )
        },
        bottomBar = {
            RietiButton(
                text = stringResource(R.string.boton_continuar),
                onClick = onNextClick,
                enabled = isStepValid,
                modifier = Modifier
                    .padding(RietiTheme.spacing.lg)
                    .testTag("btn_continuar")
            )
        },
        containerColor = MaterialTheme.colorScheme.background,
        modifier = modifier
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = RietiTheme.spacing.screenHorizontal)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.xl)
        ) {
            StepIndicator(currentStep = 1)
            
            Text(
                text = stringResource(R.string.paso1_instrucciones),
                style = MaterialTheme.typography.bodyLarge
            )

            Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm)) {
                Text(
                    text = stringResource(R.string.label_municipio),
                    style = MaterialTheme.typography.titleSmall
                )
                ExposedDropdownMenuBox(
                    expanded = municipioExpanded,
                    onExpandedChange = { municipioExpanded = !municipioExpanded }
                ) {
                    OutlinedTextField(
                        value = municipioSeleccionado,
                        onValueChange = {},
                        readOnly = true,
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = municipioExpanded) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(ExposedDropdownMenuAnchorType.PrimaryNotEditable, true),
                        shape = MaterialTheme.shapes.small,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = MaterialTheme.colorScheme.primary,
                            unfocusedBorderColor = MaterialTheme.colorScheme.outline
                        )
                    )
                    ExposedDropdownMenu(
                        expanded = municipioExpanded,
                        onDismissRequest = { municipioExpanded = false }
                    ) {
                        municipiosPrueba.forEach { municipio ->
                            DropdownMenuItem(
                                text = { Text(text = "${municipio.nombreMunicipio} (${municipio.claveMunicipio})") },
                                onClick = {
                                    onIdMunicipioChange(municipio.idMunicipio)
                                    municipioExpanded = false
                                }
                            )
                        }
                    }
                }
            }

            Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.xs)) {
                MapaUbicacion(
                    centro = centro,
                    onCentroCambiado = onPinCambiado
                )
                Text(
                    text = "Mueve el mapa para colocar el pin en la ubicación exacta del hecho.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = direccion ?: stringResource(R.string.ubicacion_buscando),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.xs)) {
                RietiSecondaryButton(
                    text = stringResource(R.string.boton_usar_ubicacion),
                    onClick = onUseMyLocationClick,
                    enabled = !esperandoUbicacion
                ) {
                    if (esperandoUbicacion) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(18.dp),
                                strokeWidth = 2.dp,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = stringResource(R.string.boton_usar_ubicacion),
                                style = MaterialTheme.typography.labelLarge
                            )
                        }
                    } else {
                        Text(
                            text = stringResource(R.string.boton_usar_ubicacion),
                            style = MaterialTheme.typography.labelLarge
                        )
                    }
                }

                if (errorUbicacion != null) {
                    Text(
                        text = stringResource(errorUbicacion),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }

            RietiTextField(
                value = colonia,
                onValueChange = onColoniaChange,
                label = stringResource(R.string.label_colonia),
                placeholder = stringResource(R.string.placeholder_colonia),
                fieldTag = "campo_colonia"
            )

            RietiTextField(
                value = nombreLugar,
                onValueChange = onNombreLugarChange,
                label = stringResource(R.string.label_referencia_lugar),
                placeholder = stringResource(R.string.placeholder_referencia_lugar),
                fieldTag = "campo_referencia"
            )

            Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm)) {
                Text(
                    text = stringResource(R.string.label_tipo_actividad),
                    style = MaterialTheme.typography.titleSmall
                )
                SelectionChips(
                    options = TipoActividad.entries,
                    selectedOption = tipoActividad,
                    onOptionSelected = onTipoActividadChange,
                    labelProvider = { stringResource(it.labelRes) }
                )
            }

            if (tipoActividad == TipoActividad.OTRO) {
                RietiTextField(
                    value = otroTipoActividad,
                    onValueChange = onOtroTipoActividadChange,
                    label = stringResource(R.string.label_otro_tipo_actividad),
                    placeholder = stringResource(R.string.placeholder_otro_tipo_actividad),
                    fieldTag = "campo_otro_tipo_actividad"
                )
            }
        }
    }
}

@Preview
@Composable
private fun LocationStepScreenPreview() {
    RietiTheme {
        LocationStepScreen(
            centro = GeoPoint(19.5546, -99.2476),
            direccion = "Atizapán de Zaragoza, Estado de México",
            idMunicipio = 1,
            colonia = "Centro",
            nombreLugar = "",
            tipoActividad = TipoActividad.OTRO,
            otroTipoActividad = "Venta ambulante",
            isStepValid = true,
            esperandoUbicacion = false,
            errorUbicacion = null,
            onPinCambiado = {},
            onIdMunicipioChange = {},
            onColoniaChange = {},
            onNombreLugarChange = {},
            onTipoActividadChange = {},
            onOtroTipoActividadChange = {},
            onUseMyLocationClick = {},
            onNextClick = {},
            onBackClick = {}
        )
    }
}
