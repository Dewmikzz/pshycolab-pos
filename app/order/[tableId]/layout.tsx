export default function MobileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-full w-full bg-gray-200 flex justify-center font-sans text-slate-900">
            <div className="w-full max-w-md bg-gray-50 min-h-screen relative shadow-2xl overflow-x-hidden selection:bg-orange-100 selection:text-orange-900">
                {children}
            </div>
        </div>
    );
}
