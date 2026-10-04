import Link from "next/link";
import { Boxes } from "lucide-react";
export function Brand() {
  return <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight" aria-label="DutyNotFree home"><span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Boxes className="size-5" /></span>DutyNotFree<span className="size-1.5 rounded-full bg-primary" /></Link>;
}
