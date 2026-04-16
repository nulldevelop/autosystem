import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceOrderLoading() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-white/5" />
          <Skeleton className="h-4 w-64 bg-white/5" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-white/5 bg-black/20">
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-32 bg-white/5" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-12 bg-white/5" />
                <Skeleton className="h-5 w-20 rounded-full bg-white/5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full bg-white/5" />
              <Skeleton className="h-4 w-3/4 bg-white/5" />
              <Skeleton className="h-4 w-1/2 bg-white/5" />
              <Skeleton className="h-4 w-full bg-white/5" />
            </CardContent>
            <div className="p-4 pt-0">
              <Skeleton className="h-10 w-full bg-white/5" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
