package dev.creapolis.ordotodo.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dev.creapolis.ordotodo.hoy.StatusOp
import dev.creapolis.ordotodo.hoy.StatusStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json

/** Subset of the backend task payload that the Hoy list renders. */
@Serializable
data class TodaySubTask(
    val id: String,
    val status: String = "TODO",
)

@Serializable
data class TodayProject(
    val id: String,
    val name: String,
    val color: String? = null,
)

@Serializable
data class TodayTask(
    val id: String,
    val title: String,
    val status: String = "TODO",
    val priority: String = "MEDIUM",
    val dueDate: String? = null,
    val doDate: String? = null,
    val scheduledDate: String? = null,
    val scheduledTime: String? = null,
    val project: TodayProject? = null,
    val subTasks: List<TodaySubTask> = emptyList(),
) {
    val isDone: Boolean get() = status == "COMPLETED" || status == "CANCELLED"
    val doneSubTasks: Int get() = subTasks.count { it.status == "COMPLETED" }
}

/** Mirrors `GET /tasks/today` (`tasks.service.findToday`). */
@Serializable
data class TodayResponse(
    val overdue: List<TodayTask> = emptyList(),
    val dueToday: List<TodayTask> = emptyList(),
    val scheduledToday: List<TodayTask> = emptyList(),
    val available: List<TodayTask> = emptyList(),
    @SerialName("notYetAvailable")
    val notYetAvailable: List<TodayTask> = emptyList(),
)


private val Context.dayDataStore: DataStore<Preferences> by preferencesDataStore("day")

/**
 * F1b offline store (ODD 050, D3): the last good day plus the status-flip
 * outbox, both as JSON. Room replaces the body of this class when the
 * toolchain can resolve it — the interfaces stay untouched.
 */
class DayStore(
    private val store: DataStore<Preferences>,
    private val json: Json = Json { ignoreUnknownKeys = true },
) : StatusStore {
    suspend fun loadDay(): TodayResponse? {
        val raw = store.data.map { it[KEY_DAY] }.first() ?: return null
        return try {
            json.decodeFromString<TodayResponse>(raw)
        } catch (_: Exception) {
            null
        }
    }

    suspend fun saveDay(response: TodayResponse) {
        store.edit { it[KEY_DAY] = json.encodeToString(TodayResponse.serializer(), response) }
    }

    override suspend fun pending(): List<StatusOp> {
        val raw = store.data.map { it[KEY_OPS] }.first() ?: return emptyList()
        return try {
            json.decodeFromString(ListSerializer(StatusOp.serializer()), raw)
        } catch (_: Exception) {
            emptyList()
        }
    }

    override suspend fun enqueue(op: StatusOp) {
        val ops = pending() + op.copy(at = System.currentTimeMillis())
        store.edit { it[KEY_OPS] = json.encodeToString(ListSerializer(StatusOp.serializer()), ops) }
    }

    override suspend fun acknowledge(applied: List<StatusOp>) {
        if (applied.isEmpty()) return
        val remaining = pending() - applied.toSet()
        store.edit { it[KEY_OPS] = json.encodeToString(ListSerializer(StatusOp.serializer()), remaining) }
    }

    companion object {
        private val KEY_DAY = stringPreferencesKey("today_json")
        private val KEY_OPS = stringPreferencesKey("status_ops")

        fun from(context: Context): DayStore = DayStore(context.dayDataStore)
    }
}
