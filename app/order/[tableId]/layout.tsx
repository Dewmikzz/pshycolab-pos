export default function MobileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-full w-full bg-black flex justify-center">
            <div className="w-full max-w-md bg-pos-bg min-h-screen relative shadow-2xl overflow-x-hidden">
                {children}
            </div>
        </div>
    );
}
