/**
 * Campo de texto personalizado con soporte para etiquetas, contadores de caracteres y testTags.
 */
package mx.joshh.appsipinna.view.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.view.theme.RietiTheme

/** Campo de texto estilizado para formularios de captura. */
@Composable
fun RietiTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    placeholder: String? = null,
    errorText: String? = null,
    isError: Boolean = errorText != null,
    singleLine: Boolean = true,
    minLines: Int = 1,
    minCharacters: Int = 0,
    keyboardType: KeyboardType = KeyboardType.Text,
    fieldTag: String? = null
) {
    val showCounter = minCharacters > 0
    val isLengthInvalid = value.length < minCharacters
    
    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = label,
            style = MaterialTheme.typography.titleSmall,
            modifier = Modifier.padding(bottom = RietiTheme.spacing.xs)
        )
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier
                .fillMaxWidth()
                .then(if (fieldTag != null) Modifier.testTag(fieldTag) else Modifier),
            placeholder = placeholder?.let { { Text(text = it) } },
            isError = isError || (showCounter && value.isNotEmpty() && isLengthInvalid),
            singleLine = singleLine,
            minLines = minLines,
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
            shape = MaterialTheme.shapes.small,
            supportingText = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    if (errorText != null) {
                        Text(
                            text = errorText,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.error,
                            modifier = Modifier.weight(1f)
                        )
                    }
                    if (showCounter) {
                        Text(
                            text = stringResource(R.string.validan_min_caracteres, value.length, minCharacters),
                            style = MaterialTheme.typography.bodySmall,
                            color = if (isLengthInvalid && value.isNotEmpty()) 
                                MaterialTheme.colorScheme.error 
                            else 
                                MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = MaterialTheme.colorScheme.primary,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                errorBorderColor = MaterialTheme.colorScheme.error
            )
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun RietiTextFieldPreview() {
    RietiTheme {
        Column(modifier = Modifier.padding(RietiTheme.spacing.lg)) {
            RietiTextField(
                value = "",
                onValueChange = {},
                label = "Referencia del lugar",
                placeholder = "Ej. Frente al mercado"
            )
            RietiTextField(
                value = "Corto",
                onValueChange = {},
                label = "Descripción",
                minCharacters = 20,
                singleLine = false,
                minLines = 3,
                modifier = Modifier.padding(top = RietiTheme.spacing.md)
            )
        }
    }
}
