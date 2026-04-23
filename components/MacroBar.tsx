type Props = {
  label: string;
  current: number;
  goal: number;
  color: string;
  unit?: string;
};

export default function MacroBar({ label, current, goal, color, unit = "g" }: Props) {
  const pct = Math.min(100, goal > 0 ? (current / goal) * 100 : 0);
  const over = current > goal;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className={over ? "text-red-500 font-semibold" : "text-gray-500"}>
          {Math.round(current)}{unit === "kcal" ? "" : unit} / {goal}{unit === "kcal" ? " kcal" : unit}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${over ? "bg-red-500" : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
