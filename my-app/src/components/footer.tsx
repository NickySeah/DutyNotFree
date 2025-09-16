import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between">
        
        {/* Left side: Logo + Text */}
        <div className="flex items-center mb-8 md:mb-0">

            <img
              src="/images/Duty1.svg"
              alt="Logo"
              className="h-32 w-32 mr-4" // bigger logo
            />

          <p className="text-lg max-w-sm">
            Built by Importers, for Importers
          </p>
        </div>

        {/* Right side: Links */}
        <div className="grid grid-cols-3 gap-12">
            <div>
            <h3 className="text-xl font-semibold text-white mb-4">Explore</h3>
            <ul className="space-y-3">
              <li><Link href="/product">Tariff Definition</Link></li>
              <li><Link href="#">Pricing</Link></li>
              <li><Link href="#">Testimonials</Link></li>
            </ul>
            </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="#">About Us</Link></li>
              <li><Link href="#">Careers</Link></li>
              <li><Link href="#">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link href="#">Help Center</Link></li>
              <li><Link href="#">Privacy Policy</Link></li>
              <li><Link href="#">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm">
        © {new Date().getFullYear()} DutyNotFree. All rights reserved.
      </div>
    </footer>
  );
}