import Link from "next/link";
import { ArrowUpCircle } from "lucide-react";

export function ProductHuntHeader() {
  return (
    <div className="bg-[#DA552F] dark:bg-[#4B3327] text-white py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-2 sm:mb-0">
          <ArrowUpCircle className="w-6 h-6 mr-2" />
          <span className="font-semibold">
            We&apos;re launching on Product Hunt today!
          </span>
        </div>
        <Link
          href="https://go.supavec.com/ph"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#DA552F] dark:text-white bg-white dark:bg-[#DA552F] hover:bg-gray-50 dark:hover:bg-[#C54E2C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#DA552F] dark:focus:ring-offset-[#4B3327] focus:ring-white dark:focus:ring-[#DA552F] transition-colors"
        >
          Support us on Product Hunt
        </Link>
      </div>
    </div>
  );
}
