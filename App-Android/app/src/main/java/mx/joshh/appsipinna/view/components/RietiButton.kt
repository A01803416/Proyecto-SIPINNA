/**
 * Botones personalizados y reutilizables basados en el sistema de diseño de la aplicación.
 */
package mx.joshh.appsipinna.view.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import mx.joshh.appsipinna.view.theme.PillShape
import mx.joshh.appsipinna.view.theme.RietiTheme

/** Botón principal de acción con fondo sólido y esquinas redondeadas. */
@Composable
fun RietiButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    Button(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = RietiTheme.spacing.minTouchTarget),
        enabled = enabled,
        shape = PillShape,
        colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.primary,
            contentColor = MaterialTheme.colorScheme.onPrimary
        )
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelLarge
        )
    }
}

/** Botón secundario con borde delimitado para acciones alternativas. */
@Composable
fun RietiSecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    content: @Composable (() -> Unit)? = null
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = RietiTheme.spacing.minTouchTarget),
        enabled = enabled,
        shape = PillShape,
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = MaterialTheme.colorScheme.primary
        )
    ) {
        if (content != null) {
            content()
        } else {
            Text(
                text = text,
                style = MaterialTheme.typography.labelLarge
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun RietiButtonPreview() {
    RietiTheme {
        RietiButton(text = "Reportar un caso", onClick = {})
    }
}

@Preview(showBackground = true)
@Composable
private fun RietiSecondaryButtonPreview() {
    RietiTheme {
        RietiSecondaryButton(text = "Consultar mi folio", onClick = {})
    }
}
