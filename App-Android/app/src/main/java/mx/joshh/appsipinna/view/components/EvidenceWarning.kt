/**
 * Componente visual unificado que muestra la advertencia legal de privacidad sobre evidencia fotográfica y la casilla de aceptación.
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
package mx.joshh.appsipinna.view.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.view.theme.RietiTheme

/**
 * Componente de tarjeta de advertencia sobre la privacidad de menores en evidencias fotográficas.
 * @param advertenciaEntendida Estado actual del checkbox de confirmación.
 * @param onAdvertenciaEntendidaChange Se invoca al marcar o desmarcar la casilla de aceptación.
 * @param modifier Modificador de diseño opcional.
 */
@Composable
fun EvidenceWarning(
    advertenciaEntendida: Boolean,
    onAdvertenciaEntendidaChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        color = MaterialTheme.colorScheme.tertiaryContainer,
        contentColor = MaterialTheme.colorScheme.onTertiaryContainer,
        shape = MaterialTheme.shapes.medium,
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(RietiTheme.spacing.lg),
            verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.md)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm)
            ) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(24.dp)
                )
                Text(
                    text = "No fotografíes a niñas, niños o adolescentes",
                    style = MaterialTheme.typography.titleSmall
                )
            }
            Text(
                text = stringResource(R.string.advertencia_evidencia),
                style = MaterialTheme.typography.bodyMedium
            )
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm)
            ) {
                Checkbox(
                    checked = advertenciaEntendida,
                    onCheckedChange = onAdvertenciaEntendidaChange,
                    colors = CheckboxDefaults.colors(
                        checkedColor = MaterialTheme.colorScheme.primary
                    )
                )
                Text(
                    text = stringResource(R.string.entendido_checkbox),
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun EvidenceWarningPreview() {
    RietiTheme {
        EvidenceWarning(
            advertenciaEntendida = false,
            onAdvertenciaEntendidaChange = {}
        )
    }
}
