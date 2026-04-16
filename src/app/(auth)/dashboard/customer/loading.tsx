import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CustomerLoading() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40 bg-white/5" />
          <Skeleton className="h-4 w-64 bg-white/5" />
        </div>
        <Skeleton className="h-10 w-40 bg-white/5" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-white/5 bg-black/20">
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-32 bg-white/5" />
              <Skeleton className="h-4 w-48 bg-white/5" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full bg-white/5" />
              <Skeleton className="h-4 w-3/4 bg-white/5" />
              <Skeleton className="h-4 w-1/2 bg-white/5" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
