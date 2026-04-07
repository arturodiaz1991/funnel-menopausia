export default function VSLLoading() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-4">
        {/* Title skeleton */}
        <div className="h-8 bg-foreground/5 rounded-xl animate-pulse mx-auto w-2/3" />
        <div className="h-4 bg-foreground/5 rounded-xl animate-pulse mx-auto w-1/2 mb-6" />
        {/* Video skeleton */}
        <div className="aspect-video w-full bg-foreground/5 rounded-2xl animate-pulse" />
      </div>
    </main>
  );
}
