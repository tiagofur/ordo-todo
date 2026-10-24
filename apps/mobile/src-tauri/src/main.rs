// Prevents an additional console window on Windows in release; no-op en móvil.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    ordo_mobile_lib::run()
}
