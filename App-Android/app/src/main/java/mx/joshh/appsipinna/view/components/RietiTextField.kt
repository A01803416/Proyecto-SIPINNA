/**
 * Campo de texto personalizado con soporte para etiquetas, contadores de caracteres, límite, testTags y auto-scroll al recibir foco.
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
package mx.joshh.appsipinna.view.components

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.relocation.BringIntoViewRequester
import androidx.compose.foundation.relocation.bringIntoViewRequester
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.onFocusEvent
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.view.theme.RietiTheme

/**
 * Campo de texto estilizado para formularios de captura con contador de caracteres y auto-scroll al enfocar.
 * @param value Texto actual ingresado en el campo.
 * @param onValueChange Se invoca cada vez que el usuario modifica el texto.
 * @param label Etiqueta descriptiva superior del campo.
 * @param modifier Modificador de diseño opcional.
 * @param placeholder Texto de sugerencia o marcador de posición.
 * @param errorText Mensaje de error opcional a mostrar.
 * @param isError Indica si el campo se encuentra en estado de error visual.
 * @param singleLine Define si el campo es de una sola línea.
 * @param minLines Número mínimo de líneas para campos multilínea.
 * @param minCharacters Número mínimo de caracteres requeridos para validación opcional.
 * @param maxLength Límite máximo de caracteres permitidos (por defecto 255).
 * @param keyboardType Tipo de teclado virtual a mostrar.
 * @param fieldTag Etiqueta de prueba (`testTag`) opcional.
 * @param imeAction Acción del botón de acción del teclado virtual (Next, Done, etc.).
 * @param onImeAction Se invoca cuando el usuario pulsa la acción de ImeAction en el teclado virtual.
 */
@OptIn(ExperimentalFoundationApi::class)
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
    maxLength: Int = 255,
    keyboardType: KeyboardType = KeyboardType.Text,
    fieldTag: String? = null,
    imeAction: ImeAction = ImeAction.Default,
    onImeAction: (() -> Unit)? = null
) {
    val showCounter = minCharacters > 0
    val isLengthInvalid = value.length < minCharacters
    
    val bringIntoViewRequester = remember { BringIntoViewRequester() }
    val coroutineScope = rememberCoroutineScope()
    
    Column(
        modifier = modifier
            .fillMaxWidth()
            .bringIntoViewRequester(bringIntoViewRequester)
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.titleSmall,
            modifier = Modifier.padding(bottom = RietiTheme.spacing.xs)
        )
        OutlinedTextField(
            value = value,
            onValueChange = { if (it.length <= maxLength) onValueChange(it) },
            modifier = Modifier
                .fillMaxWidth()
                .onFocusEvent { focusState ->
                    if (focusState.isFocused) {
                        coroutineScope.launch {
                            delay(300L)
                            try {
                                bringIntoViewRequester.bringIntoView()
                            } catch (_: Exception) {}
                        }
                    }
                }
                .then(if (fieldTag != null) Modifier.testTag(fieldTag) else Modifier),
            placeholder = placeholder?.let { { Text(text = it) } },
            isError = isError || (showCounter && value.isNotEmpty() && isLengthInvalid),
            singleLine = singleLine,
            minLines = minLines,
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType, imeAction = imeAction),
            keyboardActions = KeyboardActions(
                onNext = { onImeAction?.invoke() },
                onDone = { onImeAction?.invoke() }
            ),
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
                    if (maxLength > 0) {
                        Text(
                            text = "${value.length}/$maxLength",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.weight(1f),
                            textAlign = TextAlign.End
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
                maxLength = 500,
                modifier = Modifier.padding(top = RietiTheme.spacing.md)
            )
        }
    }
}
