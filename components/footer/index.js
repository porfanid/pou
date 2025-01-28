export default function Footer() {
    return (
        <footer className="bg-background dark:bg-background-dark text-text dark:text-text-dark py-8">
            <div className="max-w-screen-xl mx-auto px-6 flex flex-col items-center justify-between space-y-4">
                <div className="flex items-center justify-center space-x-6">
                    <a href="#" className="text-primary hover:text-primary-hover transition-colors">
                        About Us
                    </a>
                    <a href="#" className="text-primary hover:text-primary-hover transition-colors">
                        Privacy Policy
                    </a>
                    <a href="#" className="text-primary hover:text-primary-hover transition-colors">
                        Terms of Service
                    </a>
                    <a href="#" className="text-primary hover:text-primary-hover transition-colors">
                        Contact
                    </a>
                </div>
                <div className="border-t border-border dark:border-dark mt-6 pt-4">
                    <p className="text-sm text-center">
                        &copy; {new Date().getFullYear()} Your Company. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
