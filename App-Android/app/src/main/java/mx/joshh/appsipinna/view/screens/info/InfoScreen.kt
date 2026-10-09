/**
 * Pantalla informativa sobre SIPINNA, RIETI y el proceso de atención a reportes.
 */
package mx.joshh.appsipinna.view.screens.info

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
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.view.components.RietiTopAppBar
import mx.joshh.appsipinna.view.theme.RietiTheme

/** Pantalla de información general e institucional. */
@Composable
fun InfoScreen(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Scaffold(
        topBar = {
            RietiTopAppBar(
                title = stringResource(R.string.info_titulo),
                onBackClick = onBackClick
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
                .padding(vertical = RietiTheme.spacing.xl),
            verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.xl)
        ) {
            InfoSection(
                title = stringResource(R.string.info_que_es_sipinna_titulo),
                description = stringResource(R.string.info_que_es_sipinna_desc)
            )
            InfoSection(
                title = stringResource(R.string.info_trabajo_infantil_titulo),
                description = stringResource(R.string.info_trabajo_infantil_desc)
            )
            InfoSection(
                title = stringResource(R.string.info_proceso_titulo),
                description = stringResource(R.string.info_proceso_desc)
            )
        }
    }
}

@Composable
private fun InfoSection(title: String, description: String) {
    Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm)) {
        Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.primary
        )
        Text(
            text = description,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun InfoScreenPreview() {
    RietiTheme {
        InfoScreen(onBackClick = {})
    }
}
