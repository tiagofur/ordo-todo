package dev.creapolis.ordotodo.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.creapolis.ordotodo.data.AuthException
import dev.creapolis.ordotodo.data.AuthSession
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

enum class AuthMode {
    LOGIN,
    REGISTER,
}

/** Which message the screen shows; the text itself comes from strings (i18n). */
enum class AuthError {
    NONE,
    INVALID,
    NETWORK,
}

data class AuthUiState(
    val mode: AuthMode = AuthMode.LOGIN,
    val email: String = "",
    val password: String = "",
    val username: String = "",
    val name: String = "",
    val inviteCode: String = "",
    val busy: Boolean = false,
    val error: AuthError = AuthError.NONE,
)

class AuthViewModel(private val auth: AuthSession) : ViewModel() {
    private val _state = MutableStateFlow(AuthUiState())
    val state: StateFlow<AuthUiState> = _state

    fun onEmail(value: String) = update { copy(email = value, error = AuthError.NONE) }

    fun onPassword(value: String) = update { copy(password = value, error = AuthError.NONE) }

    fun onUsername(value: String) = update { copy(username = value, error = AuthError.NONE) }

    fun onName(value: String) = update { copy(name = value, error = AuthError.NONE) }

    fun onInviteCode(value: String) = update { copy(inviteCode = value, error = AuthError.NONE) }

    fun switchMode(mode: AuthMode) {
        _state.value = AuthUiState(mode = mode)
    }

    fun submit() {
        val current = _state.value
        if (current.busy || !valid(current)) {
            _state.value = current.copy(error = AuthError.INVALID)
            return
        }
        _state.value = current.copy(busy = true, error = AuthError.NONE)
        viewModelScope.launch {
            try {
                if (current.mode == AuthMode.LOGIN) {
                    auth.login(current.email, current.password)
                } else {
                    auth.register(
                        email = current.email,
                        username = current.username,
                        name = current.name,
                        password = current.password,
                        inviteCode = current.inviteCode.ifBlank { null },
                    )
                }
                // Success flips the session flow; MainActivity navigates to Hoy.
                _state.value = current.copy(busy = false)
            } catch (e: AuthException) {
                val error = if (e is AuthException.Network) AuthError.NETWORK else AuthError.INVALID
                _state.value = current.copy(busy = false, error = error)
            }
        }
    }

    private fun valid(state: AuthUiState): Boolean {
        if (state.email.isBlank() || state.password.length < 8) return false
        if (state.mode == AuthMode.REGISTER) {
            if (state.username.isBlank() || state.name.isBlank()) return false
        }
        return true
    }

    private fun update(transform: AuthUiState.() -> AuthUiState) {
        _state.value = _state.value.transform()
    }
}
