import { DayPicker, type DateRange } from "react-day-picker";
import "../styles/datepicker.css";
import { useRef } from "react";

interface Props {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (from: Date | null, to: Date | null) => void;
  onComplete?: () => void;
}

export default function TailwindDateRange({
  startDate,
  endDate,
  onChange,
  onComplete,
}: Props) {
  const previousStart = useRef<Date | null>(startDate);

  const range: DateRange | undefined = {
    from: startDate ?? undefined,
    to: endDate ?? undefined,
  };

  const handleSelect = (value: DateRange | undefined) => {
    const newFrom = value?.from ?? null;
    const newTo = value?.to ?? null;

    onChange(newFrom, newTo);

    // 👉 Stäng bara om:
    // - vi hade ett startdatum innan, OCH
    // - nu har vi både start och slutdatum, OCH
    // - start ≠ slut
    const selectingSecond =
      previousStart.current &&
      newFrom &&
      newTo &&
      newFrom.getTime() !== newTo.getTime();

    if (selectingSecond && onComplete) {
      setTimeout(() => onComplete(), 120);
    }

    previousStart.current = newFrom;
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-4 border border-gray-200 relative">
      <button
        onClick={() => {
          onChange(null, null);
          previousStart.current = null;
        }}
        className="absolute right-3 top-3 text-xs text-gray-400 hover:text-rose-500 transition"
      >
        Rensa
      </button>

      <DayPicker
        mode="range"
        selected={range}
        onSelect={handleSelect}
        showOutsideDays
        numberOfMonths={1}
        fixedWeeks
      />
    </div>
  );
}
