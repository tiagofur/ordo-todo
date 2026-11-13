import SwiftUI
import WidgetKit

@main
struct OrdoWidgetBundle: WidgetBundle {
    var body: some Widget {
        TodayWidget()
        FocusLiveActivity()
    }
}
