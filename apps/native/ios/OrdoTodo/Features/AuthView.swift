import SwiftUI

/// Acceso por email (ODD 052): marca, título y formulario. OAuth en web.
/// HIG: formulario agrupado, teclado email, botón deshabilitado si inválido.
struct AuthView: View {
    @Environment(SessionStore.self) private var session
    @State private var vm: AuthViewModel?

    var body: some View {
        NavigationStack {
            if let vm {
                AuthForm(vm: vm)
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .task { vm = AuthViewModel(session: session) }
            }
        }
    }
}

private struct AuthForm: View {
    @Bindable var vm: AuthViewModel
    @State private var showPassword = false
    @FocusState private var focused: Bool

    var body: some View {
        Form {
            Section {
                HStack {
                    Spacer()
                    VStack(spacing: 8) {
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Color.ordoBrand)
                            .frame(width: 56, height: 56)
                            .overlay {
                                Image(systemName: "checkmark")
                                    .font(.title)
                                    .bold()
                                    .foregroundStyle(.white)
                                    .accessibilityHidden(true)
                            }
                        Text(vm.mode == .login ? "Te damos la bienvenida"
                             : "Crea tu cuenta")
                            .font(.headline)
                        Text("Tu día, sereno, en el bolsillo")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                }
                .listRowBackground(Color.clear)
            }

            Section {
                TextField("Correo", text: $vm.email)
                    .keyboardType(.emailAddress)
                    .textContentType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .focused($focused)
                if showPassword {
                    TextField("Contraseña", text: $vm.password)
                        .textContentType(vm.mode == .login ? .password : .newPassword)
                } else {
                    SecureField("Contraseña", text: $vm.password)
                        .textContentType(vm.mode == .login ? .password : .newPassword)
                }
                if vm.mode == .register {
                    TextField("Usuario", text: $vm.username)
                        .textInputAutocapitalization(.never)
                    TextField("Nombre", text: $vm.name)
                        .textContentType(.name)
                    TextField("Código de invitación (opcional)",
                              text: $vm.inviteCode)
                        .textInputAutocapitalization(.never)
                }
            }

            if let message = vm.errorMessage {
                Section {
                    Text(LocalizedStringKey(message))
                        .foregroundStyle(.red)
                        .accessibilityLabel(L("Error: %@", message))
                }
            }

            Section {
                Button {
                    Task { await vm.submit() }
                } label: {
                    if vm.busy {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                    } else {
                        Text(vm.mode == .login ? "Entrar" : "Crear cuenta")
                            .frame(maxWidth: .infinity)
                    }
                }
                .disabled(!vm.isValid || vm.busy)
                Button(vm.mode == .login
                       ? "¿Sin cuenta? Regístrate" : "¿Ya tienes cuenta? Entra") {
                    withAnimation {
                        vm.mode = vm.mode == .login ? .register : .login
                        vm.errorMessage = nil
                    }
                }
            }
        }
        .navigationTitle("Ordo Todo")
        .toolbar {
            ToolbarItemGroup(placement: .keyboard) {
                Spacer()
                Button(showPassword ? "Ocultar" : "Ver") {
                    showPassword.toggle()
                }
                Button("Listo") { focused = false }
            }
        }
    }
}
