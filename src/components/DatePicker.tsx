"use client";
// 버튼을 누르면 달력이 뜨고, 날짜를 고르면 버튼에 그 날짜가 표시되는 입력칸입니다.
// shadcn의 Popover(떠오르는 상자) 안에 Calendar(달력)를 넣어서 만들었어요.

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "react-day-picker/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { koreaToday, textToDate } from "@/lib/dateText";

type DatePickerProps = {
  id: string;
  value: string; // "2019-11-18" 같은 글자. 비어 있으면 ""
  onChange: (value: string) => void; // 날짜를 고르면 새 글자를 알려줍니다
  disableFuture?: boolean; // true면 오늘 이후 날짜는 못 고릅니다
  invalid?: boolean; // true면 "이 칸 입력이 틀렸다"고 화면 낭독기에 알려줍니다
  errorId?: string; // 이 칸의 오류 문구가 있는 곳의 아이디 (화면 낭독기가 같이 읽어줘요)
};

export default function DatePicker({ id, value, onChange, disableFuture, invalid, errorId }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false); // 달력이 열려 있는지

  const selectedDate = textToDate(value);
  // "오늘"은 한국 시간 기준으로 정합니다. (서버 검사와 같은 기준이어야 달력에서 고른 날이 저장 때 거부되지 않아요)
  const today = koreaToday();

  // 달력에서 날짜를 누르면 실행됩니다.
  function handleSelect(date: Date | undefined) {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
    } else {
      onChange(""); // 같은 날짜를 한 번 더 누르면 선택이 풀려요
    }
    setIsOpen(false); // 고르고 나면 달력을 닫습니다
  }

  // 오늘 이후를 막을지 정합니다. undefined면 아무것도 막지 않아요.
  let disabledDays = undefined;
  if (disableFuture) {
    disabledDays = { after: today };
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-invalid={invalid}
          aria-describedby={errorId}
          className="w-full justify-start font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "yyyy년 M월 d일")
          ) : (
            <span className="text-muted-foreground">날짜를 선택하세요</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={ko}
          selected={selectedDate}
          onSelect={handleSelect}
          defaultMonth={selectedDate}
          // 위쪽에 연도·월 선택 목록을 보여줘서 오래된 앨범도 빨리 찾아갈 수 있어요.
          captionLayout="dropdown"
          startMonth={new Date(1950, 0)}
          endMonth={new Date(today.getFullYear() + 1, 11)}
          disabled={disabledDays}
        />
      </PopoverContent>
    </Popover>
  );
}
