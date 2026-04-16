import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-10 w-64 bg-white/5" />
        <Skeleton className="h-4 w-48 bg-white/5" />
      </div>

      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border-white/5 bg-black/20">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24 bg-white/5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-16 mb-6 bg-white/5" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 flex-1 bg-white/5" />
                  <Skeleton className="h-8 w-8 bg-white/5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
    </div>
  );
}
