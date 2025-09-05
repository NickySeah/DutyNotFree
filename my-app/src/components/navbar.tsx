export default function Navbar() {
  return (
    <div className="w-full flex items-center justify-between p-6 bg-gray-900 shadow-md fixed top-0 z-50">

        <img
          src="/images/Duty1.svg"
          alt="Logo"
          className="h-16 w-16 mr-4" // bigger logo
        />

      <div className="flex space-x-4">
        <a href="/login" className="text-lg font-semibold text-white">
          Login
        </a>
        <a href="/signup" className="text-lg font-semibold text-white">
          Sign Up
        </a>
      </div>
    </div>
  );
}
