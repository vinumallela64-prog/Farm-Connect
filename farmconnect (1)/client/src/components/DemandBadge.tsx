import type React from "react";
import { useLang } from "../LanguageContext";

interface Props {
  level: "High" | "Medium" | "Low";
}

const DemandBadge: React.FC<Props> = ({ level }) => {
  const { t } = useLang();
  const config = {
    High: {
      bg: "bg-red-100 text-red-700 border-red-200",
      icon: "🔴",
      label: t("high"),
    },
    Medium: {
      bg: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: "🟡",
      label: t("medium"),
    },
    Low: {
      bg: "bg-green-100 text-green-700 border-green-200",
      icon: "🟢",
      label: t("low"),
    },
  };
  const c = config[level];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${c.bg}`}
    >
      {c.icon} {c.label}
    </span>
  );
};

export default DemandBadge;
