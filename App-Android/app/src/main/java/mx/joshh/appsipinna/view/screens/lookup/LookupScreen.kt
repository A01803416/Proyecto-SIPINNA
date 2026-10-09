/**
 * Pantalla de captura de folio y correo electrónico para consultar el estatus de un reporte.
 */
package mx.joshh.appsipinna.view.screens.lookup

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.view.components.RietiButton
import mx.joshh.appsipinna.view.components.RietiTextField
import mx.joshh.appsipinna.view.components.RietiTopAppBar
import mx.joshh.appsipinna.view.theme.RietiTheme

/** Pantalla de consulta por folio y correo. */
@Composable
fun LookupScreen(
    onConsultarClick: (String, String) -> Unit,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var folio by remember { mutableStateOf("") }
    var correo by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            RietiTopAppBar(
                title = stringResource(R.string.lookup_titulo),
                onBackClick = onBackClick
            )
        },
        bottomBar = {
            RietiButton(
                text = stringResource(R.string.boton_consultar),
                onClick = { onConsultarClick(folio, correo) },
                enabled = folio.isNotBlank() && correo.isNotBlank(),
                modifier = Modifier.padding(RietiTheme.spacing.lg)
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
                .verticalScroll(rememberScrollState())
                .padding(top = RietiTheme.spacing.xl),
            verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.xl)
        ) {
            Text(
                text = stringResource(R.string.lookup_instrucciones),
                style = MaterialTheme.typography.bodyLarge
            )

            RietiTextField(
                value = folio,
                onValueChange = { folio = it.uppercase() },
                label = stringResource(R.string.lookup_label_folio),
                placeholder = stringResource(R.string.lookup_placeholder_folio)
            )

            RietiTextField(
                value = correo,
                onValueChange = { correo = it },
                label = stringResource(R.string.lookup_label_correo),
                placeholder = stringResource(R.string.lookup_placeholder_correo),
                keyboardType = KeyboardType.Email
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun LookupScreenPreview() {
    RietiTheme {
        LookupScreen(onConsultarClick = { _, _ -> }, onBackClick = {})
    }
}
