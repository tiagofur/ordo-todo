package dev.creapolis.ordotodo.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dev.creapolis.ordotodo.hoy.CreateOp
import dev.creapolis.ordotodo.hoy.CreateOpStore
import dev.creapolis.ordotodo.hoy.HabitOp
import dev.creapolis.ordotodo.hoy.HabitOpStore
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
    /** Captured offline and not on the server yet (ODD 051 S4); never sent by the API. */
    val pendingSync: Boolean = false,
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
) : StatusStore,
    HabitOpStore,
    CreateOpStore,
    OutboxStore {
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

    override suspend fun outboxPending(): List<OutboxOp> {
        val raw = store.data.map { it[KEY_OUTBOX] }.first()
        if (raw != null) {
            return try {
                json.decodeFromString(ListSerializer(OutboxOp.serializer()), raw)
            } catch (_: Exception) {
                emptyList()
            }
        }
        // Legacy migration if KEY_OUTBOX not yet populated
        val legacyCreates = createPending().map {
            OutboxOp.CreateTask(it.localId, it.title, it.date, it.time, it.priority, it.projectId, it.at)
        }
        val legacyStatus = pending().map {
            OutboxOp.StatusFlip(it.taskId, it.done, it.at)
        }
        val legacyHabits = habitPending().map {
            OutboxOp.HabitCheck(it.habitId, it.done, it.at)
        }
        val migrated = legacyCreates + legacyStatus + legacyHabits
        if (migrated.isNotEmpty()) {
            store.edit { prefs ->
                prefs[KEY_OUTBOX] = json.encodeToString(ListSerializer(OutboxOp.serializer()), migrated)
            }
        }
        return migrated
    }

    override suspend fun enqueueOp(op: OutboxOp) {
        store.edit { prefs ->
            val current = prefs[KEY_OUTBOX]?.let {
                try {
                    json.decodeFromString(ListSerializer(OutboxOp.serializer()), it)
                } catch (_: Exception) {
                    emptyList()
                }
            } ?: emptyList()
            prefs[KEY_OUTBOX] = json.encodeToString(ListSerializer(OutboxOp.serializer()), current + op)
        }
    }

    override suspend fun acknowledgeOps(applied: List<OutboxOp>) {
        if (applied.isEmpty()) return
        val appliedSet = applied.toSet()
        store.edit { prefs ->
            val current = prefs[KEY_OUTBOX]?.let {
                try {
                    json.decodeFromString(ListSerializer(OutboxOp.serializer()), it)
                } catch (_: Exception) {
                    emptyList()
                }
            } ?: emptyList()
            val remaining = current - appliedSet
            prefs[KEY_OUTBOX] = json.encodeToString(ListSerializer(OutboxOp.serializer()), remaining)
        }
    }

    override suspend fun updateOutbox(transform: (List<OutboxOp>) -> List<OutboxOp>) {
        store.edit { prefs ->
            val current = prefs[KEY_OUTBOX]?.let {
                try {
                    json.decodeFromString(ListSerializer(OutboxOp.serializer()), it)
                } catch (_: Exception) {
                    emptyList()
                }
            } ?: emptyList()
            val updated = transform(current)
            prefs[KEY_OUTBOX] = json.encodeToString(ListSerializer(OutboxOp.serializer()), updated)
        }
    }

    /** Replaces a temporary local capture ID with the assigned server ID in cached today and tasks. */
    suspend fun reconcileLocalId(localId: String, serverId: String) {
        loadDay()?.let { day ->
            saveDay(reconcileLocalIdInDay(day, localId, serverId))
        }
        loadTasks()?.let { tasks ->
            saveTasks(reconcileLocalIdInTasks(tasks, localId, serverId))
        }
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

    suspend fun saveHabits(response: HabitsTodayResponse) {
        store.edit { it[KEY_HABITS] = json.encodeToString(HabitsTodayResponse.serializer(), response) }
    }

    suspend fun loadHabits(): HabitsTodayResponse? {
        val raw = store.data.map { it[KEY_HABITS] }.first() ?: return null
        return try {
            json.decodeFromString(HabitsTodayResponse.serializer(), raw)
        } catch (_: Exception) {
            null
        }
    }

    override suspend fun habitPending(): List<HabitOp> {
        val raw = store.data.map { it[KEY_HABIT_OPS] }.first() ?: return emptyList()
        return try {
            json.decodeFromString(ListSerializer(HabitOp.serializer()), raw)
        } catch (_: Exception) {
            emptyList()
        }
    }

    override suspend fun enqueueHabit(op: HabitOp) {
        val ops = habitPending() + op.copy(at = System.currentTimeMillis())
        store.edit { it[KEY_HABIT_OPS] = json.encodeToString(ListSerializer(HabitOp.serializer()), ops) }
    }

    override suspend fun acknowledgeHabits(applied: List<HabitOp>) {
        if (applied.isEmpty()) return
        val remaining = habitPending() - applied.toSet()
        store.edit { it[KEY_HABIT_OPS] = json.encodeToString(ListSerializer(HabitOp.serializer()), remaining) }
    }

    override suspend fun createPending(): List<CreateOp> {
        val raw = store.data.map { it[KEY_CREATE_OPS] }.first() ?: return emptyList()
        return try {
            json.decodeFromString(ListSerializer(CreateOp.serializer()), raw)
        } catch (_: Exception) {
            emptyList()
        }
    }

    override suspend fun enqueueCreate(op: CreateOp) {
        store.edit { prefs ->
            val current =
                prefs[KEY_CREATE_OPS]?.let {
                    try {
                        json.decodeFromString(ListSerializer(CreateOp.serializer()), it)
                    } catch (_: Exception) {
                        emptyList()
                    }
                } ?: emptyList()
            prefs[KEY_CREATE_OPS] =
                json.encodeToString(ListSerializer(CreateOp.serializer()), current + op)
        }
    }

    override suspend fun acknowledgeCreates(applied: List<CreateOp>) {
        if (applied.isEmpty()) return
        val remaining = createPending() - applied.toSet()
        store.edit { it[KEY_CREATE_OPS] = json.encodeToString(ListSerializer(CreateOp.serializer()), remaining) }
    }

    /** Last good unfiltered task list, so the Tareas tab opens without a spinner. */
    suspend fun saveTasks(tasks: List<TodayTask>) {
        store.edit { it[KEY_TASKS] = json.encodeToString(ListSerializer(TodayTask.serializer()), tasks) }
    }

    suspend fun loadTasks(): List<TodayTask>? {
        val raw = store.data.map { it[KEY_TASKS] }.first() ?: return null
        return try {
            json.decodeFromString(ListSerializer(TodayTask.serializer()), raw)
        } catch (_: Exception) {
            null
        }
    }

    companion object {
        private val KEY_OUTBOX = stringPreferencesKey("outbox_ops")
        private val KEY_CREATE_OPS = stringPreferencesKey("create_ops")
        private val KEY_TASKS = stringPreferencesKey("tasks_json")
        private val KEY_DAY = stringPreferencesKey("today_json")
        private val KEY_OPS = stringPreferencesKey("status_ops")
        private val KEY_HABIT_OPS = stringPreferencesKey("habit_ops")
        private val KEY_HABITS = stringPreferencesKey("habits_json")

        fun from(context: Context): DayStore = DayStore(context.dayDataStore)
    }
}
