export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center">
            {/* The background is handled by the global body styles and pseudo-elements */}
            <div className="relative z-10 w-full flex justify-center">
                {children}
            </div>
        </div>
    );
}
