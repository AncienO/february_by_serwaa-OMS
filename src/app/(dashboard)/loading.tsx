export default function DashboardLoading() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
                <p className="text-sm text-zinc-500">Loading...</p>
            </div>
        </div>
    );
}
