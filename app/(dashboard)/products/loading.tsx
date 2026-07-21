import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function Loading() {
  const skeletonRows = Array.from({ length: 8 });

  return (
    <div className="flex flex-col w-full p-4 gap-4">
      {/* Header skeleton */}
      <div className="sticky top-8 bg-white flex flex-col w-full gap-4 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-200 rounded" />
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-gray-200 rounded" />
            <div className="h-10 w-10 bg-gray-200 rounded-full" />
          </div>
        </div>
        <div className="h-10 w-full bg-gray-100 rounded" />
      </div>

      {/* Table skeleton */}
      <Card className="border-none shadow-none">
        <CardContent className="p-2">
          <div className="max-h-[475px] overflow-y-auto border-b">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-10 w-[50px]" />
                  <TableHead className="w-[270px]" />
                  <TableHead className="w-[150px]" />
                  <TableHead className="w-[100px]" />
                  <TableHead className="w-[100px]" />
                  <TableHead className="w-[50px]" />
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {skeletonRows.map((_, i) => (
                  <TableRow key={i} className="hover:bg-gray-50">
                    <TableCell className="pl-10">
                      <Skeleton className="h-4 w-6" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-16 h-16 rounded" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Pagination skeleton */}
          <div className="mt-4 flex justify-center">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-20 rounded" />

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
