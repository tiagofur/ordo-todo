import Logo from "../template/logo.component";
import { useTranslations } from "next-intl";

export default function Processing() {
  const t = useTranslations('Processing');
  return (
    <div className="h-screen">
      <div
        className="
          flex flex-col justify-center items-center
          absolute top-0 left-0 w-full h-full gap-2
          bg-black/90 text-center
        "
      >
        <Logo />
        <span className="font-light text-zinc-500 ml-3">{t('text')}</span>
      </div>
    </div>
  );
}
