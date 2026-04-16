import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlansLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64 bg-white/5" />
        <Skeleton className="h-4 w-96 bg-white/5" />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-center gap-4">
          <Skeleton className="h-5 w-16 bg-white/5" />
          <Skeleton className="h-6 w-11 rounded-full bg-white/5" />
          <Skeleton className="h-5 w-16 bg-white/5" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card
              key={i}
              className={`border-white/10 bg-black/20 ${i === 1 ? "scale-105" : ""}`}
            >
              <CardHeader className="pb-4">
                <Skeleton className="h-7 w-32 bg-white/5" />
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-20 bg-white/5" />
                  <div className="flex items-baseline gap-1">
                    <Skeleton className="h-9 w-24 bg-white/5" />
                    <Skeleton className="h-4 w-10 bg-white/5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-6 space-y-3">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-full bg-white/5" />
                    <Skeleton className="h-4 w-full bg-white/5" />
                  </div>
                ))}
              </CardContent>
              <CardFooter className="pt-4">
                <Skeleton className="h-10 w-full bg-white/5" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
