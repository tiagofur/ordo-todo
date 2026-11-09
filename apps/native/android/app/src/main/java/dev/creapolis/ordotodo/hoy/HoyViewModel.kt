package dev.creapolis.ordotodo.hoy

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.creapolis.ordotodo.data.ApiException
import dev.creapolis.ordotodo.data.NetworkException
import dev.creapolis.ordotodo.data.SessionStore
import dev.creapolis.ordotodo.data.TasksRepository
import dev.creapolis.ordotodo.data.TodayTask
import dev.creapolis.ordotodo.data.UnauthorizedException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed interface HoyUiState {
    data object Loading : HoyUiState

    data object Offline : HoyUiState

    data class Content(
        val sections: List<DaySection>,
        val done: Int,
        val total: Int,
    ) : HoyUiState
}

class HoyViewModel(
    private val tasks: TasksRepository,
    private val session: SessionStore,
) : ViewModel() {
    private val _state = MutableStateFlow<HoyUiState>(HoyUiState.Loading)
    val state: StateFlow<HoyUiState> = _state

    init {
        refresh()
    }

    fun refresh() {
        _state.value = HoyUiState.Loading
        viewModelScope.launch {
            try {
                val response = tasks.today()
                val sections = sectionToday(response)
                val all = sections.flatMap { it.tasks }
                _state.value =
                    HoyUiState.Content(
                        sections = sections,
                        done = all.count(TodayTask::isDone),
                        total = all.size,
                    )
            } catch (_: UnauthorizedException) {
                session.clear()
            } catch (_: NetworkException) {
                _state.value = HoyUiState.Offline
            } catch (_: ApiException) {
                _state.value = HoyUiState.Offline
            }
        }
    }
}
