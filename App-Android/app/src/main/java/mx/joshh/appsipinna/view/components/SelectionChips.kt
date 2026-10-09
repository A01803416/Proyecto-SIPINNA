/**
 * Componente de chips de selección para catálogos cerrados organizado en flujo adaptable.
 */
package mx.joshh.appsipinna.view.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import mx.joshh.appsipinna.view.theme.RietiTheme

/** Grupo de chips de selección para opciones discretas. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun <T> SelectionChips(
    options: List<T>,
    selectedOption: T?,
    onOptionSelected: (T) -> Unit,
    labelProvider: @Composable (T) -> String,
    modifier: Modifier = Modifier
) {
    FlowRow(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm),
        verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.xs)
    ) {
        options.forEach { option ->
            val isSelected = option == selectedOption
            FilterChip(
                selected = isSelected,
                onClick = { onOptionSelected(option) },
                label = {
                    Text(
                        text = labelProvider(option),
                        style = MaterialTheme.typography.labelLarge
                    )
                },
                shape = MaterialTheme.shapes.extraSmall,
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.primary,
                    selectedLabelColor = MaterialTheme.colorScheme.onPrimary,
                    containerColor = MaterialTheme.colorScheme.surfaceContainerHigh,
                    labelColor = MaterialTheme.colorScheme.onSurfaceVariant
                ),
                border = null
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun SelectionChipsPreview() {
    RietiTheme {
        SelectionChips(
            options = listOf("Opción 1", "Opción 2", "Opción 3"),
            selectedOption = "Opción 2",
            onOptionSelected = {},
            labelProvider = { it },
            modifier = Modifier.padding(RietiTheme.spacing.lg)
        )
    }
}
