
// Inside the mobile menu and desktop navigation, add a profile settings link
{/* Profile Settings Link */}
<Link
  to="/profile/settings"
  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
    location.pathname === '/profile/settings'
      ? 'bg-indigo-50 text-indigo-600'
      : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
  }`}
  onClick={() => setMobileMenuOpen(false)}
>
  <User className="w-5 h-5" />
  Profile Settings
</Link>
