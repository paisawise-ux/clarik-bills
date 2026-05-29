// Bypass the parent AdminShell layout for the login page
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
