package dev.creapolis.ordotodo.tile

import android.content.Intent
import android.service.quicksettings.TileService
import dev.creapolis.ordotodo.MainActivity

/**
 * Quick Settings tile (F4a): one tap opens capture from anywhere.
 * The shell routes the action to the capture sheet on the Hoy tab.
 */
class QuickCaptureTile : TileService() {
    override fun onClick() {
        super.onClick()
        val intent =
            packageManager.getLaunchIntentForPackage(packageName)?.apply {
                action = MainActivity.ACTION_CAPTURE
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            } ?: return
        startActivityAndCollapse(intent)
    }
}
