import { CheckSquare } from "lucide-react";

export interface LogoProps {
  className?: string;
  big?: boolean;
}

export default function Logo(props: LogoProps) {
  return (
    <div
      className={`flex items-center gap-3 ${props.className ?? ""}`}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-2xl bg-[#ad46ff] text-white shadow-md shadow-[#ad46ff]/30 ${
          props.big ? "h-12 w-12" : "h-10 w-10"
        }`}
      >
        <CheckSquare className={props.big ? "h-7 w-7 stroke-[2.2]" : "h-6 w-6 stroke-[2.2]"} />
      </div>
      <span className={`font-bold tracking-tight text-foreground ${props.big ? "text-3xl" : "text-2xl"}`}>
        Ordo
      </span>
    </div>
  );
}
