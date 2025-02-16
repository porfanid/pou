export default function ErrorLayout(children) {
    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-background">
            <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-black to-[#200000]">{children}</main>
        </div>
    );
}
