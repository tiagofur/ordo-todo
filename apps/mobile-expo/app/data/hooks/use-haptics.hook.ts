import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticType =
    | 'light'
    | 'medium'
    | 'heavy'
    | 'success'
    | 'warning'
    | 'error'
    | 'selection';

export function useHaptics() {
    const trigger = async (type: HapticType) => {
        try {
            switch (type) {
                case 'light':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    break;
                case 'medium':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    break;
                case 'heavy':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    break;
                case 'success':
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    break;
                case 'warning':
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    break;
                case 'error':
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    break;
                case 'selection':
                    await Haptics.selectionAsync();
                    break;
                default:
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
        } catch (error) {
            // Haptics not supported or failed, silently ignore
            console.debug('[Haptics] Not supported or failed:', error);
        }
    };

    const triggerSequence = async (pattern: HapticType[]) => {
        for (const type of pattern) {
            await trigger(type);
            // Small delay between haptics
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    };

    return {
        trigger,
        triggerSequence,
        isSupported: Platform.OS === 'ios' // Haptics are primarily supported on iOS
    };
}