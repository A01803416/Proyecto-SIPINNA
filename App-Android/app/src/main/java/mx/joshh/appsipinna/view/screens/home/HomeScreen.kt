/**
 * Pantalla principal de bienvenida con accesos al reporte de casos, consulta y números de emergencia.
 */
package mx.joshh.appsipinna.view.screens.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.view.components.RietiButton
import mx.joshh.appsipinna.view.components.RietiSecondaryButton
import mx.joshh.appsipinna.view.theme.RietiTheme

/** Pantalla de inicio de la aplicación ciudadano. */
@Composable
fun HomeScreen(
    onReportClick: () -> Unit,
    onLookupClick: () -> Unit,
    onInfoClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        modifier = modifier
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = RietiTheme.spacing.screenHorizontal)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.xxl)
        ) {
            // Hero Section
            Column(
                modifier = Modifier
                    .padding(top = RietiTheme.spacing.huge),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.md)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.logo_rieti),
                    contentDescription = null,
                    modifier = Modifier.size(120.dp)
                )
                Text(
                    text = stringResource(R.string.home_hero_titulo),
                    style = MaterialTheme.typography.displaySmall,
                    color = MaterialTheme.colorScheme.primary,
                    textAlign = TextAlign.Center
                )
                Text(
                    text = stringResource(R.string.home_hero_subtitulo),
                    style = MaterialTheme.typography.bodyLarge,
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }

            // Action Buttons
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.md)
            ) {
                RietiButton(
                    text = stringResource(R.string.home_boton_reportar),
                    onClick = onReportClick,
                    modifier = Modifier.testTag("btn_reportar")
                )
                RietiSecondaryButton(
                    text = stringResource(R.string.home_boton_consultar),
                    onClick = onLookupClick
                )
            }

            // Info Link
            Text(
                text = stringResource(R.string.home_link_info),
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.secondary,
                textDecoration = TextDecoration.Underline,
                modifier = Modifier
                    .clickable { onInfoClick() }
                    .padding(vertical = RietiTheme.spacing.sm)
            )

            // Emergency Block
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(MaterialTheme.shapes.large)
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .padding(RietiTheme.spacing.lg),
                verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.md)
            ) {
                Text(
                    text = stringResource(R.string.home_emergencia_titulo),
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                EmergencyItem(text = stringResource(R.string.home_emergencia_911))
                EmergencyItem(text = stringResource(R.string.home_emergencia_sipinna))
            }
        }
    }
}

@Composable
private fun EmergencyItem(text: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm)
    ) {
        Icon(
            imageVector = Icons.Default.Phone,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(RietiTheme.spacing.screenHorizontal)
        )
        Text(
            text = text,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Bold
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun HomeScreenPreview() {
    RietiTheme {
        HomeScreen(onReportClick = {}, onLookupClick = {}, onInfoClick = {})
    }
}
