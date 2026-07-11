import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export default function SearchInput({ placeholder = "Search...", ...props }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input className="pl-10" placeholder={placeholder} {...props} />
    </div>
  );
}
