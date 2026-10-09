/**
 * Vista previa de catálogo visual para revisar los componentes del sistema de diseño.
 */
package mx.joshh.appsipinna.view.theme

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

/** Catálogo visual de diseño. */
@Preview(showBackground = true, heightDp = 1400)
@Composable
private fun DesignSystemPreview() {
    RietiTheme {
        val s = RietiTheme.spacing
        Column(
            modifier = Modifier
                .background(MaterialTheme.colorScheme.background)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = s.screenHorizontal, vertical = s.xl),
            verticalArrangement = Arrangement.spacedBy(s.xl)
        ) {
            Text("Sistema de diseño RIETI", style = MaterialTheme.typography.headlineMedium)

            Column(verticalArrangement = Arrangement.spacedBy(s.sm)) {
                Text("Reportar trabajo infantil", style = MaterialTheme.typography.headlineLarge)
                Text("Paso 2 de 3 · Detalles del caso", style = MaterialTheme.typography.titleMedium)
                Text(
                    "Describe lo que observaste: qué actividad realizaban las niñas, niños o adolescentes, " +
                            "en qué condiciones y si había una persona adulta a cargo.",
                    style = MaterialTheme.typography.bodyLarge
                )
                Text(
                    "Tu reporte es anónimo. Solo pedimos tu correo para enviarte el folio.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    "ATZ-ZQ3D-NY8E",
                    style = FolioTextStyle,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

            Column(verticalArrangement = Arrangement.spacedBy(s.md)) {
                Button(
                    onClick = {},
                    shape = PillShape,
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = s.minTouchTarget)
                ) { Text("Enviar reporte") }

                OutlinedButton(
                    onClick = {},
                    shape = PillShape,
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = s.minTouchTarget)
                ) { Text("Consultar mi folio") }

                TextButton(onClick = {}) { Text("Regresar al paso anterior") }
            }

            // Aviso de privacidad de niñas, niños o adolescentes (RF-13)
            Surface(
                color = MaterialTheme.colorScheme.tertiaryContainer,
                contentColor = MaterialTheme.colorScheme.onTertiaryContainer,
                shape = MaterialTheme.shapes.medium
            ) {
                Column(
                    Modifier.padding(s.lg),
                    verticalArrangement = Arrangement.spacedBy(s.sm)
                ) {
                    Text("No fotografíes a niñas, niños o adolescentes", style = MaterialTheme.typography.titleSmall)
                    Text(
                        "Sube solo imágenes del lugar: fachadas, calles o letreros. " +
                                "Las fotos de niñas, niños y adolescentes están prohibidas.",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }

            // Chips de estatus (RF-27)
            val st = RietiTheme.statusColors
            Row(horizontalArrangement = Arrangement.spacedBy(s.sm)) {
                StatusChipPreview("Recibido", st.recibidoContainer, st.onRecibidoContainer)
                StatusChipPreview("En revisión", st.enRevisionContainer, st.onEnRevisionContainer)
                StatusChipPreview("Atendido", st.atendidoContainer, st.onAtendidoContainer)
            }

            Column(verticalArrangement = Arrangement.spacedBy(s.sm)) {
                Swatch("primary", MaterialTheme.colorScheme.primary, Color.White)
                Swatch("secondary", MaterialTheme.colorScheme.secondary, Color.White)
                Swatch("tertiary", MaterialTheme.colorScheme.tertiary, Color.White)
                Swatch(
                    "surface",
                    MaterialTheme.colorScheme.surface,
                    MaterialTheme.colorScheme.onSurface
                )
                Swatch(
                    "background",
                    MaterialTheme.colorScheme.background,
                    MaterialTheme.colorScheme.onBackground
                )
            }
        }
    }
}

@Composable
private fun StatusChipPreview(label: String, container: Color, onContainer: Color) {
    Surface(
        color = container,
        contentColor = onContainer,
        shape = MaterialTheme.shapes.extraSmall
    ) {
        Text(
            label,
            style = MaterialTheme.typography.labelMedium,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        )
    }
}

@Composable
private fun Swatch(name: String, color: Color, onColor: Color) {
    Box(
        Modifier
            .fillMaxWidth()
            .height(52.dp)
            .background(color, RoundedCornerShape(12.dp))
            .padding(horizontal = 16.dp),
        contentAlignment = Alignment.CenterStart
    ) {
        Text(name, color = onColor, style = MaterialTheme.typography.titleSmall)
    }
}
