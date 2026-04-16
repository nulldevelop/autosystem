import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetLoading() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-9 w-64 bg-white/5" />
          <Skeleton className="h-4 w-48 bg-white/5" />
        </div>
        <Skeleton className="h-10 w-full sm:w-40 bg-white/5" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-white/5 bg-black/20">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-3 w-20 bg-white/5" />
                <Skeleton className="h-5 w-16 rounded-full bg-white/5" />
              </div>
              <Skeleton className="h-7 w-48 mb-1 bg-white/5" />
              <Skeleton className="h-3 w-32 bg-white/5" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-16 bg-white/5" />
                  <Skeleton className="h-6 w-24 bg-white/5" />
                </div>
                <Skeleton className="h-3 w-full mt-2 bg-white/5" />
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 bg-white/5" />
                  <Skeleton className="h-9 flex-1 bg-white/5" />
                </div>
                <Skeleton className="h-9 w-full bg-white/5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
