import * as React from "react";
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}
declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLInputElement>>;
export { Switch };
//# sourceMappingURL=switch.d.ts.map