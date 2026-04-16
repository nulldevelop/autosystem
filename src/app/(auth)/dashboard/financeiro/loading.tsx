import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinanceiroLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-9 w-64 bg-white/5" />
        <Skeleton className="h-4 w-48 bg-white/5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-white/5 bg-black/20">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24 bg-white/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-48 bg-white/5" />
              <div className="flex items-center gap-2 mt-2">
                <Skeleton className="h-4 w-4 bg-white/5" />
                <Skeleton className="h-3 w-32 bg-white/5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/5 bg-black/20 overflow-hidden">
        <CardHeader className="border-b border-white/5">
          <Skeleton className="h-5 w-40 bg-white/5" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-lg bg-white/5" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-64 bg-white/5" />
                    <Skeleton className="h-3 w-40 bg-white/5" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-24 ml-auto bg-white/5" />
                  <Skeleton className="h-3 w-12 ml-auto bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
