package dev.creapolis.ordotodo

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import dev.creapolis.ordotodo.ui.catalog.DesignSystemCatalog
import dev.creapolis.ordotodo.ui.theme.OrdoTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            OrdoTheme {
                DesignSystemCatalog()
            }
        }
    }
}
