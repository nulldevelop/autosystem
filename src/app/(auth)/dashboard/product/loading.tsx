import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-9 w-64 bg-white/5" />
          <Skeleton className="h-4 w-48 bg-white/5" />
        </div>
        <Skeleton className="h-10 w-full sm:w-40 bg-white/5" />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Skeleton className="h-10 flex-1 bg-white/5" />
        <Skeleton className="h-10 w-full md:w-44 bg-white/5" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-white/5 bg-black/20">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-9 w-9 rounded-lg bg-white/5" />
                <Skeleton className="h-5 w-16 rounded bg-white/5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-7 w-48 bg-white/5" />
                <Skeleton className="h-3 w-20 bg-white/5" />
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20 bg-white/5" />
                  <Skeleton className="h-7 w-28 bg-white/5" />
                </div>
              </div>

              <Skeleton className="h-9 w-full bg-white/5" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
