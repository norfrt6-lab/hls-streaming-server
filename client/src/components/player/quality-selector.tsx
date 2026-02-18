"use client";

import { useSelector, useDispatch } from "react-redux";
import { selectPlayerState, setCurrentQuality } from "@/store/slices/player-slice";
import { QUALITY_LABELS } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function QualitySelector() {
  const dispatch = useDispatch();
  const { currentQuality, availableQualities } = useSelector(selectPlayerState);

  return (
    <Select
      value={String(currentQuality)}
      onValueChange={(value) => dispatch(setCurrentQuality(Number(value)))}
    >
      <SelectTrigger className="h-8 w-[100px] border-none bg-white/10 text-xs text-white hover:bg-white/20">
        <SelectValue placeholder="Quality" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="-1">Auto</SelectItem>
        {availableQualities.map((level) => (
          <SelectItem key={level} value={String(level)}>
            {QUALITY_LABELS[level] ?? `Level ${level}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
