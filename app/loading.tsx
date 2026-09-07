export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="size-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Chargement...</p>
            </div>
        </div>
    );
}
