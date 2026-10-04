import { AlertCircle, Database, Loader2, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
export function DataStatus({
  loading = false,
  error = false,
  title,
  description,
  retry,
}: {
  loading?: boolean;
  error?: boolean;
  title?: string;
  description?: string;
  retry?: () => void;
}) {
  const Icon = loading ? Loader2 : error ? AlertCircle : Database;
  return (
    <div
      className="flex min-h-60 flex-col items-center justify-center rounded-xl border bg-card p-8 text-center"
      role={error ? "alert" : "status"}
    >
      <Icon
        className={`mb-4 size-7 text-muted-foreground ${loading ? "animate-spin" : ""}`}
      />
      <p className="text-base font-semibold">
        {title ||
          (loading
            ? "Loading your trade data…"
            : error
              ? "Could not load your data"
              : "No records to display")}
      </p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description ||
          (error
            ? "The trade service is currently unavailable. Please try again."
            : loading
              ? "Getting the details ready."
              : "Adjust the filters or add a record to get started.")}
      </p>
      {error && retry && (
        <Button variant="outline" className="mt-5" onClick={retry}>
          <RefreshCw />
          Try again
        </Button>
      )}
    </div>
  );
}
