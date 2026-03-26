
export default function Loading({ msg = "Loading..." }: { msg?: string }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      <p className="ml-4">{msg}</p>
    </div>
  );
}
