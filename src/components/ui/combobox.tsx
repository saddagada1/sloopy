import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./command";
import { type SelectItem as Item } from "~/utils/types";
import { cn } from "~/utils/shadcn/utils";
import { useElementSize } from "usehooks-ts";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

interface ComboboxProps {
  data?: Item[];
  placeholder?: string;
  defaultValue?: Item;
  onSelect?: (item: Item) => void;
  disabled?: boolean;
  searchFirst?: boolean;
}

const Combobox: React.FC<ComboboxProps> = ({
  data,
  placeholder,
  defaultValue,
  onSelect,
  disabled,
  searchFirst,
}) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [value, setValue] = React.useState<Item | undefined>(defaultValue);
  const [container, { width }] = useElementSize();

  const filteredData = React.useMemo(() => {
    if (searchFirst) {
      if (query.length < 1) return [];
    }
    return data?.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [data, query, searchFirst]);

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        setQuery("");
      }}
    >
      <PopoverTrigger ref={container} disabled={disabled} asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-full justify-between px-2 font-sans font-normal"
        >
          {value ? value?.label : placeholder ?? "Select"}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent style={{ width }} className="h-96 p-0">
        <Command shouldFilter={false}>
          <CommandInput
            onValueChange={(val) => setQuery(val)}
            placeholder={searchFirst ? "Begin typing to search" : "Search"}
          />
          {!searchFirst && (
            <CommandEmpty className="m-0 p-2 text-muted-foreground">
              No results found.
            </CommandEmpty>
          )}
          <CommandGroup className="overflow-y-scroll">
            {filteredData?.map((item, index) => (
              <CommandItem
                key={index}
                onSelect={() => {
                  item.value === value?.value
                    ? setValue(undefined)
                    : setValue(item);
                  onSelect && onSelect(item);
                  setOpen(false);
                }}
              >
                <CheckIcon
                  className={cn(
                    "mr-2 h-4 w-4",
                    value?.value === item.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { Combobox };
