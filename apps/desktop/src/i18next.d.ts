import 'i18next';
import { Dictionary } from '@ordo-todo/i18n';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: {
            translation: Dictionary;
        };
    }
}
