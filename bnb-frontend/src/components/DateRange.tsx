import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface Props {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (from: Date | null, to: Date | null) => void;
}

export default function TailwindDateRange({ startDate, endDate, onChange }: Props) {
  const range: DateRange | undefined = {
    from: startDate ?? undefined,
    to: endDate ?? undefined,
  };

  const handleSelect = (value: DateRange | undefined) => {
    onChange(value?.from ?? null, value?.to ?? null);
  };

  return (
    <div className="p-4 bg-white border rounded-2xl shadow-md">
      <DayPicker
        mode="range"
        selected={range}
        onSelect={handleSelect}
        showOutsideDays
        classNames={{
          months: "flex flex-col sm:flex-row gap-4",
          month: "space-y-4",
          caption: "text-center font-medium text-gray-700",
          table: "w-full border-collapse",
          head_cell: "py-1 text-gray-400 font-semibold",
          cell: "p-1",
          day: "h-10 w-10 flex items-center justify-center rounded-xl cursor-pointer transition",
          day_selected: "bg-rose-500 text-white hover:bg-rose-600",
          day_range_middle: "bg-rose-100 text-rose-600",
          day_today: "border border-rose-400",
        }}
      />
    </div>
  );
}
