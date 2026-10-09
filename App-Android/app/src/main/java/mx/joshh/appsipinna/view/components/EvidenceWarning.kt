/**
 * Componente visual que muestra la advertencia legal de privacidad sobre evidencia fotográfica.
 */
package mx.joshh.appsipinna.view.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.view.theme.RietiTheme

@Composable
fun EvidenceWarning(
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
            verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(RietiTheme.spacing.sm)
        ) {
            Text(
                text = "No fotografíes a niñas, niños o adolescentes",
                style = MaterialTheme.typography.titleSmall
            )
            Text(
                text = stringResource(R.string.advertencia_evidencia),
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun EvidenceWarningPreview() {
    RietiTheme {
        EvidenceWarning()
    }
}
