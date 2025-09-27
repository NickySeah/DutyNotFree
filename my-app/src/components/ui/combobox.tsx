"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  width?: string;
  loading?: boolean;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found.",
  width = "w-[200px]",
  loading = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  // Get selected option for display
  const selectedOption = options.find((option) => option.value === value);

  // Filter options based on search and limit results for performance
  const filteredOptions = React.useMemo(() => {
    if (!search) return options.slice(0, 50); // Show first 50 items when no search
    
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase()) ||
      option.value.toLowerCase().includes(search.toLowerCase())
    );
    
    return filtered.slice(0, 100); // Limit to 100 results
  }, [options, search]);

  // Remove the problematic wheel event handler - let browser handle scrolling naturally

  // Truncate long labels for display
  const truncateLabel = (label: string, maxLength: number = 50) => {
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength) + "...";
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(width, "justify-between h-auto min-h-[40px] px-3 py-2")}
          disabled={loading}
        >
          <span 
            className="text-left truncate pr-2 flex-1" 
            title={selectedOption?.label}
          >
            {selectedOption ? truncateLabel(selectedOption.label) : placeholder}
          </span>
          <ChevronsUpDownIcon className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 max-h-[300px]" 
        align="start"
        side="bottom"
        sideOffset={4}
        style={{ width: 'var(--radix-popover-trigger-width)', minWidth: '300px' }}
      >
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={search}
            onValueChange={setSearch}
            className="h-9"
          />
          <CommandList 
            className="max-h-[250px] overflow-y-auto"
          >
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                  Loading...
                </div>
              ) : search ? (
                "No results found."
              ) : (
                emptyMessage
              )}
            </CommandEmpty>
            <CommandGroup>
              {!search && filteredOptions.length === 50 && (
                <div className="px-3 py-2 text-xs text-muted-foreground text-center border-b bg-gray-50">
                  Showing first 50 items. Type to search for more.
                </div>
              )}
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value === value ? "" : option.value)
                    setOpen(false)
                    setSearch("") // Clear search when item is selected
                  }}
                  className="flex items-start gap-3 py-3 px-3 cursor-pointer hover:bg-gray-50 focus:bg-gray-100"
                >
                  <CheckIcon
                    className={cn(
                      "h-4 w-4 shrink-0 mt-0.5",
                      value === option.value ? "opacity-100 text-blue-600" : "opacity-0"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <span 
                      className="block text-sm leading-5 break-words"
                      title={option.label}
                    >
                      {option.label}
                    </span>
                  </div>
                </CommandItem>
              ))}
              {search && filteredOptions.length === 100 && (
                <div className="px-3 py-2 text-xs text-muted-foreground text-center border-t bg-gray-50">
                  Showing first 100 results. Refine search for more specific results.
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}