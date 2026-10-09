/**
 * Control numérico de incremento y decremento para cantidades (número de involucrados).
 */
package mx.joshh.appsipinna.view.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.view.theme.RietiTheme

/** Control interactivo con botones más y menos para ajustar un valor entero. */
@Composable
fun Stepper(
    value: Int,
    onValueChange: (Int) -> Unit,
    modifier: Modifier = Modifier,
    minValue: Int = 1,
    maxValue: Int = 99
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(RietiTheme.spacing.md)
    ) {
        IconButton(
            onClick = { if (value > minValue) onValueChange(value - 1) },
            modifier = Modifier
                .size(RietiTheme.spacing.minTouchTarget)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.secondaryContainer),
            enabled = value > minValue
        ) {
            Icon(
                imageVector = Icons.Default.Remove,
                contentDescription = stringResource(R.string.boton_disminuir),
                tint = MaterialTheme.colorScheme.onSecondaryContainer
            )
        }

        Text(
            text = value.toString(),
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.padding(horizontal = RietiTheme.spacing.sm)
        )

        IconButton(
            onClick = { if (value < maxValue) onValueChange(value + 1) },
            modifier = Modifier
                .size(RietiTheme.spacing.minTouchTarget)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.secondaryContainer),
            enabled = value < maxValue
        ) {
            Icon(
                imageVector = Icons.Default.Add,
                contentDescription = stringResource(R.string.boton_aumentar),
                tint = MaterialTheme.colorScheme.onSecondaryContainer
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun StepperPreview() {
    RietiTheme {
        Stepper(value = 1, onValueChange = {})
    }
}
