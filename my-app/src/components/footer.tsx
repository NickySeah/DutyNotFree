import Link from "next/link";
import { Brand } from "./brand";
export default function Footer() {
  return <footer className="border-t bg-card py-10"><div className="site-container flex flex-col justify-between gap-8 sm:flex-row sm:items-center"><div><Brand /><p className="mt-3 text-sm text-muted-foreground">A clearer view of international trade.</p></div><div className="flex flex-wrap gap-6 text-sm text-muted-foreground"><Link href="/about">About the project</Link><Link href="/login">Log in</Link><Link href="/register">Create an account</Link></div></div><div className="site-container mt-8 flex flex-col justify-between gap-2 border-t pt-5 text-xs text-muted-foreground sm:flex-row"><span>© {new Date().getFullYear()} DutyNotFree</span><span>Built at Singapore Management University. For educational use.</span></div></footer>;
}
